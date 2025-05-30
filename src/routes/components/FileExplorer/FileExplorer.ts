import type { FileNode } from '$lib/types';
import { startScan } from '$lib/apis/MenuBar_api';
import { invoke } from "@tauri-apps/api/core";
import { tree } from "$stores/tree";

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


export async function toggleFolder(parent: FileNode): Promise<void> {
  if (!parent.children) {
    parent.children = [];
  }
  if(parent.children.length === 0) {
    await startScan(parent.path);
  }
  
  parent.expanded = !parent.expanded;

  tree.update(nodes => [...nodes]);
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