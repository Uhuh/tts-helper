use bytes::Bytes;
use serde::Deserialize;

use crate::models::devices::DeviceId;

/// A request to play audio.
#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayAudioRequest {
    /// The ID of the audio, if any.
    pub device_id: DeviceId,
    /// The audio data.
    pub data: RequestAudioData,
}

/// The audio data for a [`PlayAudioRequest`].
#[derive(Clone, Debug, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum RequestAudioData {
    /// Raw audio data.
    Raw(RawAudioData),
}

/// Raw audio data.
#[derive(Clone, Debug, Deserialize)]
pub struct RawAudioData {
    /// The audio data.
    pub data: Bytes,
}
