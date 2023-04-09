// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api_result;
mod models;
mod services;

use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc, Mutex,
};

use anyhow::Context;
use services::AudioPlayer;
use tracing::trace;

use crate::{api_result::ApiResult, models::AudioRequest};
use tauri::State;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Registry};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn play_tts(
    request: AudioRequest,
    audio_player: State<'_, AudioPlayer>,
    now_playing: State<'_, Arc<NowPlaying>>,
) -> ApiResult<()> {
    let id = now_playing.add(request.clone());
    let on_done = {
        let now_playing = now_playing.inner().clone();
        move || {
            trace!(id, "done playing");
            now_playing.remove(id)
        }
    };
    audio_player.play_tts(request, on_done).await?;
    Ok(())
}

#[derive(Debug, Default)]
struct NowPlaying {
    requests: Mutex<Vec<(usize, AudioRequest)>>,
    next_id: AtomicUsize,
}

impl NowPlaying {
    /// Adds a new request to the queue.
    pub fn add(&self, request: AudioRequest) -> usize {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        self.requests.lock().unwrap().push((id, request));
        id
    }

    /// Removes a request from the queue.
    pub fn remove(&self, id: usize) {
        let mut requests = self.requests.lock().unwrap();
        requests.retain(|(i, _)| *i != id);
    }
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
        .manage(Arc::new(NowPlaying::default()))
        .invoke_handler(tauri::generate_handler![greet, play_tts])
        .run(tauri::generate_context!())
        .context("error while running tauri application")?;

    Ok(())
}
