#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod services;
mod commands;

use crate::services::{run_auth_server, start_ws_server};
use services::tts_listener::run_tts_server;
use tauri::{generate_handler, Manager};
use vmc::performer;

#[tokio::main]
pub async fn main() -> anyhow::Result<()> {
    let obs_port = "37891";
    let streamdeck_port = "17448";

    let builder = tauri::Builder::default();
    let performer = performer!("127.0.0.1:39539").await?;

    builder
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_devtools::init())
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .plugin(tauri_plugin_playback::init()?)
        .plugin(tauri_plugin_cors_fetch::init())
        .invoke_handler(generate_handler![commands::update_vmc_connection, commands::test_vmc_connection, commands::send_vmc_mouth, commands::reset_vmc_mouth])
        .setup(|app| {
            println!("Generating from main.rs");

            app.manage(commands::VMCState::new(performer));

            // Run auth server
            let handle = app.handle().clone();
            std::thread::spawn(move || run_auth_server(handle));
            let handle = app.handle().clone();
            std::thread::spawn(move || run_tts_server(handle));

            tauri::async_runtime::spawn(start_ws_server(obs_port));
            tauri::async_runtime::spawn(start_ws_server(streamdeck_port));

            Ok(())
        })
        .run(tauri::generate_context!())?;

    Ok(())
}
