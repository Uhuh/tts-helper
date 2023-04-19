use std::time::Duration;

use rodio::{Sample, Source};

use super::Controller;

#[derive(Debug)]
pub struct Controllable<S> {
    inner: S,
    controller: Controller,
    elapsed_padding: u64,
}

impl<S> Controllable<S> {
    /// Create a new controllable [`Source`].
    pub fn new(inner: S, controller: Controller) -> Self {
        Self {
            inner,
            controller,
            elapsed_padding: 0,
        }
    }
}

impl<S> Source for Controllable<S>
where
    S: Source + Iterator,
    S::Item: Sample,
{
    fn current_frame_len(&self) -> Option<usize> {
        if self.controller.is_skipped() {
            return Some(0);
        }

        self.inner.current_frame_len()
    }

    fn channels(&self) -> u16 {
        self.inner.channels()
    }

    fn sample_rate(&self) -> u32 {
        self.inner.sample_rate()
    }

    fn total_duration(&self) -> Option<Duration> {
        if self.controller.is_skipped() {
            return Some(Duration::ZERO);
        }

        self.inner
            .total_duration()
            .map(|duration| duration + self.controller.padding())
    }
}

impl<S> Iterator for Controllable<S>
where
    S: Source + Iterator,
    S::Item: Sample,
{
    type Item = S::Item;

    fn next(&mut self) -> Option<Self::Item> {
        if self.controller.is_skipped() {
            return None;
        }

        self.inner.next().or_else(|| {
            // Padding after inner source finishes
            if self.elapsed_padding > self.controller.padding_samples(self.sample_rate()) {
                return None;
            }

            self.elapsed_padding += 1;
            Some(Sample::zero_value())
        })
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        let (lower, upper) = self.inner.size_hint();
        let remaining_padding = self
            .controller
            .padding_samples(self.sample_rate())
            .saturating_sub(self.elapsed_padding);
        let upper = upper.map(|upper| upper + remaining_padding as usize);
        (lower, upper)
    }
}
