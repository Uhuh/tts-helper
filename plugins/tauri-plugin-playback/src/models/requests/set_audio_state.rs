use serde::Deserialize;

use crate::services::playback::SourceController;

/// Sets the state of an audio source.
#[derive(Clone, Debug, Default, Deserialize)]
pub struct SetAudioState {
    /// The ID of the audio source.
    pub id: u64,

    /// Whether the audio source is skipped.
    #[serde(default)]
    pub skip: Option<bool>,
}

impl SetAudioState {
    /// Applies the audio state to the given controller.
    #[inline]
    pub fn apply(&self, controller: &SourceController) {
        if self.skip == Some(true) {
            controller.skip();
        }
    }
}
