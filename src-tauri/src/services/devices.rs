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

use crate::models::DeviceId;

/// A service for managing audio devices. This can be cheaply cloned.
#[derive(Clone)]
pub struct DeviceService {
    /// Inner data. This allows the service to be cheaply cloned.
    data: Arc<DeviceServiceData>,
}

impl DeviceService {
    /// Initializes the device service.
    #[must_use]
    pub fn init() -> Result<Self, DevicesError> {
        let host = rodio::cpal::default_host();
        let mut output_devices = HashMap::new();

        // Add default device
        let default_output_id = host.default_output_device().map(|device| {
            let id = get_next_device_id();
            output_devices.insert(
                id,
                ManagedDevice {
                    name: "Default".into(),
                    device: Arc::new(device),
                },
            );

            id
        });

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
                    name: name.into(),
                    device: Arc::new(device),
                },
            );
        }

        Ok(Self {
            data: Arc::new(DeviceServiceData {
                output_devices,
                default_output_id,
            }),
        })
    }

    /// Gets the names of all available output devices. Devices which fail to provide a name will be
    /// given a default name.
    #[must_use]
    pub fn output_device_names(&self) -> HashMap<DeviceId, Arc<str>> {
        self.data
            .output_devices
            .iter()
            .map(|(&id, device)| (id, device.name.clone()))
            .collect()
    }

    /// Gets the ID of the default output device.
    #[must_use]
    pub fn default_output_id(&self) -> Option<DeviceId> {
        self.data.default_output_id
    }

    /// Gets a device by ID.
    #[must_use]
    pub fn output_device(&self, id: DeviceId) -> Option<Arc<Device>> {
        self.data
            .output_devices
            .get(&id)
            .map(|managed| managed.device.clone())
    }
}

/// A managed audio device.
#[derive(Clone)]
struct ManagedDevice {
    /// The name of the device.
    name: Arc<str>,
    /// The device being managed.
    device: Arc<Device>,
}

struct DeviceServiceData {
    output_devices: HashMap<DeviceId, ManagedDevice>,
    default_output_id: Option<DeviceId>,
}

/// Gets the next globally-unique device ID.
fn get_next_device_id() -> DeviceId {
    // Technically we can run out of device IDs, but how...
    static NEXT_ID: AtomicU64 = AtomicU64::new(0);
    let id = NEXT_ID.fetch_add(1, Ordering::Relaxed);
    DeviceId(id)
}
