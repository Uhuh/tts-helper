use std::collections::HashMap;

use bytes::Bytes;
use tauri::{
    api::http::{Client, HttpRequestBuilder},
    http::{
        method::Method,
        status::{InvalidStatusCode, StatusCode},
    },
};
use thiserror::Error;

use crate::models::requests::StreamElementsData;

const STREAM_ELEMENTS_API: &str = "https://api.streamelements.com/kappa/v2/speech";

macro_rules! hm {
    ($($key:expr => $value:expr),* $(,)?) => {{
        let mut map = HashMap::new();
        $(map.insert($key.into(), $value.into());)*
        map
    }};
}

/// A service for interacting with various TTS APIs.
#[derive(Clone, Debug)]
pub struct TtsService {
    client: Client,
}

impl TtsService {
    /// Creates a new [`TtsService`] instance.
    #[inline]
    #[must_use]
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    /// Makes a request to StreamElements.
    #[inline]
    pub async fn stream_elements(
        &self,
        data: StreamElementsData,
    ) -> Result<Bytes, TtsRequestError> {
        // Perform request
        let req = HttpRequestBuilder::new(Method::GET.as_str(), STREAM_ELEMENTS_API)?.query(hm! {
            "voice" => data.voice,
            "text" => data.text,
        });
        let res = self.client.send(req).await?.bytes().await?;

        // Check status code
        let status = StatusCode::from_u16(res.status)?;
        if status.is_client_error() || status.is_server_error() {
            return Err(TtsRequestError::BadStatusCode(status));
        }

        Ok(res.data.into())
    }
}

/// An error that can occur during a TTS request.
#[derive(Debug, Error)]
pub enum TtsRequestError {
    /// The request failed.
    #[error("TTS request failed")]
    RequestFailed(#[from] tauri::api::Error),

    /// The request returned an invalid status code.
    #[error("TTS request returned an invalid status code: {0}")]
    InvalidStatusCode(#[from] InvalidStatusCode),

    /// The request returned an error status.
    #[error("TTS request returned an error status: {0}")]
    BadStatusCode(StatusCode),
}
