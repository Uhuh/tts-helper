use serde::{Deserialize, Serialize};

/// A unique identifier for an audio device. This is unique only within the current process and is
/// not guaranteed to point to the same device across multiple runs of the program.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Hash, Serialize, Deserialize)]
#[serde(transparent)]
pub struct DeviceId(pub u64);
