use std::{
    io::Cursor,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    time::Duration,
};

use bytes::Bytes;
use crossbeam::channel::{Receiver, RecvTimeoutError, Sender};
use reqwest::Client;
use rodio::{source::Zero, Decoder, OutputStream, PlayError, Source, StreamError};
use thiserror::Error;
use tracing::{error, info, instrument, trace};
use tts_helper_audio::sources::SourceExt;

use crate::{api_result::ApiResult, models::{AudioRequest, TtsMonsterResponse}};

use super::Controller;

/// The audio player.
#[derive(Clone, Debug)]
pub struct AudioPlayer {
    client: Client,
    event_tx: Sender<AudioEvent>,
}

impl AudioPlayer {
    /// Creates a new [`AudioPlayer`] with the default output device.
    pub fn new_default() -> Result<Self, CreateAudioDeviceError> {
        let (event_tx, event_rx) = crossbeam::channel::unbounded();
        std::thread::spawn(move || play_audio(event_rx));
        Ok(Self {
            client: Client::new(),
            event_tx,
        })
    }

    /// Plays the audio at the given URL.
    pub async fn play_tts<S, F>(
        &self,
        request: AudioRequest,
        on_start: S,
        on_finish: F,
        controller: Controller,
    ) -> ApiResult<()>
    where
        S: FnOnce() + Send + 'static,
        F: FnOnce() + Send + 'static,
    {
        let data = if request.tts == "amazon-polly" {
            self
                .client
                .get(request.url)
                .send()
                .await?
                .error_for_status()?
                .bytes()
                .await?
        } else {
            // Default is stream-elements
            self
                .client
                .get(request.url)
                .query(&request.params)
                .send()
                .await?
                .error_for_status()?
                .bytes()
                .await?
        };

        // Play audio
        let _ = self.event_tx.send(AudioEvent::Play {
            data,
            on_start: Box::new(on_start),
            on_finish: Box::new(on_finish),
            controller,
        });

        Ok(())
    }

    /// Sets whether the audio player is paused. Any currently playing sources will continue to play
    /// until they finish, but no new sources will be played while paused.
    pub fn set_paused(&self, paused: bool) {
        let _ = self.event_tx.send(AudioEvent::SetPaused(paused));
    }
}

#[instrument(skip_all)]
fn play_audio(event_rx: Receiver<AudioEvent>) {
    // Create output stream
    let (_stream, stream_handle) = match OutputStream::try_default() {
        Ok(res) => res,
        Err(error) => {
            error!(?error, "failed to create audio device: {error}");
            return;
        }
    };

    // Create queue
    let (queue_tx, queue_rx) = rodio::queue::queue(true);
    if let Err(error) = stream_handle.play_raw(queue_rx) {
        error!(?error, "failed to play audio: {error}");
        return;
    }

    // Handle audio events
    let paused = Arc::new(AtomicBool::default());
    loop {
        // Check for new events
        match event_rx.recv_timeout(Duration::from_millis(100)) {
            Ok(AudioEvent::Play {
                data,
                on_start,
                on_finish,
                controller,
            }) => {
                trace!("received audio");

                // Decode the source data
                let source = match Decoder::new(Cursor::new(data)) {
                    Ok(decoder) => decoder,
                    Err(error) => {
                        error!(?error, "failed to decode audio: {error}");
                        continue;
                    }
                };

                // Wrap the source in a controllable source
                let is_skipped = {
                    let controller = controller.clone();
                    move || controller.is_skipped()
                };
                let get_end_delay_duration = {
                    let controller = controller.clone();
                    move || controller.end_delay()
                };
                let is_resumed = {
                    let paused = paused.clone();
                    move || !paused.load(Ordering::Relaxed)
                };

                let pause_delay =
                    Zero::new(source.channels(), source.sample_rate()).skip_when(is_resumed);
                let source = source
                    .convert_samples()
                    .on_start(on_start)
                    .on_finish(on_finish)
                    .skip_when(is_skipped.clone());
                let end_delay = Zero::new(source.channels(), source.sample_rate())
                    .take_for(get_end_delay_duration)
                    .skip_when(is_skipped);

                // Enqueue the audio
                trace!("enqueuing audio");
                queue_tx.append(pause_delay);
                queue_tx.append(source);
                queue_tx.append(end_delay);
            }
            Ok(AudioEvent::SetPaused(value)) => {
                trace!(paused = value, "setting paused");
                paused.store(value, Ordering::Relaxed);
            }
            Err(RecvTimeoutError::Disconnected) => break,
            _ => {}
        }
    }

    info!("stopping audio playback");
    queue_tx.clear();
}

/// An event that controls the audio playback thread.
enum AudioEvent {
    Play {
        data: Bytes,
        on_start: Box<dyn FnOnce() + Send + 'static>,
        on_finish: Box<dyn FnOnce() + Send + 'static>,
        controller: Controller,
    },
    SetPaused(bool),
}

/// An error that can occur when creating an audio device.
#[derive(Debug, Error)]
pub enum CreateAudioDeviceError {
    #[error("audio stream could not be opened")]
    Stream(#[from] StreamError),
    #[error("audio sink could not be created")]
    Sink(#[from] PlayError),
}
