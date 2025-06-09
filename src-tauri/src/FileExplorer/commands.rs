use crate::file_node::{FileNode, FileNodeType};
use std::cmp::Ordering;
use std::fs;
use std::io;
use std::io::Write;
use std::path::{Path, PathBuf};
use tauri::async_runtime::spawn_blocking;
use tauri::{Emitter, Window};
use walkdir::WalkDir;

fn unique_dir_path(dir: &Path, name: &str) -> io::Result<PathBuf> {
    let mut candidate = name.to_string();
    let mut count = 1;

    loop {
        let path = dir.join(&candidate);
        if !path.exists() {
            return Ok(path);
        }
        candidate = format!("{} ({})", name, count);
        count += 1;
    }
}

fn unique_md_path(dir: &Path, name: &str) -> io::Result<PathBuf> {
    let stem = if name.to_lowercase().ends_with(".md") {
        name[..name.len() - 3].to_string()
    } else {
        name.to_string()
    };

    let mut candidate = format!("{}.md", stem);
    let mut count = 1;

    loop {
        let path = dir.join(&candidate);
        if !path.exists() {
            return Ok(path);
        }
        candidate = format!("{} ({}).md", stem, count);
        count += 1;
    }
}

#[tauri::command]
pub async fn add_folder(base_dir: String, name: String) -> Result<String, String> {
    let base = PathBuf::from(base_dir);
    let new_dir = unique_dir_path(&base, &name)
        .map_err(|e| format!("Failed to determine unique folder name: {}", e))?;
    fs::create_dir(&new_dir)
        .map_err(|e| format!("Failed to create folder `{}`: {}", new_dir.display(), e))?;
    Ok(new_dir.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn add_md_file(base_dir: String, name: String, content: String) -> Result<String, String> {
    let base = PathBuf::from(base_dir);
    let file_path = unique_md_path(&base, &name)
        .map_err(|e| format!("Failed to determine unique file name: {}", e))?;
    let mut file = fs::File::create(&file_path)
        .map_err(|e| format!("Failed to create file `{}`: {}", file_path.display(), e))?;
    file.write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write to `{}`: {}", file_path.display(), e))?;
    Ok(file_path.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn delete_node(base_dir: String, name: String) -> Result<String, String> {
    let base = PathBuf::from(base_dir);
    let target = base.join(&name);

    if !target.exists() {
        return Err(format!("Node `{}` does not exist", target.display()));
    }

    if target.is_dir() {
        fs::remove_dir_all(&target)
            .map_err(|e| format!("Failed to remove directory `{}`: {}", target.display(), e))?;
    } else {
        fs::remove_file(&target)
            .map_err(|e| format!("Failed to remove file `{}`: {}", target.display(), e))?;
    }

    Ok(target.to_string_lossy().into_owned())
}

#[inline]
fn is_markdown(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map_or(false, |ext| ext.eq_ignore_ascii_case("md"))
}

#[tauri::command]
pub async fn scan_folder(path: String, window: Window) {
    let _ = window.emit("scan-change-path", &path);

    let mut entries: Vec<(String, String, FileNodeType)> = spawn_blocking({
        let path_clone = path.clone();
        move || {
            WalkDir::new(&path_clone)
                .min_depth(1)
                .max_depth(1)
                .into_iter()
                .filter_map(Result::ok)
                .filter(|e| e.file_type().is_dir() || is_markdown(e.path()))
                .map(|entry| {
                    let name = entry.file_name().to_string_lossy().to_string();
                    let path_str = entry.path().to_string_lossy().to_string();
                    let node_type = if entry.file_type().is_dir() {
                        FileNodeType::Folder
                    } else {
                        FileNodeType::Md
                    };
                    (name, path_str, node_type)
                })
                .collect()
        }
    })
    .await
    .unwrap_or_default();

    entries.sort_by(|a, b| match (&a.2, &b.2) {
        (FileNodeType::Folder, FileNodeType::Folder) => natural_cmp(&a.0, &b.0),
        (FileNodeType::Md, FileNodeType::Md) => natural_cmp(&a.0, &b.0),
        (FileNodeType::Folder, FileNodeType::Md) => Ordering::Less,
        (FileNodeType::Md, FileNodeType::Folder) => Ordering::Greater,
    });

    if !entries.is_empty() {
        let nodes: Vec<FileNode> = entries
            .into_iter()
            .map(|(name, p, t)| FileNode::new(name, p, t))
            .collect();
        let _ = window.emit("add-nodes", &nodes);
    }

    let _ = window.emit("scan-complete", &path);
}

fn natural_cmp(a: &str, b: &str) -> Ordering {
    let a_lower = a.to_lowercase();
    let b_lower = b.to_lowercase();

    let stem_a = Path::new(&a_lower)
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| a_lower.clone());
    let stem_b = Path::new(&b_lower)
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| b_lower.clone());

    let (base_a, idx_a) = split_base_index(&stem_a);
    let (base_b, idx_b) = split_base_index(&stem_b);

    match base_a.cmp(base_b) {
        Ordering::Equal => match (idx_a, idx_b) {
            (None, Some(_)) => Ordering::Less,
            (Some(_), None) => Ordering::Greater,
            (Some(x), Some(y)) => x.cmp(&y),
            (None, None) => a_lower.cmp(&b_lower),
        },
        other => other,
    }
}

fn split_base_index(s: &str) -> (&str, Option<u64>) {
    if let Some(end) = s.rfind(')') {
        if let Some(start) = s[..end].rfind('(') {
            let num_str = &s[start + 1..end];
            if let Ok(n) = num_str.parse::<u64>() {
                let base = s[..start].trim_end();
                return (base, Some(n));
            }
        }
    }
    (s, None)
}
