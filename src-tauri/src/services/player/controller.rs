use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};

/// A controller for an audio source. This can be cloned to create multiple controllers for the same
/// audio source.
#[derive(Clone, Debug, Default)]
pub struct Controller {
    state: Arc<ControllerState>,
}

impl Controller {
    /// Skip this audio source.
    pub fn skip(&self) {
        self.state.skipped.store(true, Ordering::Relaxed);
    }

    /// Check if this audio source is skipped.
    pub fn is_skipped(&self) -> bool {
        self.state.skipped.load(Ordering::Relaxed)
    }
}

#[derive(Debug, Default)]
struct ControllerState {
    skipped: AtomicBool,
}
