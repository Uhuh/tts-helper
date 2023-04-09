use std::{
    future::Future,
    pin::pin,
    sync::Arc,
    task::{Context, Poll},
};

use bytes::Bytes;
use futures::{future::BoxFuture, FutureExt};
use reqwest::Client;
use tauri::async_runtime::Mutex;
use tower::{BoxError, Layer, Service};

#[derive(Clone, Default)]
pub struct DownloadAudioLayer {
    client: Client,
}

impl<S> Layer<S> for DownloadAudioLayer {
    type Service = DownloadAudioService<S>;

    fn layer(&self, service: S) -> Self::Service {
        DownloadAudioService {
            next: Arc::new(Mutex::new(service)),
            client: self.client.clone(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct DownloadAudioService<S> {
    next: Arc<Mutex<S>>, // TODO: maybe don't use mutex
    client: Client,
}

impl<S> Service<AudioRequest> for DownloadAudioService<S>
where
    S: Service<Bytes, Error = BoxError> + Send + 'static,
    S::Future: Send + 'static,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future = BoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        let fut = pin!(self.next.lock());
        let Poll::Ready(mut next) = fut.poll(cx) else {
            return Poll::Pending;
        };

        next.poll_ready(cx)
    }

    fn call(&mut self, req: AudioRequest) -> Self::Future {
        let client = self.client.clone();
        let next = self.next.clone();
        async move {
            let bytes = fetch_audio(req, client).await?;
            next.lock().await.call(bytes).await
        }
        .boxed()
    }
}

/// A request to play some audio.
pub struct AudioRequest {
    pub message: String,
}

async fn fetch_audio(req: AudioRequest, client: Client) -> Result<Bytes, BoxError> {
    let response = client
        .get("https://api.streamelements.com/kappa/v2/speech")
        .query(&[("voice", "Brian"), ("text", &req.message)])
        .send()
        .await?;
    let bytes = response.bytes().await?;
    Ok(bytes)
}
