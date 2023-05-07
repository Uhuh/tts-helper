use reqwest::Url;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DetailsProvider {
    pub provider: String
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TtsMonsterData {
    pub user_id: String,
    pub key: String,
    pub message: String,
    pub ai: bool,
    pub details: DetailsProvider
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TtsMonsterDataWrapper {
    pub data: TtsMonsterData
}

/// A request to play some audio.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AudioRequest {
    /// The ID of the audio, if any.
    pub id: Option<u32>,
    // The TTS service. stream-elements / tts-monster
    pub tts: String,
    /// The URL.
    pub url: Url,
    /// ID of audio output device
    pub device: String,
    /// Volume to play tts at
    pub volume: i32,
    /// StreamElements values
    pub params: Vec<(String, String)>,
    // TTS Monster data
    // pub data: Option<TtsMonsterDataWrapper>,
}
