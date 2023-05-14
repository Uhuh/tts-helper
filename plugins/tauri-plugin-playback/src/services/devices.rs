use std::{
    collections::HashMap,
    error::Error,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
};

use rodio::{cpal::traits::HostTrait, Device, DeviceTrait, DevicesError};
use tracing::warn;

use crate::models::{
    common::WithId,
    devices::{DeviceId, DeviceInfo, DeviceInfoWithId},
};

/// A service for managing audio devices. This can be cheaply cloned.
#[derive(Clone)]
pub struct DeviceService {
    /// Inner data. This allows the service to be cheaply cloned.
    data: Arc<DeviceServiceData>,
}

struct DeviceServiceData {
    output_devices: HashMap<DeviceId, ManagedDevice>,
}

impl DeviceService {
    /// Initializes the device service.
    #[must_use]
    pub fn init() -> Result<Self, DevicesError> {
        let host = rodio::cpal::default_host();
        let mut output_devices = HashMap::new();

        // Add default device
        if let Some(device) = host.default_output_device() {
            output_devices.insert(
                get_next_device_id(),
                ManagedDevice {
                    metadata: DeviceInfo {
                        name: "Default".into(),
                        is_default: true,
                    },
                    device: Arc::new(device),
                },
            );
        }

        // Add all devices (including the default one)
        for device in host.output_devices()? {
            let id = get_next_device_id();
            let name = device.name().unwrap_or_else(|error| {
                let error = &error as &dyn Error;
                warn!(error, id = id.0, "failed to get device name");
                format!("Unknown Device (#{})", id.0)
            });
            output_devices.insert(
                id,
                ManagedDevice {
                    metadata: DeviceInfo {
                        name: name.into(),
                        is_default: false,
                    },
                    device: Arc::new(device),
                },
            );
        }

        let data = Arc::new(DeviceServiceData { output_devices });
        Ok(Self { data })
    }

    /// Gets a device by ID.
    #[must_use]
    pub fn output_device(&self, id: DeviceId) -> Option<Arc<Device>> {
        self.data
            .output_devices
            .get(&id)
            .map(|managed| managed.device.clone())
    }

    /// Gets [`DeviceInfoWithId`]s for all available output devices.
    #[must_use]
    pub fn output_device_infos(&self) -> Vec<DeviceInfoWithId> {
        self.data
            .output_devices
            .iter()
            .map(|(&id, managed)| WithId {
                id,
                inner: managed.metadata.clone(),
            })
            .collect()
    }
}

/// A managed audio device.
#[derive(Clone)]
struct ManagedDevice {
    /// The device's metadata.
    metadata: DeviceInfo,
    /// The device being managed.
    device: Arc<Device>,
}

/// Gets the next globally-unique device ID.
fn get_next_device_id() -> DeviceId {
    // Technically we can run out of device IDs, but how...
    static NEXT_ID: AtomicU64 = AtomicU64::new(0);
    let id = NEXT_ID.fetch_add(1, Ordering::Relaxed);
    DeviceId(id)
}
