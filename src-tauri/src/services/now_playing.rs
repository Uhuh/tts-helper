use std::sync::{
    atomic::{AtomicU32, Ordering},
    Mutex,
};

use crate::models::{AudioRequest, PlayingAudio, SetAudioState};

use super::Controller;

#[derive(Debug, Default)]
pub struct NowPlaying {
    playing: Mutex<Vec<(PlayingAudio, Controller)>>,
    next_id: AtomicU32,
}

impl NowPlaying {
    /// Adds a new request to the queue.
    pub fn add(&self, request: AudioRequest, controller: Controller) -> u32 {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        self.playing
            .lock()
            .unwrap()
            .push((PlayingAudio { id, request }, controller));
        id
    }

    /// Removes a request from the queue.
    pub fn remove(&self, id: u32) {
        let mut requests = self.playing.lock().unwrap();
        requests.retain(|(audio, _)| audio.id != id);
    }

    /// Gets the current queue.
    pub fn get_playing(&self) -> Vec<PlayingAudio> {
        self.playing
            .lock()
            .unwrap()
            .iter()
            .map(|(audio, _)| audio)
            .cloned()
            .collect()
    }

    /// Sets the state of an audio request.
    pub fn merge_state(&self, set_state: SetAudioState) -> bool {
        let mut playing = self.playing.lock().unwrap();
        let Some((_, controller)) = playing.iter_mut().find(|(audio, _)| audio.id == set_state.id) else {
            return false;
        };

        if set_state.skip == Some(true) {
            controller.skip();
        }

        true
    }
}
