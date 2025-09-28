use axum::{extract::Json, routing::post, Extension, Router};
use http::{
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
    HeaderValue, Method,
};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tokio::runtime::Builder;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::{error, instrument};

#[instrument(skip_all)]
pub fn run_tts_server(app: AppHandle) {
    fn run_server_inner(app: AppHandle) -> anyhow::Result<()> {
        let rt = Builder::new_current_thread().enable_all().build()?;
        rt.block_on(listen(app))
    }

    if let Err(error) = run_server_inner(app) {
        error!(?error, "error while running tts api server: {error}")
    }
}

async fn listen(app: AppHandle) -> anyhow::Result<()> {
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(vec![CONTENT_TYPE, AUTHORIZATION, ACCEPT])
        .allow_origin("*".parse::<HeaderValue>().unwrap());

    let app = Router::new()
        .route("/tts", post(create_tts_audio))
        .route("/ai-tts", post(create_ai_tts_audio))
        .route("/ai-response", post(get_ai_response))
        .route("/react-ai-image", post(react_ai_image))
        .route("/trigger-ai-vision", post(trigger_ai_vision))
        .route("/toggle-pause-status", post(toggle_pause_status))
        .route("/skip-current-playing", post(skip_current_playing))
        .layer(
            ServiceBuilder::new()
                .layer(cors)
                .layer(Extension(app.clone())),
        );

    const PORT: u16 = 12589;
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{PORT}"))
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TtsRequest {
    pub username: String,
    pub platform: String,
    pub text: String,
    pub char_limit: Option<u16>,
}

async fn create_tts_audio(Extension(app): Extension<AppHandle>, Json(request): Json<TtsRequest>) {
    println!("received tts play request: {:?}", request);

    let _ = app.emit("api:create_tts_audio", request);
}

async fn create_ai_tts_audio(Extension(app): Extension<AppHandle>, Json(request): Json<TtsRequest>) {
    println!("received ai-tts play request: {:?}", request);

    let _ = app.emit("api:create_ai_tts_audio", request);
}

async fn trigger_ai_vision(Extension(app): Extension<AppHandle>, Json(request): Json<TtsRequest>) {
    println!("received trigger_ai_vision request: {:?}", request);

    let _ = app.emit("api:trigger_ai_vision", request);
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ImageRequest {
    pub text: Option<String>,
    pub image: String
}

async fn react_ai_image(Extension(app): Extension<AppHandle>, Json(request): Json<ImageRequest>) {
    println!("received react_ai_image request: {:?}", request);

    let _ = app.emit("api:react_ai_image", request);
}

async fn get_ai_response(Extension(app): Extension<AppHandle>, Json(request): Json<TtsRequest>) {
    println!("received get_ai_response response for request: {:?}", request);

    let _ = app.emit("api:get_ai_response", request);
}

async fn toggle_pause_status(Extension(app): Extension<AppHandle>) {
    println!("received toggle_pause_status toggle request");

    let _ = app.emit("api:toggle_pause_status", ());
}

async fn skip_current_playing(Extension(app): Extension<AppHandle>) {
    println!("received skip_current_playing skip request");

    let _ = app.emit("api:skip_current_playing", ());
}