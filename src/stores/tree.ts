import { writable, get } from 'svelte/store'
import type { FileNode, FileTreeState, FileNodeType } from '$lib/FileNodes_types'
import { listen } from '@tauri-apps/api/event'
import { tick } from 'svelte'

export const treeData = writable<FileTreeState>({
  nodes: new Map(),
  children: new Map(),
  rootPaths: []
})

const CHUNK_SIZE = 500;
export const selectedPath = writable<string | undefined>(undefined)

const isRoot = writable<boolean>(false);

export function updateSelectedPath(path: string) {
  selectedPath.set(path);
}

export function findNodeByPath(id: string): FileNode | undefined {
  return get(treeData).nodes.get(id);
}

export function addNode(parentPath: string | null, node: FileNode) {
  treeData.update(state => {
    state.nodes.set(node.path, { ...node, expanded: false })

    if (!state.children.has(node.path)) {
      state.children.set(node.path, [])
    }

    if (parentPath === null) {
      state.rootPaths.push(node.path)
    } else {
      state.children.get(parentPath)!.push(node.path)
    }
    return state
  })
}

export function resetTreeData(): void {
  treeData.set({
    nodes: new Map<string, FileNode>(),
    children: new Map<string, string[]>(),
    rootPaths: []
  })
}

listen<string>('scan-change-path', ({ payload }) => {
  if (get(treeData).rootPaths.length === 0) {
    isRoot.set(true);
    return;
  }

  if (get(selectedPath) === payload) {
    return;
  }

  updateSelectedPath(payload);
})

listen<FileNode[]>('add-nodes', ({ payload }) => {
  const rootFlag = get(isRoot)
  const parentPath = get(selectedPath)

  treeData.update(state => {
    for (const node of payload) {
      const path = node.path

      state.nodes.set(path, { ...node, expanded: false })

      if (!state.children.has(path)) {
        state.children.set(path, [])
      }

      if (rootFlag) {
        if (!state.rootPaths.includes(path)) {
          state.rootPaths.push(path)
        }
        continue
      }

      if (!parentPath) continue
      const arr = state.children.get(parentPath)
      if (arr) {
        arr.push(path)
      } else {
        state.children.set(parentPath, [path])
      }
    }
    return state
  })
})

listen<string>('scan-complete', ({ payload }) => {
  isRoot.set(false);
  console.log('scan complete', payload);
})
