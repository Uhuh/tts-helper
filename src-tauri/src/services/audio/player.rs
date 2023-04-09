use std::io::Cursor;

use bytes::Bytes;
use crossbeam::channel::{Receiver, Sender};
use reqwest::Client;
use rodio::{Decoder, OutputStream, OutputStreamHandle, PlayError, Sink, StreamError};
use thiserror::Error;
use tracing::{error, info, instrument, trace};

use crate::{api_result::ApiResult, models::AudioRequest};

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
    pub async fn play_tts(&self, request: AudioRequest) -> ApiResult<()> {
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
        let _ = self.event_tx.send(AudioEvent::Play(data));

        Ok(())
    }
}

#[instrument(skip_all)]
fn play_audio(event_rx: Receiver<AudioEvent>) {
    // Create output device
    let (_stream, _, sink) = match create_sink() {
        Ok(res) => res,
        Err(error) => {
            error!(?error, "failed to create audio device: {error}");
            return;
        }
    };

    // Handle audio events
    for event in event_rx {
        match event {
            AudioEvent::Play(data) => {
                trace!("received audio");

                // Decode the source data
                let source = match Decoder::new(Cursor::new(data)) {
                    Ok(decoder) => decoder,
                    Err(error) => {
                        error!(?error, "failed to decode audio: {error}");
                        continue;
                    }
                };

                // Enqueue the audio
                trace!("enqueuing audio");
                sink.append(source);
            }
        }
    }

    info!("stopping audio playback");
    sink.stop();
}

fn create_sink() -> Result<(OutputStream, OutputStreamHandle, Sink), CreateAudioDeviceError> {
    let (stream, stream_handle) = OutputStream::try_default()?;
    let sink = Sink::try_new(&stream_handle)?;
    Ok((stream, stream_handle, sink))
}

/// An event that controls the audio playback thread.
enum AudioEvent {
    Play(Bytes),
}

/// An error that can occur when creating an audio device.
#[derive(Debug, Error)]
pub enum CreateAudioDeviceError {
    #[error("audio stream could not be opened")]
    Stream(#[from] StreamError),
    #[error("audio sink could not be created")]
    Sink(#[from] PlayError),
}
