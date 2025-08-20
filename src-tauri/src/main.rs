#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod services;

use std::thread;
use crate::services::{run_auth_server, start_ws_server};
use rand::random;
use services::tts_listener::run_tts_server;
use std::time::{Duration, Instant};
use axum::routing::connect;
use tauri::{generate_handler, Manager};
use vmc::{performer, ApplyBlendShapes, BlendShape, StandardVRMBlendShape, Time, VMCSocket};

pub struct VMCState {
    performer: VMCSocket,
}

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
        .invoke_handler(generate_handler![update_vmc_connection, test_vmc_connection, send_vmc_mouth])
        .setup(|app| {
            println!("Generating from main.rs");

            app.manage(VMCState { performer });

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

#[tauri::command]
async fn test_vmc_connection(vmc_state: tauri::State<'_, VMCState>) -> Result<(), ()> {
    let performer = &vmc_state.performer;

    let start = Instant::now();

    loop {
        let open = random();
        let form = random();

        performer
            .send(BlendShape::new(StandardVRMBlendShape::A, open))
            .await
            .expect("Failed to send blendshapes via VMC protocol during testing.");

        performer
            .send(BlendShape::new(StandardVRMBlendShape::E, form))
            .await
            .expect("Failed to send blendshapes via VMC protocol during testing.");

        tokio::time::sleep(Duration::from_millis(20)).await;

        if start.elapsed().as_secs() > 5 {
            break;
        }
    }

    tokio::time::sleep(Duration::from_millis(20)).await;

    performer
        .send(BlendShape::new(StandardVRMBlendShape::A, 0.0))
        .await
        .expect("Failed to send blendshapes via VMC protocol during testing.");
    performer
        .send(BlendShape::new(StandardVRMBlendShape::E, 0.0))
        .await
        .expect("Failed to send blendshapes via VMC protocol during testing.");
    performer
        .send(BlendShape::new(StandardVRMBlendShape::I, 0.0))
        .await
        .expect("Failed to send blendshapes via VMC protocol during testing.");
    performer
        .send(BlendShape::new(StandardVRMBlendShape::O, 0.0))
        .await
        .expect("Failed to send blendshapes via VMC protocol during testing.");

    performer.send(ApplyBlendShapes).await.expect("Failed to send blendshapes via VMC protocol during testing.");;

    Ok(())
}

#[tauri::command]
async fn update_vmc_connection(port: u32, host: String, vmc_state: tauri::State<'_, VMCState>) -> Result<(), ()> {
    let performer = &vmc_state.performer;
    let connection_string = format!("{host}:{port}");

    println!("Trying to connect to VMC via: {}", connection_string.clone());

    performer.connect(connection_string).await.unwrap();

    Ok(())
}

#[tauri::command]
async fn send_vmc_mouth(params: (f32, f32), vmc_state: tauri::State<'_, VMCState>) -> Result<(), ()> {
    let performer = &vmc_state.performer;

    performer
        .send(BlendShape::new(StandardVRMBlendShape::A, params.0))
        .await
        .expect("Failed to send blendshapes via VMC protocol during testing.");

    performer
        .send(BlendShape::new(StandardVRMBlendShape::E, params.1))
        .await
        .expect("Failed to send blendshapes via VMC protocol during testing.");

    Ok(())
}