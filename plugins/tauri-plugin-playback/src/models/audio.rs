use serde::{Deserialize, Serialize};

/// A unique identifier for an audio source.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Hash, Serialize, Deserialize)]
#[serde(transparent)]
pub struct AudioId(pub u32);
