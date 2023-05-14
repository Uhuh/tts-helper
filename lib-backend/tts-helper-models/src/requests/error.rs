use serde::Serialize;
use std::error::Error;

/// An API result.
pub type ApiResult<T> = Result<T, ApiError>;

/// An error formatted for an API.
#[derive(Clone, Debug, Serialize)]
pub struct ApiError {
    /// The error message.
    pub message: String,
    /// The causes of the error.
    pub caused_by: Vec<String>,
}

impl ApiError {
    /// Creates a new API error.
    #[inline]
    #[must_use]
    pub fn new(message: impl ToString) -> Self {
        Self {
            message: message.to_string(),
            caused_by: Vec::new(),
        }
    }
}

impl<E> From<E> for ApiError
where
    E: Error,
{
    fn from(error: E) -> Self {
        let message = error.to_string();
        let caused_by = std::iter::successors(error.source(), |&source| source.source())
            .map(|err| err.to_string())
            .collect();
        ApiError { message, caused_by }
    }
}
