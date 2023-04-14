use serde::Serialize;

/// The event sent when the user authenticates with a provider.
#[derive(Clone, Debug, Serialize)]
pub struct AuthEvent {
    /// The provider that the user authenticated with.
    pub provider: String,
    /// The token that was returned by the provider.
    pub token: String,
}
