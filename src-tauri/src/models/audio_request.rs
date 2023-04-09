use reqwest::Url;
use serde::Deserialize;

/// A request to play some audio.
#[derive(Clone, Debug, Deserialize)]
pub struct AudioRequest {
    /// The URL.
    pub url: Url,
    /// The request parameters.
    pub params: Vec<(String, String)>,
}
