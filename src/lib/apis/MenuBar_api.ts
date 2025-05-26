import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import type { FileNode } from '../types';

/**
 * Opens an directory scans all files and folders there.
 *
 * @returns TreeNode of directory
 */
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

/**
 * Creates a new folder inside the specified directory.
 * If a folder with the same name exists, appends `_i` until it's unique.
 *
 * @param baseDir - Absolute path to the target directory
 * @param name - Desired folder name (without suffix)
 * @returns The actual folder name created (possibly with `_i`)
 * @throws Error if creation fails
 */
export async function addFolder(
  baseDir: string,
  name: string
): Promise<string> {
  try {
    const createdName = await invoke<string>('add_folder', { baseDir, name });
    return createdName;
  } catch (err) {
    throw new Error(`Failed to create folder: ${err}`);
  }
}

/**
 * Creates a new Markdown file in the specified directory.
 * Ensures a unique name by appending `_i` before the `.md` extension if needed.
 *
 * @param baseDir - Absolute path to the target directory
 * @param name - Desired filename (with or without `.md`)
 * @param content - Initial file contents
 * @returns The actual filename created (with `.md` and possibly `_i`)
 * @throws Error if creation or write fails
 */
export async function addMdFile(
  baseDir: string,
  name: string,
  content: string
): Promise<string> {
  try {
    const filename = await invoke<string>('add_md_file', {
      baseDir,
      name,
      content
    });
    return filename;
  } catch (err) {
    throw new Error(`Failed to create markdown file: ${err}`);
  }
}

/**
 * Deletes the specified file or folder (recursively) inside the given directory.
 *
 * @param baseDir - Absolute path to the parent directory
 * @param name - Name of the file or folder to delete
 * @returns The name of the deleted node
 * @throws Error if deletion fails or node not found
 */
export async function deleteNode(
  baseDir: string,
  name: string
): Promise<string> {
  try {
    const deletedName = await invoke<string>('delete_node', { baseDir, name });
    return deletedName;
  } catch (err) {
    throw new Error(`Failed to delete node: ${err}`);
  }
}