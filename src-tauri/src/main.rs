// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Cursor;

use reqwest::Client;
use rodio::{OutputStream, Sink, Decoder};

mod api_result;
use api_result::ApiResult;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn play_tts(url: String) -> ApiResult<()> {
    let client = Client::new();
    let source = client
        .get(url)
        .send()
        .await?
        .bytes()
        .await?;

    let (_stream, stream_handle) = OutputStream::try_default()?;
    let sink = Sink::try_new(&stream_handle)?;
    let source = Decoder::new(Cursor::new(source))?;
    sink.append(source);
    sink.sleep_until_end();

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, play_tts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
