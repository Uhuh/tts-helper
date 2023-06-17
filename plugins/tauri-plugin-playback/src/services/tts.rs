use std::collections::HashMap;

use bytes::Bytes;
use serde::Deserialize;
use serde_json::json;
use tauri::{
    api::http::{Client, HttpRequestBuilder, Body},
    http::{
        method::Method,
        status::{InvalidStatusCode, StatusCode}, header::{HeaderValue},
    },
};
use thiserror::Error;
use tracing::{error};
use base64::{Engine as _, engine::general_purpose};
use crate::models::requests::{StreamElementsData, TikTokData};

const STREAM_ELEMENTS_API: &str = "https://api.streamelements.com/kappa/v2/speech";
const TIKTOK_API: &str = "https://tiktok-tts.weilnet.workers.dev/api/generation";

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

#[derive(Clone, Debug, Deserialize)]
pub struct TikTokResponse {
    pub success: bool,
    pub data: String,
    pub error: Option<String>,
}

impl TtsService {
    /// Creates a new [`TtsService`] instance.
    #[inline]
    #[must_use]
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    #[inline]
    pub async fn tiktok(
        &self,
        data: TikTokData,
    ) -> Result<Bytes, TtsRequestError> {

        let req = HttpRequestBuilder::new(Method::POST.as_str(), TIKTOK_API)?
        .header("Content-Type", HeaderValue::from_static("application/json"))?
        .body(Body::Json(json!(
            {
                "voice": data.voice,
                "text": data.text
            }
        )));

        let res = self.client.send(req).await?.read().await?;
        
        let status = StatusCode::from_u16(res.status)?;
        if status.is_client_error() || status.is_server_error() {
            return Err(TtsRequestError::BadStatusCode(status));
        }
        
        let res = serde_json::from_value::<TikTokResponse>(res.data)?;
        let res = general_purpose::STANDARD_NO_PAD.decode(res.data).unwrap();

        Ok(res.into())
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

    /// The request failed to parse with serde 
    #[error("Serde error returned: {0}")]
    Error(#[from] serde_json::Error),

    /// The request failed to decode the b64
    #[error("Decoding error returned: {0}")]
    DecodeError(#[from] base64::DecodeError)
}
