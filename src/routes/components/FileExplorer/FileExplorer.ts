import type { FileNode } from '$lib/types';


export interface NodeWithDepth {
  node: FileNode;
  depth: number;
}

export function flatten(
  nodes: FileNode[]
): NodeWithDepth[] {
  const childrenByParent = new Map<string|null, FileNode[]>()
  for (const n of nodes) {
    const list = childrenByParent.get(n.parentId) ?? []
    list.push(n)
    childrenByParent.set(n.parentId, list)
  }

  const out: NodeWithDepth[] = []
  function dfs(parentId: string|null, depth: number) {
    const children = childrenByParent.get(parentId)
    if (!children) return
    for (const n of children) {
      out.push({ node: n, depth })
      if (n.type === 'folder' && n.expanded) {
        dfs(n.id, depth + 1)
      }
    }
  }
  dfs(null, 0)
  return out
}

export function toggle(nodes: FileNode[], id: string): FileNode[] {
  return nodes.map(n =>
    n.id === id && n.type === 'folder'
      ? { ...n, expanded: !n.expanded }
      : n
  );
}

export function addNode(
  nodes: FileNode[],
  parentId: string | null,
  isFolder: boolean
): FileNode[] {
  const newNode: FileNode = {
    id: Date.now().toString(),
    parentId,
    name: isFolder ? 'New Folder' : 'New File.md',
    type: isFolder ? 'folder' : 'file',
    expanded: isFolder, 
  };
  return [...nodes, newNode];
}

export function expandAll(nodes: FileNode[]): FileNode[] {
  return nodes.map(n =>
    n.type === 'folder' ? { ...n, expanded: true } : n
  );
}

/** Set expanded=false on _all_ folders */
export function collapseAll(nodes: FileNode[]): FileNode[] {
  return nodes.map(n =>
    n.type === 'folder' ? { ...n, expanded: false } : n
  );
}

export function deleteNode(nodes: FileNode[], id: string): FileNode[] {
  const toRemove = new Set<string>();
  function mark(id: string) {
    toRemove.add(id);
    nodes
      .filter(n => n.parentId === id)
      .forEach(child => mark(child.id));
  }
  mark(id);
  return nodes.filter(n => !toRemove.has(n.id));
}