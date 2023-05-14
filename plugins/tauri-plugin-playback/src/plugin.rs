use std::io::Cursor;

use rodio::{Decoder, DevicesError, Source};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, State, Wry,
};
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
        devices::DeviceService,
        now_playing::NowPlayingService,
        playback::{PlaybackController, PlaybackService, SourceController, SourceEvents},
    },
};

/// Initializes the plugin.
pub fn init() -> Result<TauriPlugin<Wry>, InitError> {
    // Create state
    let controller = PlaybackController::default();

    // Create services
    let device_service = DeviceService::init()?;
    let playback_service = PlaybackService::new(controller.clone());
    let now_playing_service = NowPlayingService::default();

    let plugin = Builder::new("playback")
        .invoke_handler(generate_handler![
            list_output_devices,
            set_output_device,
            play_audio,
            set_playback_state,
            set_audio_state,
            list_audio,
        ])
        .setup(|app| {
            // Manage state
            app.manage(controller);

            // Manage services
            app.manage(device_service);
            app.manage(playback_service);
            app.manage(now_playing_service);

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
}

/// Gets a list of output devices.
#[tauri::command(async)]
#[instrument(skip_all)]
fn list_output_devices(device_svc: State<'_, DeviceService>) -> OutputDeviceList {
    let output_devices = device_svc.output_device_infos();
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

/// Enqueues audio to be played.
#[tauri::command(async)]
#[instrument(skip_all)]
fn play_audio(
    request: PlayAudioRequest,
    playback_svc: State<'_, PlaybackService>,
    now_playing_svc: State<'_, NowPlayingService>,
    app: AppHandle,
) -> ApiResult<AudioId> {
    // Decode source data
    let source = match request.data {
        RequestAudioData::Raw(raw) => Decoder::new(Cursor::new(raw.data))?,
    };
    let source = source.convert_samples();

    // Enqueue source
    let controller = SourceController::default();
    let id = now_playing_svc.add(controller.clone());

    // Enqueue source
    let events = SourceEvents::default()
        .on_start({
            let app = app.clone();
            move || {
                trace!(id = id.0, "started playing");
                drop(app.emit_all("playback::audio::start", id));
            }
        })
        .on_finish({
            let app = app.clone();
            let now_playing_svc = now_playing_svc.inner().clone();
            move || {
                trace!(id = id.0, "finished playing");
                now_playing_svc.remove(id);
                drop(app.emit_all("playback::audio::finish", id));
            }
        });
    playback_svc.enqueue(Box::new(source), controller, events);

    Ok(id)
}

/// Sets the global playback state.
#[tauri::command(async)]
#[instrument(skip_all)]
fn set_playback_state(state: SetPlaybackState, playback_controller: State<'_, PlaybackController>) {
    state.apply(playback_controller.inner());
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
