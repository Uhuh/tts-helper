// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod services;

use anyhow::Context;

use crate::services::{run_auth_server, start_ws_server};
use services::tts_listener::run_tts_server;

pub fn run() -> anyhow::Result<()> {
    let obs_port = "37891";
    let streamdeck_port = "17448";

    let builder = tauri::Builder::default();

    builder
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_devtools::init())
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .plugin(tauri_plugin_playback::init()?)
        .setup(|app| {
            // Run auth server
            let handle = app.handle().clone();
            std::thread::spawn(move || run_auth_server(handle));
            let handle = app.handle().clone();
            std::thread::spawn(move || run_tts_server(handle));

            tauri::async_runtime::spawn(start_ws_server(obs_port));
            tauri::async_runtime::spawn(start_ws_server(streamdeck_port));

            Ok(())
        })
        .run(tauri::generate_context!())
        .context("error while running tauri application")?;

    Ok(())
}
