import { FileNodeType, type FileNode, createFileNode } from '$lib/FileNodes_types';
import { startScan, addFolder, addMdFile } from '$lib/apis/FileExplorer_api';
import {
  treeData,
  selectedPath,
  findNodeByPath,
  addNode as storeAddNode,
} from '$stores/tree';
import { get } from "svelte/store";

function basename(path: string): string {
  const parts = path.split(/[/\\]+/)
  return parts[parts.length - 1] || ''
}

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

export async function createAndAddNode(
  parentNode: FileNode | null,
  nodeType: FileNodeType,
  name: string
): Promise<void> {
  const state = get(treeData)
  const basePath = parentNode ? parentNode.path : state.rootSource

  if (!basePath) {
    console.error(
      'Error basePath is null or undefined in FileExplorer, createAndAddNode'
    )
    return
  }

  try {
    let createdPath: string

    if (nodeType === FileNodeType.Folder) {
      createdPath = await addFolder(basePath, name)
    } else {
      createdPath = await addMdFile(basePath, name, '\n\n\n')
    }

    const finalName = basename(createdPath)

    const newPath = createdPath

    const newNode: FileNode = createFileNode(finalName, newPath, nodeType)
    storeAddNode(parentNode?.path ?? null, newNode)
  } catch (error) {
    console.error('Error while creating node:', error)
  }
}


export function collapseAllFolders(): void {
  treeData.update(state => {
    for (const [, node] of state.nodes) {
      node.expanded = false
    }
    return state
  })
}