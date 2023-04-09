use serde::{Deserialize, Serialize};

use super::AudioRequest;

/// The audio that is currently playing
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PlayingAudio {
    pub id: u32,
    #[serde(flatten)]
    pub request: AudioRequest,
}
