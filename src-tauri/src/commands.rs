use rand::random;
use serde::Deserialize;
use std::time::{Duration, Instant};
use vmc::{ApplyBlendShapes, BlendShape, IntoOSCPacket, VMCSocket};
use vmc::rosc::{OscMessage, OscPacket, OscType};

pub struct VMCState {
    performer: VMCSocket,
}

enum MyOscPacket {
    VNyan(VNyanParam),
    Blend(BlendShape),
}

impl IntoOSCPacket for MyOscPacket {
    fn into_osc_packet(self) -> OscPacket {
        match self {
            MyOscPacket::VNyan(v) => v.into_osc_packet(),
            MyOscPacket::Blend(b) => b.into_osc_packet(),
        }
    }
}

struct VNyanParam {
    pub key: String,
    pub value: f32,
}

impl VNyanParam {
    pub fn new(key: impl ToString, value: f32) -> Self { Self { key: key.to_string(), value } }
}

impl IntoOSCPacket for VNyanParam {
    fn into_osc_packet(self) -> OscPacket {
        OscPacket::Message(OscMessage {
            addr: "/VNyan/Param/Float".to_string(),
            args: vec![OscType::String(self.key), OscType::Float(self.value)],
        })
    }
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

fn make_osc_packet(send_to_vnyan: bool, param: &String, value: f32) -> MyOscPacket {
    if send_to_vnyan {
        MyOscPacket::VNyan(VNyanParam::new(&param, value))
    } else {
        MyOscPacket::Blend(BlendShape::new(&param, value))
    }
}

#[tauri::command]
pub async fn test_vmc_connection(
    mouth_params: BlendShapeParams,
    send_to_vnyan: bool,
    vmc_state: tauri::State<'_, VMCState>,
) -> Result<(), String> {
    let performer = &vmc_state.performer;

    let start = Instant::now();

    println!("Starting VMC connection test.");

    loop {
        let open = random();
        let form = random();

        let mouth_a = make_osc_packet(send_to_vnyan, &mouth_params.0, open);
        let mouth_e = make_osc_packet(send_to_vnyan, &mouth_params.1, form);

        performer
            .send(mouth_a)
            .await
            .map_err(|e| e.to_string())?;

        performer
            .send(mouth_e)
            .await
            .map_err(|e| e.to_string())?;

        performer
            .send(ApplyBlendShapes)
            .await
            .map_err(|e| e.to_string())?;

        tokio::time::sleep(Duration::from_millis(20)).await;

        if start.elapsed().as_secs() > 5 {
            break;
        }
    }

    // Most likely due to the nature of UDP and how quickly we send data
    // We need to have a massive delay before we send the "reset" parameters, or else, somehow,
    // request from earlier could apply _after_ the resets do, leaving an open mouth.
    tokio::time::sleep(Duration::from_millis(200)).await;

    let empty_mouth_a = make_osc_packet(send_to_vnyan, &mouth_params.0, 0.0);
    let empty_mouth_e = make_osc_packet(send_to_vnyan, &mouth_params.1, 0.0);

    performer
        .send(empty_mouth_a)
        .await
        .map_err(|e| e.to_string())?;
    performer
        .send(empty_mouth_e)
        .await
        .map_err(|e| e.to_string())?;
    performer
        .send(ApplyBlendShapes)
        .await
        .map_err(|e| e.to_string())?;

    println!("VMC connection test finished.");

    Ok(())
}

#[tauri::command]
pub async fn reset_vmc_mouth(
    mouth_params: BlendShapeParams,
    send_to_vnyan: bool,
    vmc_state: tauri::State<'_, VMCState>,
) -> Result<(), String> {
    let performer = &vmc_state.performer;

    let start = Instant::now();

    loop {
        let mouth_a = make_osc_packet(send_to_vnyan, &mouth_params.0, 0.0);
        let mouth_e = make_osc_packet(send_to_vnyan, &mouth_params.1, 0.0);

        performer
            .send(mouth_a)
            .await
            .map_err(|e| e.to_string())?;
        performer
            .send(mouth_e)
            .await
            .map_err(|e| e.to_string())?;
        performer
            .send(ApplyBlendShapes)
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
pub async fn update_vmc_connection(
    port: u32,
    host: String,
    vmc_state: tauri::State<'_, VMCState>,
) -> Result<(), ()> {
    let performer = &vmc_state.performer;
    let connection_string = format!("{host}:{port}");

    println!(
        "Trying to connect to VMC via: {}",
        connection_string.clone()
    );

    performer.connect(connection_string).await.unwrap();

    Ok(())
}

#[tauri::command]
pub async fn send_vmc_mouth(
    mouth_data: BlendShapeMouthData,
    send_to_vnyan: bool,
    vmc_state: tauri::State<'_, VMCState>,
) -> Result<(), String> {
    let performer = &vmc_state.performer;

    let mouth_a = make_osc_packet(send_to_vnyan, &mouth_data.mouth_a_name, mouth_data.mouth_a_value);
    let mouth_e = make_osc_packet(send_to_vnyan, &mouth_data.mouth_e_name, mouth_data.mouth_e_value);

    performer
        .send(mouth_a)
        .await
        .map_err(|e| e.to_string())?;

    performer
        .send(mouth_e)
        .await
        .map_err(|e| e.to_string())?;

    performer
        .send(ApplyBlendShapes)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
