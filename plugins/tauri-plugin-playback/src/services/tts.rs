use base64::{Engine as _, engine::general_purpose};
use bytes::Bytes;
use serde::Deserialize;
use serde_json::json;
use tauri::http::status::{InvalidStatusCode, StatusCode};
use thiserror::Error;
use tracing::error;
use tauri_plugin_http::reqwest::Client;
use crate::models::requests::{AmazonPollyData, ElevenLabsData, StreamElementsData, TikTokData};

const STREAM_ELEMENTS_API: &str = "https://api.streamelements.com/kappa/v2/speech";
const TIKTOK_API: &str = "https://tiktok-tts.weilnet.workers.dev/api/generation";

/// A service for interacting with various TTS APIs.
#[derive(Clone, Debug)]
pub struct TtsService {
    client: Client,
}

#[derive(Clone, Debug, Deserialize)]
pub struct TikTokResponse {
    pub data: String,
}

impl TtsService {
    /// Creates a new [`TtsService`] instance.
    #[inline]
    #[must_use]
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    #[inline]
    pub async fn eleven_labs(
        &self,
        data: ElevenLabsData,
    ) -> Result<Bytes, TtsRequestError> {
        let body = json!(
            {
                "text": data.text,
                "model_id": data.model_id,
                "voice_settings": {
                    "stability": data.stability,
                    "similarity_boost": data.similarity_boost,
                }
            }
        );

        let res = self.client
            .post(data.url)
            .json(&body)
            .header("xi-api-key", data.api_key)
            .send()
            .await?;

        // Check status code
        let status = res.status();
        if status.is_client_error() || status.is_server_error() {
            return Err(TtsRequestError::BadStatusCode(status));
        }

        Ok(res.bytes().await?)
    }

    #[inline]
    pub async fn amazon_polly(
        &self,
        mut data: AmazonPollyData,
    ) -> Result<Bytes, TtsRequestError> {
        let url = data.url.get_or_insert(String::from(""));

        let res = self.client
            .get(url.clone())
            .send()
            .await?;

        // Check status code
        let status = res.status();
        if status.is_client_error() || status.is_server_error() {
            return Err(TtsRequestError::BadStatusCode(status));
        }

        Ok(res.bytes().await?)
    }

    #[inline]
    pub async fn tiktok(
        &self,
        data: TikTokData,
    ) -> Result<Bytes, TtsRequestError> {
        let body = json!(
            {
                "voice": data.voice,
                "text": data.text
            }
        );

        let res = self.client
            .post(TIKTOK_API)
            .json(&body)
            .send()
            .await?;

        let status = res.status();
        if status.is_client_error() || status.is_server_error() {
            return Err(TtsRequestError::BadStatusCode(status));
        }

        let res = serde_json::from_value::<TikTokResponse>(res.json().await?)?;
        let res = general_purpose::STANDARD_NO_PAD.decode(res.data).unwrap();

        Ok(res.into())
    }

    /// Makes a request to StreamElements.
    #[inline]
    pub async fn stream_elements(
        &self,
        data: StreamElementsData,
    ) -> Result<Bytes, TtsRequestError> {
        let res = self.client
            .get(STREAM_ELEMENTS_API)
            .query(&vec![
                ("voice", data.voice),
                ("text", data.text),
            ])
            .send()
            .await?;

        // Check status code
        let status = res.status();
        if status.is_client_error() || status.is_server_error() {
            return Err(TtsRequestError::BadStatusCode(status));
        }

        Ok(res.bytes().await?)
    }
}

/// An error that can occur during a TTS request.
#[derive(Debug, Error)]
pub enum TtsRequestError {
    /// The request failed.
    #[error("TTS request failed")]
    RequestFailed(#[from] tauri_plugin_http::reqwest::Error),

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
    DecodeError(#[from] base64::DecodeError),
}
