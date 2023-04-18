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
    pub fn set_padding(&self, padding: Duration) {
        self.state.padding_ns.store(
            padding.as_nanos().try_into().unwrap_or(u64::MAX),
            Ordering::Relaxed,
        );
    }

    /// Gets the amount of time to pad the end of the audio source with silence.
    #[inline]
    #[must_use]
    pub fn padding(&self) -> Duration {
        let nanos = self.state.padding_ns.load(Ordering::Relaxed);
        Duration::from_nanos(nanos)
    }

    /// Gets the amount of samples to pad the end of the audio source with silence.
    /// 
    /// ## Note
    /// 
    /// The sample rate is number of samples per second.
    pub fn padding_samples(&self, sample_rate: u32) -> u64 {
        let nanos = self.state.padding_ns.load(Ordering::Relaxed);
        let samples = nanos.saturating_mul(sample_rate.into()) / 1_000_000_000;
        samples
    }
}

#[derive(Debug, Default)]
struct ControllerState {
    skipped: AtomicBool,
    padding_ns: AtomicU64,
}
