use std::net::Ipv4Addr;

use axum::{extract::Path, response::Html, routing::get, Extension, Router, Server};
use tauri::{AppHandle, Manager};
use tokio::runtime::Builder;
use tracing::{debug, error, instrument};

use crate::models::AuthEvent;

/// Runs the auth server, which listens on `http://localhost:12583/auth`. It expects to receive the
/// access token as a hash fragment in the URL, and then sends it to the app via a global event.
#[instrument(skip_all)]
pub fn run_auth_server(app: AppHandle) {
    fn run_server_inner(app: AppHandle) -> anyhow::Result<()> {
        let rt = Builder::new_current_thread().enable_all().build()?;
        rt.block_on(listen(app))
    }

    if let Err(error) = run_server_inner(app) {
        error!(?error, "error while running oauth server: {error}");
    }
}

async fn listen(app: AppHandle) -> anyhow::Result<()> {
    // Create app
    let app = Router::new()
        .route("/auth/:provider", get(auth_get).post(auth_post))
        .layer(Extension(app));

    // Run server
    const PORT: u16 = 12583;
    Server::bind(&(Ipv4Addr::UNSPECIFIED, PORT).into())
        .serve(app.into_make_service())
        .await?;

    Ok(())
}

// @TODO - Handle error params to get out of "Authenticating..." states.
async fn auth_get() -> Html<&'static str> {
    const BODY: &'static str = &r#"
        <!DOCTYPE html>
        <html>
            <head>
                <title>Authenticating</title>
            </head>
            <style>
                html, body {
                    margin: 0;
                    padding: 0;

                    font-size: 24px;
                  
                    display: flex;
                    height: 100%;
                    width: 100%;
                    color: white;
                    font-family: 'Inter', sans-serif;
                    background-color: #211742;
                }

                .auth {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            </style>
            <body>
                <script>
                    if (window.location.hash) {
                        const token = window.location.hash.split('&')[0].split("=")[1];
                        fetch(window.location.href, {
                            method: "POST",
                            body: token,
                        }).then(() => {
                            document.getElementById("status").innerText = "Authenticated for TTS Helper! (You can close this window now)";
                        }).catch((err) => {
                            console.error(err);
                            document.getElementById("status").innerText = "Failed to authenticate. Check the console for more details.";
                        });
                    } else {
                        console.error("No token found in URL");
                        document.getElementById("status").innerText = "Failed to authenticate. Check the console for more details.";
                    }
                </script>
                <div class="auth">
                    <p id="status">Authenticating...</p>
                </div>
            </body>
        </html>
    "#;
    Html(BODY)
}

async fn auth_post(
    Path(provider): Path<String>,
    Extension(app): Extension<AppHandle>,
    token: String,
) {
    debug!(provider, "got auth token");
    drop(app.emit_all("access-token", AuthEvent { provider, token }));
}
