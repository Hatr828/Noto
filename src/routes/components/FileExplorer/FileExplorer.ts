import type { FileNode } from '$lib/FileNodes_types';
import { startScan } from '$lib/apis/FileExplorer_api';
import { treeData, selectedPath, findNodeByPath, addNode } from '$stores/tree'

export async function toggleFolder(node: FileNode): Promise<void> {
  const path = node.path

  treeData.update(state => {
    if (!state.children.has(path)) {
      state.children.set(path, [])
    }
    const childIds = state.children.get(path)!

    if (childIds.length === 0) {
      startScan(path)
    }

    const stored = findNodeByPath(path)
    if (stored) {
      stored.expanded = !stored.expanded
    }
    return state
  })
}

export function addNodeAt(parentPath: string | null, nodeToAdd: FileNode): void {
  addNode(parentPath, nodeToAdd)
}

export function collapseAllFolders(): void {
  treeData.update(state => {
    for (const [, node] of state.nodes) {
      node.expanded = false
    }
    return state
  })
}