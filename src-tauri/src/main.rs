// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod services;

use anyhow::Context;
use services::run_auth_server;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Registry};

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

            Ok(())
        })
        .run(tauri::generate_context!())
        .context("error while running tauri application")?;

    Ok(())
}
