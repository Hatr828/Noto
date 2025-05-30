// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[path = "FileExplorer/file_node.rs"]
mod file_node;
#[path = "FileExplorer/commands.rs"]
mod commands;

use tauri::{Builder, generate_handler, generate_context};

fn main() {
  Builder::default()
  .plugin(tauri_plugin_dialog::init())
    .invoke_handler(generate_handler![
      // Menu Bar
      commands::scan_folder,
      commands::add_folder,
      commands::add_md_file,
      commands::delete_node
      //end
    ])
    .run(generate_context!())
    .expect("error while running tauri application");
}
