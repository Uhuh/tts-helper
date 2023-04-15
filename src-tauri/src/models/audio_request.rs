use reqwest::Url;
use serde::{Deserialize, Serialize};

/// A request to play some audio.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AudioRequest {
    pub id: Option<u32>,
    /// The URL.
    pub url: Url,
    /// The request parameters.
    pub params: Vec<(String, String)>,
}
