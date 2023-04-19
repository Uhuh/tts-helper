use rodio::{Sample, Source};

use super::{OnFinish, OnStart, SkipWhen, TakeFor};

/// Extension methods for [`Source`]s.
pub trait SourceExt: Source
where
    Self::Item: Sample,
{
    /// Skips the source when the given callback returns `true`.
    #[must_use]
    #[inline]
    fn skip_when<C>(self, is_skipped: C) -> SkipWhen<Self, C>
    where
        Self: Sized,
    {
        SkipWhen::new(self, is_skipped)
    }

    /// Takes the source for the duration returned by the given callback.
    #[must_use]
    #[inline]
    fn take_for<C>(self, get_duration: C) -> TakeFor<Self, C>
    where
        Self: Sized,
    {
        TakeFor::new(self, get_duration)
    }

    /// Calls the given callback when the source starts playing.
    #[must_use]
    #[inline]
    fn on_start<C>(self, on_start: C) -> OnStart<Self, C>
    where
        Self: Sized,
    {
        OnStart::new(self, on_start)
    }

    /// Calls the given callback when the source finishes playing.
    #[must_use]
    #[inline]
    fn on_finish<C>(self, on_finish: C) -> OnFinish<Self, C>
    where
        Self: Sized,
    {
        OnFinish::new(self, on_finish)
    }
}

impl<S> SourceExt for S
where
    S: Source,
    S::Item: Sample,
{
}
