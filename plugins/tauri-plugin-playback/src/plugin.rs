use std::io::Cursor;
use base64::decode;

use num_complex::Complex64;
use rodio::{Decoder, DevicesError, Source};
use rustfft::FftPlanner;
use serde::Serialize;
use spectrum_analyzer::{samples_fft_to_spectrum, scaling::divide_by_N_sqrt, FrequencyLimit};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, State, Wry,
};
use tauri_plugin_http::reqwest::Client;
use thiserror::Error;
use tracing::{instrument, trace};
use tts_helper_models::requests::{ApiError, ApiResult};

use crate::{
    models::{
        audio::AudioId,
        devices::{DeviceId, OutputDeviceList},
        requests::{PlayAudioRequest, RequestAudioData, SetAudioState, SetPlaybackState},
    },
    services::{
        devices::DeviceService, fft::{calculate_mouth, max_min_mouth}, now_playing::NowPlayingService, playback::{PlaybackController, PlaybackService, SourceController, SourceEvents}, tts::TtsService
    },
};
use crate::models::requests::PlaybackState;

/// Initializes the plugin.
pub fn init() -> Result<TauriPlugin<Wry>, InitError> {
    // Create state
    let controller = PlaybackController::default();

    // Create services
    let device_service = DeviceService::init()?;
    let playback_service = PlaybackService::new(controller.clone());
    let now_playing_service = NowPlayingService::default();
    let client = Client::new();
    let tts_service = TtsService::new(client.clone());

    // Setup playback
    if let Some(device) = device_service.default_output_device() {
        playback_service.set_device(device);
    }

    // Build plugin
    let plugin = Builder::new("playback")
        .invoke_handler(generate_handler![
            list_output_devices,
            set_output_device,
            play_audio,
            set_playback_state,
            set_output_volume,
            toggle_pause,
            set_audio_state,
            list_audio,
        ])
        .setup(|app, _| {
            // Manage state
            app.manage(controller);

            // Manage services
            app.manage(device_service);
            app.manage(playback_service);
            app.manage(now_playing_service);
            app.manage(client);
            app.manage(tts_service);

            Ok(())
        })
        .build();

    Ok(plugin)
}

/// An error that can occur during plugin initialization.
#[derive(Debug, Error)]
#[non_exhaustive]
pub enum InitError {
    /// Failed to initialize the device service.
    #[error("failed to initialize device service")]
    DeviceService(#[from] DevicesError),

    /// Failed to initialize the HTTP client.
    #[error("failed to initialize HTTP client")]
    HttpClient(tauri::Error),
}

/// Gets a list of output devices.
#[tauri::command(async)]
#[instrument(skip_all)]
fn list_output_devices(device_svc: State<'_, DeviceService>) -> OutputDeviceList {
    let output_devices = device_svc.output_devices();
    OutputDeviceList { output_devices }
}

/// Sets the output device.
#[tauri::command(async)]
#[instrument(skip_all)]
fn set_output_device(
    device_id: DeviceId,
    device_svc: State<'_, DeviceService>,
    playback_svc: State<'_, PlaybackService>,
) -> ApiResult<()> {
    let device = device_svc
        .output_device(device_id)
        .ok_or_else(|| ApiError::new("unrecognized device ID"))?;

    playback_svc.set_device(device);

    Ok(())
}

/// Sets the output volume for the device.
#[tauri::command(async)]
#[instrument(skip_all)]
fn set_output_volume(volume_level: f32, playback_svc: State<'_, PlaybackService>) -> ApiResult<()> {
    playback_svc.set_volume(volume_level);

    Ok(())
}

/// Toggles the audio queue
#[tauri::command(async)]
#[instrument(skip_all)]
fn toggle_pause(playback_svc: State<'_, PlaybackService>) -> ApiResult<bool> {
    let paused = playback_svc.toggle_pause();

    Ok(paused)
}

#[derive(Serialize, Clone)]
struct AudioStart {
    id: AudioId,
    mouth_shapes: Vec<(f64, f64)>
}

/// Enqueues audio to be played.
#[tauri::command]
#[instrument(skip_all)]
async fn play_audio(
    request: PlayAudioRequest,
    playback_svc: State<'_, PlaybackService>,
    now_playing_svc: State<'_, NowPlayingService>,
    tts_svc: State<'_, TtsService>,
    app: AppHandle,
) -> ApiResult<AudioId> {
    // Get source data
    let raw = match request.data {
        RequestAudioData::Raw(raw) => decode(raw.data).unwrap(),
        RequestAudioData::StreamElements(stream_elements) => {
            tts_svc.stream_elements(stream_elements).await?.to_vec()
        }
        RequestAudioData::TikTok(tiktok) => {
            tts_svc.tiktok(tiktok).await?.to_vec()
        }
        RequestAudioData::AmazonPolly(amazon_polly) => {
            tts_svc.amazon_polly(amazon_polly).await?.to_vec()
        }
        RequestAudioData::ElevenLabs(eleven_labs) => {
            tts_svc.eleven_labs(eleven_labs).await?.to_vec()
        }
    };

    // Decode source data
    let source = Decoder::new(Cursor::new(raw.clone()))?.convert_samples();

    let source_samples = Decoder::new(Cursor::new(raw.clone()))?.convert_samples();

    let samples = source_samples.skip(0).step_by(1);

    // Enqueue source
    let controller = SourceController::default();
    let id = now_playing_svc.add(controller.clone());

    let samples = samples.collect::<Vec<f32>>();
        
    let mut complex_data: Vec<Complex64> = Vec::with_capacity(samples.len());

    // Convert samples to complex numbers
    for sample in &samples {
        complex_data.push(Complex64::new(*sample as f64, 0.0));
    }

    // Enqueue source
    let events = SourceEvents::default()
        .on_start({
            let app = app.clone();

            let mut planner = FftPlanner::new();
            let fft = planner.plan_fft_forward(complex_data.len());

            fft.process(&mut complex_data);

            let mut start = 0;
            // Creating slices of 512 size seem to look reasonable when sending mouth shape data to VTS.
            let mut end = 512;

            let mut mouth_shapes = Vec::<(f64, f64)>::new();

            let mut previous_value = 0f64;

            while end < complex_data.len() {
                let (max, min) = max_min_mouth(&samples[start..end]);
                let (form, prev) = calculate_mouth(&complex_data[start..end], previous_value);

                let mouth = max - min;
                previous_value = prev;

                mouth_shapes.push((mouth, form));

                start += 512;
                end += 512;
            }

            move || {
                trace!(id = id.0, "started playing");
                drop(app.emit("playback::audio::start", AudioStart {
                    id,
                    mouth_shapes
                }));
            }
        })
        .on_finish({
            let app = app.clone();
            let now_playing_svc = now_playing_svc.inner().clone();
            move || {
                trace!(id = id.0, "finished playing");
                now_playing_svc.remove(id);
                drop(app.emit("playback::audio::finish", id));
            }
        });
    playback_svc.enqueue(Box::new(source), controller, events);

    Ok(id)
}

/// Sets the global playback state.
#[tauri::command(async)]
#[instrument(skip_all)]
fn set_playback_state(state: SetPlaybackState, playback_controller: State<'_, PlaybackController>) -> ApiResult<PlaybackState> {
    state.apply(playback_controller.inner());
    let playback_state = SetPlaybackState::state(playback_controller.inner());

    Ok(playback_state)
}

/// Sets the state of an audio source.
#[tauri::command(async)]
#[instrument(skip_all)]
fn set_audio_state(
    state: SetAudioState,
    now_playing_svc: State<'_, NowPlayingService>,
) -> ApiResult<()> {
    let entry = now_playing_svc
        .get(state.id)
        .ok_or_else(|| ApiError::new(format_args!("no audio found with id {}", state.id.0)))?;

    state.apply(&entry.controller);

    Ok(())
}

/// Lists all queued (or playing) audio sources.
#[tauri::command(async)]
#[instrument(skip_all)]
fn list_audio(now_playing_svc: State<'_, NowPlayingService>) -> Vec<AudioId> {
    now_playing_svc
        .list()
        .into_iter()
        .map(|entry| entry.id)
        .collect::<Vec<_>>()
}
