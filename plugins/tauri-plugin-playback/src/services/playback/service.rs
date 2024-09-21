use std::{error::Error, sync::Arc};

use crossbeam::channel::{Receiver, Sender};
use rodio::{source::Zero, Device, OutputStream, Sink, Source};
use tracing::{error, info_span, trace};

use tts_helper_audio::sources::SourceExt;

use super::{PlaybackController, SourceController, SourceEvents};

/// A service for managing audio playback.
#[derive(Clone)]
pub struct PlaybackService {
    event_tx: Sender<AudioEvent>,
}

impl PlaybackService {
    /// Creates a new [`PlaybackService`].
    #[inline]
    #[must_use]
    pub fn new(controller: PlaybackController) -> Self {
        let (event_tx, event_rx) = crossbeam::channel::unbounded();
        std::thread::spawn(move || playback(event_rx, controller));
        Self { event_tx }
    }

    /// Enqueues the given audio source.
    #[inline]
    pub fn enqueue(
        &self,
        source: Box<dyn Source<Item = f32> + Send + 'static>,
        controller: SourceController,
        events: SourceEvents,
    ) {
        drop(self.event_tx.send(AudioEvent::Play {
            source,
            controller,
            events,
        }));
    }

    /// Sets the output device.
    #[inline]
    pub fn set_device(&self, device: Arc<Device>) {
        drop(self.event_tx.send(AudioEvent::SetDevice { device }));
    }

    /// Set the output volume for the device
    #[inline]
    pub fn set_volume(&self, volume: f32) {
        drop(self.event_tx.send(AudioEvent::SetVolume { volume }));
    }

    /// Toggle if the audio is paused or not
    #[inline]
    pub fn toggle_pause(&self) -> bool {
        let (s, r) = crossbeam::channel::bounded(1);
        drop(self.event_tx.send(AudioEvent::Pause { sender: s }));

        r.recv().unwrap_or_default()
    }
}

fn playback(event_rx: Receiver<AudioEvent>, playback_controller: PlaybackController) {
    let _span = info_span!("playback").entered();

    // Stream and queue
    let mut _stream = None;
    let mut sink = None;

    // Handle events
    let mut event_id = 0u64;
    for event in event_rx {
        let _span = info_span!("event", id = event_id).entered();
        event_id += 1;

        match event {
            AudioEvent::SetDevice { device } => {
                trace!("setting device");

                // Create new stream and queue
                (_stream, sink) = {
                    // Create stream
                    let (stream, stream_handle) = match OutputStream::try_from_device(&device) {
                        Ok(result) => result,
                        Err(error) => {
                            let error = &error as &dyn Error;
                            error!(error, "failed to create audio stream");
                            continue;
                        }
                    };

                    // Create sink
                    let sink = match Sink::try_new(&stream_handle) {
                        Ok(result) => result,
                        Err(error) => {
                            let error = &error as &dyn Error;
                            error!(error, "failed to create sink");
                            continue;
                        }
                    };

                    (Some(stream), Some(sink))
                };
            }
            AudioEvent::SetVolume { volume } => {
                let Some(sink) = sink.as_mut() else {
                    trace!("no audio device set, skipping audio");
                    continue;
                };

                sink.set_volume(volume);
            }
            AudioEvent::Pause { sender } => {
                let Some(sink) = sink.as_mut() else {
                    trace!("no audio device set, skipping audio");
                    continue;
                };

                if sink.is_paused() {
                    sink.play();
                } else {
                    sink.pause();
                }

                let _ = sender.send(sink.is_paused());
            }
            AudioEvent::Play {
                source,
                controller,
                mut events,
            } => {
                trace!("received audio");

                let Some(sink) = sink.as_ref() else {
                    trace!("no audio device set, skipping audio");
                    continue;
                };

                // Wrap the source in a controllable source
                let is_skipped = {
                    let controller = controller.clone();
                    move || controller.is_skipped()
                };
                let get_end_delay_duration = {
                    let controller = playback_controller.clone();
                    move || controller.end_delay()
                };

                let source = source
                    .on_start(events.take_start())
                    .on_finish(events.take_finish())
                    .skip_when(is_skipped.clone());
                let end_delay = Zero::<f32>::new(source.channels(), source.sample_rate())
                    .take_for(get_end_delay_duration)
                    .skip_when(is_skipped);

                // Enqueue the audio
                trace!("enqueuing audio");
                sink.append(source);
                sink.append(end_delay);
            }
        }
    }
}

enum AudioEvent {
    SetVolume {
        volume: f32,
    },
    SetDevice {
        device: Arc<Device>,
    },
    Pause {
        sender: Sender<bool>,
    },
    Play {
        source: Box<dyn Source<Item = f32> + Send>,
        controller: SourceController,
        events: SourceEvents,
    },
}
