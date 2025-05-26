// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[path = "FileExplorer/file_node.rs"]
mod file_node;
#[path = "FileExplorer/commands.rs"]
mod commands;

use tauri::{Builder, generate_handler, generate_context};
use crate::commands::scan_children;
use crate::file_node::FileNode;
use std::path::Path;

#[tauri::command]
fn open_folder(path: String) -> Vec<FileNode> {
  scan_children(Path::new(&path))
}

fn main() {
  Builder::default()
  .plugin(tauri_plugin_dialog::init())
    .invoke_handler(generate_handler![open_folder])
    .run(generate_context!())
    .expect("error while running tauri application");
}
