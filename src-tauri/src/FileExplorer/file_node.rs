use serde::Serialize;
use uuid::Uuid;
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileNode {
    pub id: String,
    pub parent_id: Option<String>,   
    pub name: String,
    #[serde(rename = "type")]
    pub node_type: String,
    pub expanded: Option<bool>,
}

impl FileNode {
    pub fn new_folder(name: String, parent_id: Option<String>) -> Self {
        FileNode {
            id: Uuid::new_v4().to_string(),
            parent_id,
            name,
            node_type: "folder".to_string(),
            expanded: Some(false),
        }
    }
    pub fn new_file(name: String, parent_id: Option<String>) -> Self {
        FileNode {
            id: Uuid::new_v4().to_string(),
            parent_id,
            name,
            node_type: "file".to_string(),
            expanded: None,
        }
    }
}