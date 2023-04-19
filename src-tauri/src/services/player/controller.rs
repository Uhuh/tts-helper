use std::{
    sync::{
        atomic::{AtomicBool, AtomicU64, Ordering},
        Arc,
    },
    time::Duration,
};

/// A controller for an audio source. This can be cloned to create multiple controllers for the same
/// audio source.
#[derive(Clone, Debug, Default)]
pub struct Controller {
    state: Arc<ControllerState>,
}

impl Controller {
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
}

#[derive(Debug, Default)]
struct ControllerState {
    skipped: AtomicBool,
    end_delay_ns: AtomicU64,
}
