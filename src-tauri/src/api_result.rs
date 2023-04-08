use serde::{Serialize };
use std::error::Error;

#[derive(Clone, Debug, Serialize)]
pub struct FormattedError {
    message: String,
    caused_by: Vec<String>,
}

impl<E> From<E> for FormattedError
where
    E: Error,
{
    fn from(error: E) -> Self {
        let message = error.to_string();
        let caused_by = std::iter::successors(error.source(), |&source| source.source())
            .map(|err| err.to_string())
            .collect();
        FormattedError { message, caused_by }
    }
}

pub type ApiResult<T> = Result<T, FormattedError>;