// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[path = "FileExplorer/commands.rs"]
mod commands;
#[path = "FileExplorer/file_node.rs"]
mod file_node;

use tauri::{generate_context, generate_handler, Builder};

fn main() {
    Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(generate_handler![
            // Menu Bar
            commands::scan_folder,
            commands::add_folder,
            commands::add_md_file,
            commands::delete_node,
            commands::read_markdown,
            commands::save_markdown
            //end
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}
