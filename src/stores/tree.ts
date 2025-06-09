import { writable, get } from 'svelte/store'
import { type FileNode, type FileTreeState, FileNodeType } from '$lib/FileNodes_types'
import { listen } from '@tauri-apps/api/event'
import { tick } from 'svelte'

export const treeData = writable<FileTreeState>({
  nodes: new Map(),
  children: new Map(),
  rootPaths: [],
  rootSource: null
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

function parseName(name: string): { base: string; index: number | null } {
  const lower = name.toLowerCase()
  const match = lower.match(/^(.*?)(?: \((\d+)\))?(\.[^.]+)?$/)
  if (match) {
    const base = (match[1] + (match[3] ?? "")).trim()
    const idx = match[2] ? parseInt(match[2], 10) : null
    return { base, index: idx }
  }
  return { base: lower, index: null }
}
function compareNodes(a: FileNode, b: FileNode): number {
  const aIsFolder = a.type === FileNodeType.Folder
  const bIsFolder = b.type === FileNodeType.Folder
  if (aIsFolder !== bIsFolder) {
    return aIsFolder ? -1 : 1
  }
  // оба одного типа
  const pa = parseName(a.name)
  const pb = parseName(b.name)
  const baseCmp = pa.base.localeCompare(pb.base)
  if (baseCmp !== 0) return baseCmp
  // если база совпадает — числа
  if (pa.index === null && pb.index === null) return 0
  if (pa.index === null) return -1    
  if (pb.index === null) return 1
  return pa.index - pb.index
}

/**
 * @return number from 0 to siblings.length.
 */
function findInsertIndex(
  siblings: string[],
  newNode: FileNode,
  nodesMap: Map<string, FileNode>
): number {
  let lo = 0
  let hi = siblings.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    const midNode = nodesMap.get(siblings[mid])!
    if (compareNodes(newNode, midNode) < 0) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }
  return lo
}

function insertSorted(
  siblings: string[],
  node: FileNode,
  nodesMap: Map<string, FileNode>
) {
  const idx = findInsertIndex(siblings, node, nodesMap)
  siblings.splice(idx, 0, node.path)
}

export function addNode(parentPath: string | null, node: FileNode) {
  treeData.update((state) => {
    state.nodes.set(node.path, { ...node, expanded: false })

    if (!state.children.has(node.path)) {
      state.children.set(node.path, [])
    }

    if (parentPath === null) {
      insertSorted(state.rootPaths, node, state.nodes)
    } else {
      insertSorted(state.children.get(parentPath)!, node, state.nodes)
    }

    return state
  })
}

export function resetTreeData(): void {
  treeData.set({
    nodes: new Map<string, FileNode>(),
    children: new Map<string, string[]>(),
    rootPaths: [],
    rootSource: null
  })
}

listen<string>('scan-change-path', ({ payload }) => {
  const state = get(treeData);
  if (state.rootPaths.length === 0) {
    isRoot.set(true);
    treeData.update(s => {
      s.rootSource = payload;
      return s;
    });
    return;
  }

  if (get(selectedPath) === payload) {
    return;
  }

  updateSelectedPath(payload);
});

listen<FileNode[]>('add-nodes', ({ payload }) => {
  console.log(payload);
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
