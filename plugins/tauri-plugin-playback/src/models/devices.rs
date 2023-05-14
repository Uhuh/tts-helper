use std::sync::Arc;

use serde::{Deserialize, Serialize};

use super::common::WithId;

/// A unique identifier for an audio device. This is unique only within the current process and is
/// not guaranteed to point to the same device across multiple runs of the program.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Hash, Serialize, Deserialize)]
#[serde(transparent)]
pub struct DeviceId(pub u32);

/// Information about an audio device. This is cheaply clonable.
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceInfo {
    /// The name of the device.
    pub name: Arc<str>,
    /// Whether or not this is the default device.
    pub is_default: bool,
}

/// A device with its ID.
pub type DeviceInfoWithId = WithId<DeviceInfo, DeviceId>;

/// A list of all available audio devices.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OutputDeviceList {
    /// The names of all available output devices.
    pub output_devices: Vec<DeviceInfoWithId>,
}
