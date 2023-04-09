use std::sync::Arc;

use tauri::async_runtime::Mutex;
use tower::{util::BoxService, BoxError, Service, ServiceBuilder, ServiceExt};

use crate::{
    api_result::FormattedError,
    services::{AudioRequest, AudioQueueService, CreateAudioDeviceError, DownloadAudioLayer},
};

/// The audio player.
pub struct AudioPlayer {
    service: Arc<Mutex<BoxService<AudioRequest, (), FormattedError>>>,
}

impl AudioPlayer {
    /// Creates a new [`AudioPlayer`] with the default output device.
    pub fn new_default() -> Result<Self, CreateAudioDeviceError> {
        let service = ServiceBuilder::new()
            .map_err(|err: BoxError| FormattedError::from(&*err))
            .layer(DownloadAudioLayer::default())
            .service(AudioQueueService::new_default()?)
            .boxed();

        Ok(Self {
            service: Arc::new(Mutex::new(service)),
        })
    }

    /// Plays the audio at the given URL.
    pub async fn play_tts(&self, message: String) -> Result<(), FormattedError> {
        let mut service = self.service.lock().await;
        service.ready().await?;
        let fut = service.call(AudioRequest { message });
        drop(service);

        fut.await?;

        Ok(())
    }
}
