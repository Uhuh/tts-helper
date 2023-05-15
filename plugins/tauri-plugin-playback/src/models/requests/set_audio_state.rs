use serde::Deserialize;

use crate::{models::audio::AudioId, services::playback::SourceController};

/// Sets the state of an audio source.
#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetAudioState {
    /// The ID of the audio source.
    pub id: AudioId,

    /// Whether the audio source is skipped.
    #[serde(default)]
    pub skipped: Option<bool>,
}

impl SetAudioState {
    /// Applies the audio state to the given controller.
    #[inline]
    pub fn apply(&self, controller: &SourceController) {
        if self.skipped == Some(true) {
            controller.skip();
        }
    }
}
