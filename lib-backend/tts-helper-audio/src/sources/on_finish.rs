use std::time::Duration;

use rodio::{Sample, Source};

/// A source that calls a callback when it finishes playing.
#[derive(Clone, Debug)]
pub struct OnFinish<S, C> {
    inner: S,
    on_finish: Option<C>,
}

impl<S, C> OnFinish<S, C> {
    /// Creates a new [`OnFinish`].
    #[must_use]
    #[inline]
    pub fn new(inner: S, on_finish: C) -> Self {
        Self {
            inner,
            on_finish: Some(on_finish),
        }
    }
}

impl<S, C> Iterator for OnFinish<S, C>
where
    S: Iterator,
    C: FnOnce(),
{
    type Item = S::Item;

    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        let next = self.inner.next();

        if next.is_none() {
            if let Some(on_finish) = self.on_finish.take() {
                on_finish();
            }
        }

        next
    }

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        self.inner.size_hint()
    }
}

impl<S, C> Source for OnFinish<S, C>
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
