use bytes::Bytes;
use serde::{Deserialize, Serialize};

/// A request to play audio.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayAudioRequest {
    /// The audio data.
    pub data: RequestAudioData,
}

/// The audio data for a [`PlayAudioRequest`].
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum RequestAudioData {
    /// Raw audio data.
    Raw(RawAudioData),
    /// Streamlabs request data.
    Streamlabs(Streamlabs),
    /// TikTok request data.
    TikTok(TikTokData),
    /// AmazonPolly request data.
    AmazonPolly(AmazonPollyData),
    /// ElevenLabs request data.
    ElevenLabs(ElevenLabsData),
    /// TTS Monster request data.
    TtsMonster(TTSMonsterData),
}

/// Raw audio data.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RawAudioData {
    /// The audio data.
    pub data: Bytes,
}

/// Streamlabs request data.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Streamlabs {
    /// The text to speak.
    pub text: String,
    /// The voice to use.
    pub voice: String,
}

/// TikTok request data.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TikTokData {
    /// The text to speak.
    pub text: String,
    /// The voice to use
    pub voice: String,
}

/// AmazonPolly request data.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct AmazonPollyData {
    /// Possible AmazonPolly URL.
    pub url: Option<String>,
}

/// ElevenLabs request data
#[derive(Clone, Debug, Deserialize, Serialize)]
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

/// TTS Monster request data
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TTSMonsterData {
  /// The users ID.
  pub user_id: String,
  /// The users key.
  pub key: String,
  /// The message to speak.
  pub message: String,
  /// If to use AI voices or not.
  pub is_ai: bool,
}