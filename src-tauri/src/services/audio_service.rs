use std::{
    io::Cursor,
    sync::Arc,
    task::{Context, Poll},
};

use bytes::Bytes;
use crossbeam::channel::{Receiver, Sender};
use futures::{future::BoxFuture, FutureExt};
use rodio::{
    decoder::DecoderError, Decoder, OutputStream, OutputStreamHandle, PlayError, Sink, StreamError,
};
use thiserror::Error;
use tower::{BoxError, Service};

/// Service for playing audio.
pub struct AudioQueueService {
    event_tx: Sender<AudioEvent>,
}

impl AudioQueueService {
    /// Creates a new [`AudioService`] with the default output device.
    pub fn new_default() -> Result<Self, CreateAudioDeviceError> {
        let (event_tx, event_rx) = crossbeam::channel::unbounded();
        let (sink_tx, sink_rx) = crossbeam::channel::unbounded();
        std::thread::spawn(move || play_audio(event_rx, sink_tx));

        // Get the audio sink back
        let Ok(sink) = sink_rx.recv() else {
            return Err(CreateAudioDeviceError::Stream(StreamError::NoDevice));
        };
        let _ = sink?;

        Ok(Self { event_tx })
    }
}

impl Service<Bytes> for AudioQueueService {
    type Response = ();
    type Error = BoxError;
    type Future = BoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, data: Bytes) -> Self::Future {
        let _ = self.event_tx.send(AudioEvent::Play(data));

        std::future::ready(Ok(())).boxed()
    }
}

fn create_sink() -> Result<(OutputStream, OutputStreamHandle, Arc<Sink>), CreateAudioDeviceError> {
    let (stream, stream_handle) = OutputStream::try_default()?;
    let sink = Sink::try_new(&stream_handle)?;
    Ok((stream, stream_handle, Arc::new(sink)))
}

fn play_audio(
    event_rx: Receiver<AudioEvent>,
    sink_tx: Sender<Result<Arc<Sink>, CreateAudioDeviceError>>,
) {
    // Create output device
    let (_stream, _stream_handle, sink) = match create_sink() {
        Ok(res) => res,
        Err(error) => {
            // Failed to create sink
            let _ = sink_tx.send(Err(error));
            return;
        }
    };
    let _ = sink_tx.send(Ok(sink.clone()));

    // Handle audio events
    for event in event_rx {
        match event {
            AudioEvent::Play(data) => {
                println!("received audio");

                // Decode the source data
                let source = match Decoder::new(Cursor::new(data)) {
                    Ok(decoder) => decoder,
                    Err(error) => {
                        println!("failed to decode audio: {error}");
                        continue;
                    }
                };

                // Enqueue the audio
                println!("enqueuing audio");
                sink.append(source);
            }
        }
    }

    println!("stopping audio");
    sink.stop();
}

enum AudioEvent {
    Play(Bytes),
}

#[derive(Debug, Error)]
pub enum CreateAudioDeviceError {
    #[error("audio stream could not be opened")]
    Stream(#[from] StreamError),
    #[error("audio sink could not be created")]
    Sink(#[from] PlayError),
}

#[derive(Debug, Error)]
pub enum PlayAudioError {
    #[error("could not decode data")]
    Decode(#[from] DecoderError),
}
