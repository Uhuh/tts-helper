use std::{
    sync::{
        atomic::{AtomicBool, AtomicU64, Ordering},
        Arc,
    },
    time::Duration,
};

use static_assertions::assert_impl_all;

/// A controller for an audio source. This can be cloned to create multiple controllers for the same
/// audio source.
#[derive(Clone, Debug, Default)]
pub struct SourceController {
    state: Arc<SourceControllerState>,
}

assert_impl_all!(SourceController: Send, Sync);

#[derive(Debug, Default)]
struct SourceControllerState {
    skipped: AtomicBool,
}

impl SourceController {
    /// Skip this audio source.
    #[inline]
    pub fn skip(&self) {
        self.state.skipped.store(true, Ordering::Relaxed);
    }

    /// Check if this audio source is skipped.
    #[inline]
    #[must_use]
    pub fn is_skipped(&self) -> bool {
        self.state.skipped.load(Ordering::Relaxed)
    }
}

/// A controller for the playback of all audio. This can be cloned to create multiple controllers
/// for the same audio playback.
#[derive(Clone, Debug, Default)]
pub struct PlaybackController {
    state: Arc<PlaybackControllerState>,
}

assert_impl_all!(PlaybackController: Send, Sync);

#[derive(Debug, Default)]
struct PlaybackControllerState {
    end_delay_ns: AtomicU64,
    paused: AtomicBool,
}

impl PlaybackController {
    /// Sets the amount of time to pad the end of the audio source with silence.
    #[inline]
    pub fn set_end_delay(&self, delay: Duration) {
        self.state.end_delay_ns.store(
            delay.as_nanos().try_into().unwrap_or(u64::MAX),
            Ordering::Relaxed,
        );
    }

    /// Gets the amount of time to pad the end of the audio source with silence.
    #[inline]
    #[must_use]
    pub fn end_delay(&self) -> Duration {
        let nanos = self.state.end_delay_ns.load(Ordering::Relaxed);
        Duration::from_nanos(nanos)
    }

    /// Sets whether or not the audio playback is paused.
    #[inline]
    pub fn set_paused(&self, paused: bool) {
        self.state.paused.store(paused, Ordering::Relaxed);
    }

    /// Gets whether or not the audio playback is paused.
    #[inline]
    #[must_use]
    pub fn paused(&self) -> bool {
        self.state.paused.load(Ordering::Relaxed)
    }
}
