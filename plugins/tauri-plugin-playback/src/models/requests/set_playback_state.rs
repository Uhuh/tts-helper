use std::time::Duration;

use serde::{Deserialize, Serialize};
use serde_with::{serde_as, DurationMilliSeconds};

use crate::services::playback::PlaybackController;

#[serde_as]
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaybackState {
    paused: bool,
    end_delay: Duration,
}

/// Sets the global playback state.
#[serde_as]
#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetPlaybackState {
    /// Sets the amount of time to pad the end of the audio source with silence.
    #[serde_as(as = "Option<DurationMilliSeconds>")]
    #[serde(default)]
    pub end_delay: Option<Duration>,

    /// Sets whether audio playback is paused.
    #[serde(default)]
    pub paused: Option<bool>,
}

impl SetPlaybackState {
    /// Applies the playback state to the given controller.
    #[inline]
    pub fn apply(&self, controller: &PlaybackController) {
        if let Some(end_delay) = self.end_delay {
            controller.set_end_delay(end_delay);
        }

        if let Some(paused) = self.paused {
            controller.set_paused(paused);
        }
    }

    #[inline]
    pub fn state(controller: &PlaybackController) -> PlaybackState {
        PlaybackState {
            paused: controller.paused(),
            end_delay: controller.end_delay(),
        }
    }
}
