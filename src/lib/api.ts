import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import type { FileNode } from './types';

//MenuBar command "OpenFile" dirrext involes in FileExplorer
export async function openFolderAndScan(): Promise<FileNode[]> {
  const selection = await open({ directory: true, multiple: false });
  if (Array.isArray(selection)) {
    if (selection.length === 0) return [];
    return invoke<FileNode[]>('open_folder', { path: selection[0] });
  }
  if (typeof selection === 'string') {
    return invoke<FileNode[]>('open_folder', { path: selection });
  }
  return [];
}
