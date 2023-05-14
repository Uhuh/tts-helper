// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api_result;
mod models;
mod services;

use std::{sync::Arc, time::Duration};

use anyhow::Context;
use models::{PlayingAudio, SetAudioState};
use services::{run_auth_server, AudioPlayer, Controller, DeviceService, NowPlaying};
use tracing::trace;

use crate::{api_result::ApiResult, models::AudioRequest};
use tauri::{AppHandle, Manager, State};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Registry};

#[tauri::command]
async fn play_tts(
    request: AudioRequest,
    audio_player: State<'_, AudioPlayer>,
    now_playing: State<'_, Arc<NowPlaying>>,
    app: AppHandle,
) -> ApiResult<u32> {
    let controller = Controller::default();
    controller.set_end_delay(Duration::from_millis(500));
    let id = now_playing.add(request.clone(), controller.clone());
    let on_start = {
        let app = app.clone();
        move || {
            trace!(id, "started playing");
            drop(app.emit_all("audio-start", id));
        }
    };
    let on_finish = {
        let now_playing = now_playing.inner().clone();
        move || {
            trace!(id, "done playing");
            drop(app.emit_all("audio-done", id));
            now_playing.remove(id)
        }
    };
    audio_player
        .play_tts(request, on_start, on_finish, controller)
        .await?;
    Ok(id)
}

#[tauri::command]
fn set_tts_paused(paused: bool, audio_player: State<'_, AudioPlayer>) -> ApiResult<()> {
    audio_player.set_paused(paused);
    Ok(())
}

#[tauri::command]
fn get_now_playing(now_playing: State<'_, Arc<NowPlaying>>) -> ApiResult<Vec<PlayingAudio>> {
    Ok(now_playing.get_playing())
}

#[tauri::command]
fn set_audio_state(state: SetAudioState, now_playing: State<'_, Arc<NowPlaying>>) {
    trace!(?state, "setting audio state");
    now_playing.merge_state(state);
}

fn main() -> anyhow::Result<()> {
    Registry::default()
        .with(if cfg!(debug_assertions) {
            EnvFilter::new("info,tts_helper=trace")
        } else {
            EnvFilter::new("info")
        })
        .with(tracing_subscriber::fmt::layer().compact())
        .try_init()?;

    let device_service = DeviceService::init()?;
    let default_device = device_service
        .default_output_id()
        .and_then(|id| device_service.output_device(id));
    let devices = device_service.output_device_names();
    dbg!(devices, default_device.is_some());

    let audio_player = AudioPlayer::new_default()?;

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_playback::init()?)
        .manage(audio_player)
        .manage(Arc::new(NowPlaying::default()))
        .setup(|app| {
            // Run auth server
            let handle = app.handle();
            std::thread::spawn(move || run_auth_server(handle));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            play_tts,
            set_tts_paused,
            get_now_playing,
            set_audio_state,
        ])
        .run(tauri::generate_context!())
        .context("error while running tauri application")?;

    Ok(())
}
