use http::{header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE}, HeaderValue, Method};
use axum::{extract::Json, routing::{get, post}, Extension, Router};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use tokio::runtime::Builder;
use tracing::{debug, error, instrument};


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
        .route("/authenticate", post(auth_app))
        .route("/tts", post(play_tts))
        .route("/ping", get(ping_pong))
        .layer(ServiceBuilder::new().layer(cors).layer(Extension(app)));

    const PORT: u16 = 12589;
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{PORT}")).await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TtsRequest {
    pub username: String,
    pub platform: String,
    pub text: String,
    pub char_limit: u16,
}

/**
 * @TODO - Handle RAW sound bytes
 EG: VStream sound commands
 */
async fn play_tts(
    Extension(app): Extension<AppHandle>,
    Json(request): Json<TtsRequest>
) {
	println!("received tts play request: {:?}", request);

    drop(app.emit_all("api:play_tts", request));
}