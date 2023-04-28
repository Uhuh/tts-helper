use serde::{Deserialize, Serialize};

use super::AudioRequest;

/// The audio that is currently playing
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PlayingAudio {
    pub id: u32,
    #[serde(flatten)]
    pub request: AudioRequest,
}


#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TtsMonsterResponse {
    pub data: Data,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Data {
    pub link: String,
    pub warning: String,
}
