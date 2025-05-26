use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize)]
pub struct FileNode {
  pub id: String,
  pub name: String,
  #[serde(rename = "type")]
  pub node_type: String,         
  pub expanded: Option<bool>,
  pub children: Option<Vec<FileNode>>,
}

impl FileNode {
  pub fn new_folder(name: String) -> Self {
    FileNode {
      id: Uuid::new_v4().to_string(),
      name,
      node_type: "folder".to_string(),
      expanded: Some(false),
      children: Some(Vec::new()),
    }
  }
  pub fn new_file(name: String) -> Self {
    FileNode {
      id: Uuid::new_v4().to_string(),
      name,
      node_type: "file".to_string(),
      expanded: None,
      children: None,
    }
  }
}
