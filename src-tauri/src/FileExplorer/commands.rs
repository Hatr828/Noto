use walkdir::WalkDir;
use tauri::{Window, Emitter};
use std::{path::{Path, PathBuf}};
use crate::file_node::FileNode;
use std::fs;
use std::io::Write;

#[tauri::command]
pub fn add_folder(base_dir: String, name: String) -> Result<String, String> {
    let base = PathBuf::from(base_dir);
    let new_dir = base.join(&name);

    fs::create_dir(&new_dir)
        .map_err(|e| format!("Failed to create folder `{}`: {}", new_dir.display(), e))?;

    Ok(new_dir.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn add_md_file(
    base_dir: String,
    name: String,
    content: String,
) -> Result<String, String> {
    let mut file_name = name;
    if !file_name.to_lowercase().ends_with(".md") {
        file_name.push_str(".md");
    }

    let base = PathBuf::from(base_dir);
    let file_path = base.join(&file_name);

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
  if let Err(e) = window.emit("scan-change-path", &path) {
    eprintln!("Failed to emit `scan-change-path` for {}: {:?}", path, e);
  }

  for entry in WalkDir::new(&path)
    .min_depth(1)
    .max_depth(1)
    .into_iter()
    .filter_map(Result::ok)
  {
    let name = entry.file_name().to_string_lossy().to_string();
    let path_str = entry.path().to_string_lossy().to_string();

    let file_node = if entry.file_type().is_dir() {
      FileNode::new_folder(name, path_str)
    } else if is_markdown(entry.path()) {
      FileNode::new_file(name, path_str)
    } else {
      continue;
    };

    if let Err(e) = window.emit("scan-node", &file_node) {
      eprintln!(
        "Failed to emit `scan-node` for {:?}: {:?}",
        file_node.path, e
      );
    }
  }

  if let Err(e) = window.emit("scan-complete", &path) {
    eprintln!("Failed to emit `scan-complete` for {}: {:?}", path, e);
  }
}