// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod services;

use anyhow::Context;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Registry};
use crate::services::{run_auth_server, start_obs_server};

fn main() -> anyhow::Result<()> {
    Registry::default()
        .with(if cfg!(debug_assertions) {
            EnvFilter::new("info,tts_helper=trace")
        } else {
            EnvFilter::new("info")
        })
        .with(tracing_subscriber::fmt::layer().compact())
        .try_init()?;

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_playback::init()?)
        .setup(|app| {
            // Run auth server
            let handle = app.handle();
            std::thread::spawn(move || run_auth_server(handle));
            tauri::async_runtime::spawn(start_obs_server());
            //std::thread::spawn(move || run_websocket_server());

            Ok(())
        })
        .run(tauri::generate_context!())
        .context("error while running tauri application")?;

    Ok(())
}
