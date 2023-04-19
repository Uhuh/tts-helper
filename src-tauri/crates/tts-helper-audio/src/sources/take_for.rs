use std::time::Duration;

use rodio::{Sample, Source};

/// A source that takes up to a certain amount of time from another source.
#[derive(Clone, Debug)]
pub struct TakeFor<S, C> {
    inner: S,
    get_duration: C,
    taken_samples: usize,
}

impl<S, C> TakeFor<S, C> {
    /// Creates a new [`TakeFor`].
    #[must_use]
    #[inline]
    pub fn new(inner: S, get_duration: C) -> Self {
        Self {
            inner,
            get_duration,
            taken_samples: 0,
        }
    }
}

impl<S, C> TakeFor<S, C>
where
    S: Source,
    S::Item: Sample,
    C: Fn() -> Duration,
{
    fn get_duration(&self) -> Duration {
        (self.get_duration)()
    }

    fn get_duration_samples(&self) -> usize {
        let duration = self.get_duration();
        let sample_rate_secs = self.sample_rate().try_into().unwrap_or(usize::MAX);
        let duration_nanos = duration.as_nanos().try_into().unwrap_or(usize::MAX);

        // samples = (samples / sec) * (sec / nanosecs) * nanosecs
        let samples = sample_rate_secs.saturating_mul(duration_nanos) / 1_000_000_000;
        samples
    }
}

impl<S, C> Iterator for TakeFor<S, C>
where
    S: Source,
    S::Item: Sample,
    C: Fn() -> Duration,
{
    type Item = S::Item;

    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        // Check if the max number of samples have been returned
        if self.taken_samples >= self.get_duration_samples() {
            return None;
        }

        // Increment the number of samples taken
        self.taken_samples += 1;
        self.inner.next()
    }

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        let remaining_samples = self
            .get_duration_samples()
            .saturating_sub(self.taken_samples);

        let (min, max) = self.inner.size_hint();
        let min = min.min(remaining_samples);
        let max = max.map(|max| max.min(remaining_samples));

        (min, max)
    }
}

impl<S, C> Source for TakeFor<S, C>
where
    S: Source,
    S::Item: Sample,
    C: Fn() -> Duration,
{
    #[inline]
    fn current_frame_len(&self) -> Option<usize> {
        // Check if the max number of samples have been returned
        let remaining_samples = self
            .get_duration_samples()
            .saturating_sub(self.taken_samples);
        if remaining_samples == 0 {
            return Some(0);
        }

        self.inner
            .current_frame_len()
            .map(|len| len.min(remaining_samples))
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
        self.inner
            .total_duration()
            .map(|duration| duration.min(self.get_duration()))
    }
}
