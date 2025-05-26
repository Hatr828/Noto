use std::fs;
use std::path::Path;
use crate::file_node::FileNode;

pub fn scan_children(path: &Path) -> Vec<FileNode> {
    let mut nodes = Vec::new();
    for entry in fs::read_dir(path).unwrap() {
        let entry = entry.unwrap();
        let p = entry.path();

        if p.is_dir() {
            let name = p.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            let mut folder = FileNode::new_folder(name);
            if let Some(children) = folder.children.as_mut() {
                *children = scan_children(&p);
            }
            nodes.push(folder);
        } else if p.is_file() {
            if let Some(ext) = p.extension().and_then(|e| e.to_str()) {
                if ext.eq_ignore_ascii_case("md") {
                    let file_name = p.file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("")
                        .to_string();
                    nodes.push(FileNode::new_file(file_name));
                }
            }
        }
    }
    nodes
}