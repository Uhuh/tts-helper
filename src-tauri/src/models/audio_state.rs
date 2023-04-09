use serde::Deserialize;

/// Sets the state of an audio source.
#[derive(Clone, Debug, Deserialize)]
pub struct SetAudioState {
    /// The ID of the audio source.
    pub id: u32,
    /// Whether the audio source is skipped.
    #[serde(default)]
    pub skip: Option<bool>,
}
