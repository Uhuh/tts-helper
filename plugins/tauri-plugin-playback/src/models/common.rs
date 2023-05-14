use serde::{Deserialize, Serialize};

/// Attaches an ID to a type.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Hash, Default, Serialize, Deserialize)]
pub struct WithId<T, Id> {
    /// The ID of the item.
    pub id: Id,
    /// The inner item.
    #[serde(flatten)]
    pub inner: T,
}
