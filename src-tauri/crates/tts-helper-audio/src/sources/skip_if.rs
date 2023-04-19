use std::time::Duration;

use rodio::{Sample, Source};

/// A source that can be skipped via a callback.
#[derive(Clone, Debug)]
pub struct SkipWhen<S, C> {
    inner: S,
    is_skipped: C,
}

impl<S, C> SkipWhen<S, C> {
    /// Creates a new [`SkipWhen`].
    #[must_use]
    #[inline]
    pub fn new(inner: S, is_skipped: C) -> Self {
        Self { inner, is_skipped }
    }
}

impl<S, C> SkipWhen<S, C>
where
    C: Fn() -> bool,
{
    fn is_skipped(&self) -> bool {
        (self.is_skipped)()
    }
}

impl<S, C> Iterator for SkipWhen<S, C>
where
    S: Iterator,
    C: Fn() -> bool,
{
    type Item = S::Item;

    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        if self.is_skipped() {
            return None;
        }

        self.inner.next()
    }

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        if self.is_skipped() {
            return (0, Some(0));
        }

        self.inner.size_hint()
    }
}

impl<S, C> Source for SkipWhen<S, C>
where
    S: Source,
    S::Item: Sample,
    C: Fn() -> bool,
{
    #[inline]
    fn current_frame_len(&self) -> Option<usize> {
        if self.is_skipped() {
            return Some(0);
        }

        self.inner.current_frame_len()
    }

    #[inline]
    fn channels(&self) -> u16 {
        self.inner.channels()
    }

    #[inline]
    fn sample_rate(&self) -> u32 {
        self.inner.sample_rate()
    }

    #[inline]
    fn total_duration(&self) -> Option<Duration> {
        if self.is_skipped() {
            return Some(Duration::ZERO);
        }

        self.inner.total_duration()
    }
}
