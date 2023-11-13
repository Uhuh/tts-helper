use bytes::Bytes;
use serde::Deserialize;

/// A request to play audio.
#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayAudioRequest {
    /// The audio data.
    pub data: RequestAudioData,
}

/// The audio data for a [`PlayAudioRequest`].
#[derive(Clone, Debug, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum RequestAudioData {
    /// Raw audio data.
    Raw(RawAudioData),
    /// StreamElements request data.
    StreamElements(StreamElementsData),
    /// TikTok request data.
    TikTok(TikTokData),
    /// AmazonPolly request data.
    AmazonPolly(AmazonPollyData),
    /// ElevenLabs request data.
    ElevenLabs(ElevenLabsData),
}

/// Raw audio data.
#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawAudioData {
    /// The audio data.
    pub data: Bytes,
}

/// StreamElements request data.
#[derive(Clone, Debug, Deserialize)]
pub struct StreamElementsData {
    /// The text to speak.
    pub text: String,
    /// The voice to use.
    pub voice: String,
}

/// TikTok request data.
#[derive(Clone, Debug, Deserialize)]
pub struct TikTokData {
    /// The text to speak.
    pub text: String,
    /// The voice to use
    pub voice: String,
}

/// AmazonPolly request data.
#[derive(Clone, Debug, Deserialize)]
pub struct AmazonPollyData {
    /// Possible AmazonPolly URL.
    pub url: Option<String>,
}

/// ElevenLabs request data
#[derive(Clone, Debug, Deserialize)]
pub struct ElevenLabsData {
    /// The TTS URL
    pub url: String,
    /// The users API key
    pub api_key: String,
    /// The text to speak
    pub text: String,
    /// The model type
    pub model_id: String,
    /// Voice stability
    pub stability: f32,
    /// Voice similarity
    pub similarity_boost: f32,
}