use std::time::Duration;

use rodio::{Sample, Source};

/// A source that calls a callback when it starts playing.
#[derive(Clone, Debug)]
pub struct OnStart<S, C> {
    inner: S,
    on_start: Option<C>,
}

impl<S, C> OnStart<S, C> {
    /// Creates a new [`OnStart`].
    #[must_use]
    #[inline]
    pub fn new(inner: S, on_start: C) -> Self {
        Self {
            inner,
            on_start: Some(on_start),
        }
    }
}

impl<S, C> Iterator for OnStart<S, C>
where
    S: Iterator,
    C: FnOnce(),
{
    type Item = S::Item;

    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        if let Some(on_start) = self.on_start.take() {
            on_start();
        }

        self.inner.next()
    }

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        self.inner.size_hint()
    }
}

impl<S, C> Source for OnStart<S, C>
where
    S: Source,
    S::Item: Sample,
    C: FnOnce(),
{
    fn current_frame_len(&self) -> Option<usize> {
        self.inner.current_frame_len()
    }

    fn channels(&self) -> u16 {
        self.inner.channels()
    }

    fn sample_rate(&self) -> u32 {
        self.inner.sample_rate()
    }

    fn total_duration(&self) -> Option<Duration> {
        self.inner.total_duration()
    }
}
