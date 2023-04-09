use std::sync::{
    atomic::{AtomicU32, Ordering},
    Mutex,
};

use crate::models::{AudioRequest, PlayingAudio};

#[derive(Debug, Default)]
pub struct NowPlaying {
    requests: Mutex<Vec<PlayingAudio>>,
    next_id: AtomicU32,
}

impl NowPlaying {
    /// Adds a new request to the queue.
    pub fn add(&self, request: AudioRequest) -> u32 {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        self.requests.lock().unwrap().push(PlayingAudio { id, request });
        id
    }

    /// Removes a request from the queue.
    pub fn remove(&self, id: u32) {
        let mut requests = self.requests.lock().unwrap();
        requests.retain(|audio| audio.id != id);
    }

    /// Gets the current queue.
    pub fn get_playing(&self) -> Vec<PlayingAudio> {
        self.requests.lock().unwrap().clone()
    }
}
