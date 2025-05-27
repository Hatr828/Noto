use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileNode {
    pub id: String,
    pub name: String,
    pub path: String,

    #[serde(rename = "type")]
    pub node_type: String,

    pub expanded: bool,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileNode>>,
}

impl FileNode {
    pub fn new_folder(name: impl Into<String>, path: impl Into<String>) -> Self {
        FileNode {
            id: Uuid::new_v4().to_string(),
            name: name.into(),
            path: path.into(),
            node_type: "folder".to_string(),
            expanded: false,
            children: Some(Vec::new()),
        }
    }

    pub fn new_file(name: impl Into<String>, path: impl Into<String>) -> Self {
        FileNode {
            id: Uuid::new_v4().to_string(),
            name: name.into(),
            path: path.into(),
            node_type: "file".to_string(),
            expanded: false,
            children: None,
        }
    }
}
