use std::net::Ipv4Addr;
use std::sync::Arc;

use axum::{routing::get, Router, Server};
use axum::extract::State;
use axum::extract::ws::{WebSocket, WebSocketUpgrade};
use axum::response::{Response, IntoResponse};
use tokio::runtime::Builder;
use tokio::sync::broadcast;
use tracing::{error, instrument};
use futures::{sink::SinkExt, stream::StreamExt};

struct AppState {
    tx: broadcast::Sender<String>,
}


/// Runs the auth server, which listens on `http://localhost:12583/auth`. It expects to receive the
/// access token as a hash fragment in the URL, and then sends it to the app via a global event.
#[instrument(skip_all)]
pub fn run_websocket_server() {
    fn run_server_inner() -> anyhow::Result<()> {
        let rt = Builder::new_current_thread().enable_all().build()?;
        rt.block_on(listen())
    }

    if let Err(error) = run_server_inner() {
        error!(?error, "error while running oauth server: {error}");
    }
}

async fn handler(ws: WebSocketUpgrade, State(state): State<Arc<AppState>>) -> Response {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(mut socket: WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();

    while let Some(msg) = receiver.recv().await {
        let msg = if let Ok(msg) = msg {
            println!("{:?}", msg);
            msg
        } else {
            // client disconnected
            return;
        };

        if sender.send(msg).await.is_err() {
            // client disconnected
            return;
        }
    }

    let mut rx = state.tx.subscribe();

    let msg = format!("Hello world");
    tracing::debug!("{msg}");

    let _ = state.tx.send(msg);
}

async fn listen() -> anyhow::Result<()> {
    let (tx, _rx) = broadcast::channel(5);

    let app_state = Arc::new(AppState { tx });
    
    // Create app
    let app = Router::new()
        .route("/ws", get(handler))
        .with_state(app_state);

    // Run server
    const PORT: u16 = 12683;
    Server::bind(&(Ipv4Addr::UNSPECIFIED, PORT).into())
        .serve(app.into_make_service())
        .await?;

    Ok(())
}
