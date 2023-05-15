use std::sync::{
    atomic::{AtomicU32, Ordering},
    Arc, RwLock,
};

use static_assertions::assert_impl_all;

use crate::models::audio::AudioId;

use super::playback::SourceController;

/// Service which tracks the currently playing tracks and their controllers.
#[derive(Clone, Debug, Default)]
pub struct NowPlayingService {
    data: Arc<NowPlayingData>,
}

assert_impl_all!(NowPlayingService: Send, Sync);

#[derive(Debug, Default)]
struct NowPlayingData {
    playing: RwLock<Vec<NowPlayingEntry>>,
    next_id: AtomicU32,
}

impl NowPlayingService {
    /// Tracks a new request.
    #[inline]
    pub fn add(&self, controller: SourceController) -> AudioId {
        let id = AudioId(self.data.next_id.fetch_add(1, Ordering::Relaxed));
        let entry = NowPlayingEntry { id, controller };
        self.data.playing.write().unwrap().push(entry);
        id
    }

    /// Removes a request from the queue if it exists.
    #[inline]
    pub fn remove(&self, id: AudioId) {
        self.data
            .playing
            .write()
            .unwrap()
            .retain(|entry| entry.id != id);
    }

    /// Gets an entry from the queue if it exists.
    #[inline]
    pub fn get(&self, id: AudioId) -> Option<NowPlayingEntry> {
        self.data
            .playing
            .read()
            .unwrap()
            .iter()
            .find(|entry| entry.id == id)
            .cloned()
    }

    /// Gets the current queue.
    #[inline]
    pub fn list(&self) -> Vec<NowPlayingEntry> {
        self.data.playing.read().unwrap().clone()
    }
}

/// An entry in the now playing queue.
#[derive(Clone, Debug)]
pub struct NowPlayingEntry {
    /// The ID of the request.
    pub id: AudioId,
    /// The controller for the request.
    pub controller: SourceController,
}

assert_impl_all!(NowPlayingEntry: Send, Sync);
