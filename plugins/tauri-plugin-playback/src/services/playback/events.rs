use static_assertions::assert_impl_all;

/// Events triggered by source playback.
#[derive(Default)]
pub struct SourceEvents {
    on_start: Option<Box<dyn FnOnce() + Send>>,
    on_finish: Option<Box<dyn FnOnce() + Send>>,
}

assert_impl_all!(SourceEvents: Send);

impl SourceEvents {
    /// Sets a callback to be called when the source starts playing.
    pub fn on_start<F>(mut self, f: F) -> Self
    where
        F: FnOnce() + Send + 'static,
    {
        self.on_start = Some(Box::new(f));
        self
    }

    /// Sets a callback to be called when the source finishes playing.
    pub fn on_finish<F>(mut self, f: F) -> Self
    where
        F: FnOnce() + Send + 'static,
    {
        self.on_finish = Some(Box::new(f));
        self
    }

    /// Takes the start callback.
    pub fn take_start(&mut self) -> Box<dyn FnOnce() + Send> {
        self.on_start.take().unwrap_or_else(|| Box::new(|| {}))
    }

    /// Takes the finish callback.
    pub fn take_finish(&mut self) -> Box<dyn FnOnce() + Send> {
        self.on_finish.take().unwrap_or_else(|| Box::new(|| {}))
    }
}
