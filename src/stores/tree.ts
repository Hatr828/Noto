import { writable, get } from 'svelte/store'
import type { FileNode } from '$lib/types'
import { listen } from '@tauri-apps/api/event'

export const tree = writable<FileNode[]>([])
export const selectedPath = writable<string | null>(null)
export const selectedNode = writable<FileNode | undefined>(undefined)

const toRoot = writable<boolean>(false)

export function findNodeByPath(nodes: FileNode[], targetPath: string): FileNode | undefined {
    let currentNodes = nodes
    while (true) {
        const current = currentNodes.find(n => targetPath.indexOf(n.path) > -1)
        if (!current) return undefined
        if (current.path.length === targetPath.length) return current
        currentNodes = current.children ?? []
    }
}

listen<string>('scan-change-path', ({ payload }) => {
    selectedPath.set(payload)

    const nodes = get(tree)

    if (nodes.length === 0) {
        toRoot.set(true);
        return;
    }
    else {
        toRoot.set(false);
    }


    const node = findNodeByPath(nodes, payload)

    selectedNode.set(node)
})

listen<FileNode>('scan-node', ({ payload }) => {
    if (get(toRoot)) {
        tree.update(nodes => [...nodes, payload])
        return
    }



    const node = get(selectedNode)
    if (!node) {
        return;
    }

    if (!node.children) node.children = []

    node.children.push(payload)

    tree.update(nodes => [...nodes])
})

listen<string>('scan-complete', ({ payload }) => {
    console.log('scan complete', payload)
})
