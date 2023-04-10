use std::{io::Cursor, sync::mpsc::TryRecvError, time::Duration};

use bytes::Bytes;
use crossbeam::channel::{Receiver, RecvTimeoutError, Sender};
use reqwest::Client;
use rodio::{Decoder, OutputStream, PlayError, Source, StreamError};
use thiserror::Error;
use tracing::{error, info, instrument, trace};

use crate::{api_result::ApiResult, models::AudioRequest, services::Controllable};

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
    pub async fn play_tts<D>(
        &self,
        request: AudioRequest,
        on_done: D,
        controller: Controller,
    ) -> ApiResult<()>
    where
        D: FnOnce() + Send + 'static,
    {
        // Download audio
        let data = self
            .client
            .get(request.url)
            .query(&request.params)
            .send()
            .await?
            .error_for_status()?
            .bytes()
            .await?;

        // Play audio
        let _ = self.event_tx.send(AudioEvent::Play {
            data,
            on_done: Box::new(on_done),
            controller,
        });

        Ok(())
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

    // Track completed sources
    let mut playing = Vec::with_capacity(10);

    // Handle audio events
    loop {
        // Check for new events
        match event_rx.recv_timeout(Duration::from_millis(100)) {
            Ok(AudioEvent::Play {
                data,
                on_done,
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
                let source = Controllable::new(source.convert_samples(), controller);

                // Enqueue the audio
                trace!("enqueuing audio");
                let done_rx = queue_tx.append_with_signal(source);
                playing.push((done_rx, on_done));
            }
            Err(RecvTimeoutError::Disconnected) => break,
            _ => {}
        }

        // Notify completed sources
        for i in (0..playing.len()).rev() {
            let (done_rx, on_done) = playing.swap_remove(i);
            if let Err(TryRecvError::Empty) = done_rx.try_recv() {
                // Not done yet
                playing.push((done_rx, on_done));
                continue;
            }

            on_done();
        }
    }

    info!("stopping audio playback");
    queue_tx.clear();
}

/// An event that controls the audio playback thread.
enum AudioEvent {
    Play {
        data: Bytes,
        on_done: Box<dyn FnOnce() + Send + 'static>,
        controller: Controller,
    },
}

/// An error that can occur when creating an audio device.
#[derive(Debug, Error)]
pub enum CreateAudioDeviceError {
    #[error("audio stream could not be opened")]
    Stream(#[from] StreamError),
    #[error("audio sink could not be created")]
    Sink(#[from] PlayError),
}
