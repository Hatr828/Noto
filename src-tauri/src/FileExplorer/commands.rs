use walkdir::WalkDir;
use rayon::prelude::*;
use std::{collections::HashMap, path::{Path, PathBuf}};
use std::sync::atomic::{AtomicU64, Ordering};
use crate::file_node::FileNode;
use std::fs;
use std::io::Write;

static ID_COUNTER: AtomicU64 = AtomicU64::new(1);

#[tauri::command]
pub fn open_folder(path: String) -> Vec<FileNode> {
    scan_flat(Path::new(&path))
}

#[tauri::command]
pub fn add_folder(base_dir: String, name: String) -> Result<String, String> {
    let base = Path::new(&base_dir);

    let mut candidate = name.clone();
    let mut counter = 1;

    loop {
        let path = base.join(&candidate);
        if !path.exists() {
            fs::create_dir_all(&path).map_err(|e| format!("Failed to create folder: {}", e))?;
            return Ok(candidate);
        }
        candidate = format!("{}_{}", name, counter);
        counter += 1;
    }
}

#[tauri::command]
pub fn add_md_file(base_dir: String, name: String, content: String) -> Result<String, String> {
    let base = Path::new(&base_dir);
    let stem = Path::new(&name)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("file");
    let mut candidate = stem.to_string();
    let mut counter = 1;

    loop {
        let filename = format!("{}.md", candidate);
        let file_path = base.join(&filename);
        if !file_path.exists() {
            let mut file = fs::File::create(&file_path)
                .map_err(|e| format!("Failed to create file «{}»: {}", filename, e))?;
            file.write_all(content.as_bytes())
                .map_err(|e| format!("Failed to write to file «{}»: {}", filename, e))?;
            return Ok(filename);
        }
        candidate = format!("{}_{}", stem, counter);
        counter += 1;
    }
}

#[tauri::command]
pub fn delete_node(base_dir: String, name: String) -> Result<String, String> {
    let target = Path::new(&base_dir).join(&name);
    if target.is_dir() {
        fs::remove_dir_all(&target)
            .map_err(|e| format!("Failed to delete folder «{}»: {}", name, e))?;
    } else if target.is_file() {
        fs::remove_file(&target).map_err(|e| format!("Failed to delete file «{}»: {}", name, e))?;
    } else {
        return Err(format!("Nod «{}» not found", target.display()));
    }
    Ok(name)
}

#[inline]
fn is_markdown(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map_or(false, |ext| ext.eq_ignore_ascii_case("md"))
}

pub fn scan_flat(root: &Path) -> Vec<FileNode> {
    struct Tmp { path: PathBuf, name: String, node_type: String, id: String }

    let mut temp: Vec<Tmp> = WalkDir::new(root).min_depth(1)
        .into_iter()
        .par_bridge()
        .filter_map(Result::ok)
        .filter(|e| {
            let ft = e.file_type();
            ft.is_dir() || (ft.is_file() && is_markdown(e.path()))
        })
        .map(|e| {
            let p = e.path().to_path_buf();
            let name = e.file_name().to_string_lossy().into_owned();
            let id = ID_COUNTER.fetch_add(1, Ordering::Relaxed).to_string();
            let node_type = if e.file_type().is_dir() { "folder" } else { "file" };
            Tmp { path: p, name, node_type: node_type.into(), id }
        })
        .collect();

    let mut id_map = HashMap::with_capacity(temp.len());
    for entry in &temp {
        id_map.insert(entry.path.clone(), entry.id.clone());
    }

    let mut nodes = Vec::with_capacity(temp.len());
    for entry in temp {        
        let parent_id = entry.path.parent()
            .and_then(|p| id_map.get(p))
            .cloned();

        let expanded = if entry.node_type == "folder" { Some(false) } else { None };

        let node = FileNode {
            id: entry.id,
            parent_id,
            name: entry.name,
            node_type: entry.node_type,
            expanded,
        };
        nodes.push(node);
    }

    nodes
}
