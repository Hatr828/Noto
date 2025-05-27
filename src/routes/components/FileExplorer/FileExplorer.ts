import type { FileNode } from '$lib/types';
import { invoke } from "@tauri-apps/api/core";

export interface NodeWithDepth {
  node: FileNode;
  depth: number;
}

export function flatten(roots: FileNode[]): NodeWithDepth[] {
  const out: NodeWithDepth[] = [];
  const dfs = (node: FileNode, depth: number) => {
    out.push({ node, depth });
    if (node.type === 'folder' && node.expanded && node.children) {
      for (const child of node.children) {
        dfs(child, depth + 1);
      }
    }
  };
  for (const root of roots) dfs(root, 0);
  return out;
}


function mapTree(
  nodes: FileNode[],
  updater: (node: FileNode) => FileNode
): FileNode[] {
  return nodes.map(n => {
    const updated = updater(n);
    if (updated.children) {
      return {
        ...updated,
        children: mapTree(updated.children, updater),
      };
    }
    return updated;
  });
}


export async function toggleFolder(
  roots: FileNode[],
  id: string
): Promise<FileNode[]> {
  async function recurse(nodes: FileNode[]): Promise<FileNode[]> {
    return Promise.all(
      nodes.map(async (node) => {
        if (node.id === id && node.type === 'folder') {
          const expanded = !node.expanded;
          let children = node.children;

          if (expanded && (!children || children.length === 0)) {
            try {
              const loaded = await invoke<FileNode[]>('open_folder', { path: node.path });
              children = loaded;
            } catch (e) {
              console.error('Failed to load folder contents', e);
            }
          }

          return { ...node, expanded, children };
        }

        if (node.children) {
          const children = await recurse(node.children);
          return { ...node, children };
        }

        return node;
      })
    );
  }

  return recurse(roots);
}

export function addNodeAt(
  roots: FileNode[],
  parentId: string | null,
  nodeToAdd: FileNode
): FileNode[] {
  if (parentId === null) {
    return [...roots, nodeToAdd];
  }
  return roots.map(n => {
    if (n.id === parentId && n.type === 'folder') {
      const children = n.children ? [...n.children, nodeToAdd] : [nodeToAdd];
      return { ...n, children };
    }
    if (n.children) {
      return { ...n, children: addNodeAt(n.children, parentId, nodeToAdd) };
    }
    return n;
  });
}

export function collapseAllFolders(roots: FileNode[]): FileNode[] {
  return mapTree(roots, node => {
    if (node.type === 'folder') {
      return { ...node, expanded: false };
    }
    return node;
  });
}

export function createTreeNode(
  type: 'folder' | 'file',
  parentPath: string,
  name?: string
): FileNode {
  const nodeName = name
    ? name
    : type === 'folder'
    ? 'New Folder'
    : 'New File.md';

  const base = parentPath.replace(/\/+$/, '');
  const fullPath = base === '' ? nodeName : `${base}/${nodeName}`;

  return {
    id: crypto.randomUUID(),
    name: nodeName,
    type,
    path: fullPath,
    expanded: false,
    children: type === 'folder' ? [] : undefined,
  };
}