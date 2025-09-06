use std::time::{Duration, Instant};
use rand::random;
use serde::Deserialize;
use vmc::{BlendShape, VMCSocket};

pub struct VMCState {
    performer: VMCSocket,
}

impl VMCState {
    pub fn new(performer: VMCSocket) -> Self {
        Self { performer }
    }
}

#[derive(Deserialize)]
pub struct BlendShapeParams(String, String);

#[derive(Deserialize)]
pub struct BlendShapeMouthData {
    mouth_a_name: String,
    mouth_a_value: f32,
    mouth_e_name: String,
    mouth_e_value: f32,
}

#[tauri::command]
pub async fn test_vmc_connection(mouth_params: BlendShapeParams, vmc_state: tauri::State<'_, VMCState>) -> Result<(), String> {
    let performer = &vmc_state.performer;

    let start = Instant::now();

    println!("Starting VMC connection test.");

    loop {
        let open = random();
        let form = random();

        performer
            .send(BlendShape::new(&mouth_params.0, open))
            .await
            .map_err(|e| e.to_string())?;

        performer
            .send(BlendShape::new(&mouth_params.1, form))
            .await
            .map_err(|e| e.to_string())?;

        tokio::time::sleep(Duration::from_millis(60)).await;

        if start.elapsed().as_secs() > 5 {
            break;
        }
    }

    // Most likely due to the nature of UDP and how quickly we send data
    // We need to have a massive delay before we send the "reset" parameters, or else, somehow,
    // request from earlier could apply _after_ the resets do, leaving an open mouth.
    tokio::time::sleep(Duration::from_millis(200)).await;

    performer
        .send(BlendShape::new(&mouth_params.0, 0.0))
        .await
        .map_err(|e| e.to_string())?;
    performer
        .send(BlendShape::new(&mouth_params.1, 0.0))
        .await
        .map_err(|e| e.to_string())?;

    println!("VMC connection test finished.");

    Ok(())
}

#[tauri::command]
pub async fn reset_vmc_mouth(mouth_params: BlendShapeParams, vmc_state: tauri::State<'_, VMCState>) -> Result<(), String> {
    let performer = &vmc_state.performer;

    let start = Instant::now();

    loop {
        performer
            .send(BlendShape::new(&mouth_params.0, 0.0))
            .await
            .map_err(|e| e.to_string())?;
        performer
            .send(BlendShape::new(&mouth_params.1, 0.0))
            .await
            .map_err(|e| e.to_string())?;

        tokio::time::sleep(Duration::from_millis(20)).await;

        if start.elapsed().as_millis() > 200 {
            break;
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn update_vmc_connection(port: u32, host: String, vmc_state: tauri::State<'_, VMCState>) -> Result<(), ()> {
    let performer = &vmc_state.performer;
    let connection_string = format!("{host}:{port}");

    println!("Trying to connect to VMC via: {}", connection_string.clone());

    performer.connect(connection_string).await.unwrap();

    Ok(())
}

#[tauri::command]
pub async fn send_vmc_mouth(mouth_data: BlendShapeMouthData, vmc_state: tauri::State<'_, VMCState>) -> Result<(), String> {
    let performer = &vmc_state.performer;

    performer
        .send(BlendShape::new(mouth_data.mouth_a_name, mouth_data.mouth_a_value))
        .await
        .map_err(|e| e.to_string())?;

    performer
        .send(BlendShape::new(mouth_data.mouth_e_name, mouth_data.mouth_e_value))
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}