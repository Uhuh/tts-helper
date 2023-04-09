use std::time::Duration;

use rodio::{Sample, Source};

use super::Controller;

#[derive(Debug)]
pub struct Controllable<S> {
    inner: S,
    controller: Controller,
}

impl<S> Controllable<S> {
    /// Create a new controllable [`Source`].
    pub fn new(inner: S, controller: Controller) -> Self {
        Self { inner, controller }
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

        self.inner.total_duration()
    }
}

impl<S> Iterator for Controllable<S>
where
    S: Iterator,
{
    type Item = S::Item;

    fn next(&mut self) -> Option<Self::Item> {
        if self.controller.is_skipped() {
            return None;
        }

        self.inner.next()
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        self.inner.size_hint()
    }
}
