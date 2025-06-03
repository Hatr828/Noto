use serde::Serialize;

#[derive(Serialize, Debug)]
#[serde(rename_all = "lowercase")]
pub enum FileNodeType {
    Folder,
    Md,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileNode {
    pub name: String,
    pub path: String,

    #[serde(rename = "type")]
    pub node_type: FileNodeType,

    pub expanded: bool,
}

impl FileNode {
    pub fn new(name: impl Into<String>, path: impl Into<String>, node_type: FileNodeType) -> Self {
        FileNode {
            name: name.into(),
            path: path.into(),
            node_type,
            expanded: false,
        }
    }
}
