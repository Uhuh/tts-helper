// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio_player;
mod services;

use anyhow::Context;
use audio_player::AudioPlayer;

mod api_result;
use api_result::ApiResult;
use services::AudioRequest;
use tauri::State;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Registry};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn play_tts(request: AudioRequest, audio_player: State<'_, AudioPlayer>) -> ApiResult<()> {
    audio_player.play_tts(request).await?;
    Ok(())
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

    let audio_player = AudioPlayer::new_default()?;

    tauri::Builder::default()
        .manage(audio_player)
        .invoke_handler(tauri::generate_handler![greet, play_tts])
        .run(tauri::generate_context!())
        .context("error while running tauri application")?;

    Ok(())
}
