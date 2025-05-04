import { writable } from 'svelte/store';
import type { FileNode } from './types';

export const treeStore = writable<FileNode[]>([]);

export const currentContent = writable<string>('');
