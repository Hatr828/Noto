use std::fs;
use std::path::Path;
use rayon::prelude::*;
use rayon::iter::ParallelBridge;
use crate::file_node::FileNode;

#[tauri::command]
pub fn open_folder(path: String) -> Vec<FileNode> {
  let p = Path::new(&path);
  scan_children(p) 
}

fn scan_children(path: &Path) -> Vec<FileNode> {
    if let Ok(read_dir) = fs::read_dir(path) {
        read_dir
            .par_bridge()
            .filter_map(|res_entry| {
                let entry = res_entry.ok()?;
                let p = entry.path();
                let name = entry
                    .file_name()
                    .to_string_lossy()
                    .into_owned();

                if p.is_dir() {
                    let mut folder = FileNode::new_folder(name);
                    if let Some(children) = folder.children.as_mut() {
                        *children = scan_children(&p);
                    }
                    Some(folder)
                } else if p.extension()
                    .and_then(|e| e.to_str())
                    .map_or(false, |ext| ext.eq_ignore_ascii_case("md"))
                {
                    // Markdown file
                    Some(FileNode::new_file(name))
                } else {
                    None
                }
            })
            .collect()
    } else {
        Vec::new()
    }
}