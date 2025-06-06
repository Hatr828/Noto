export interface FileNode {
  name: string;
  path: string;
  type: FileNodeType;
  expanded: boolean;
}

export enum FileNodeType {
  Folder = 'folder',
  Md = 'md',
}

export interface FileTreeState {
  nodes: Map<string, FileNode>      // key = node.path
  children: Map<string, string[]>   
  rootPaths: string[]               
}

export interface FlattenedItem {
  node: FileNode
  depth: number
}

export function createFileNode(name: string, path: string, type: FileNodeType, expanded: boolean = false): FileNode {
  return {
    name: name,
    type: type,
    path: path,
    expanded: false,
  }
}

export function flatten(treeState: FileTreeState): FlattenedItem[] {
  const { nodes, children, rootPaths } = treeState
  const out: FlattenedItem[] = []

  function dfs(path: string, depth: number) {
    const node = nodes.get(path)
    if (!node) return
    out.push({ node, depth })
    if (node.type === FileNodeType.Folder && node.expanded) {
      const childPaths = children.get(path) || []
      for (const childPath of childPaths) {
        dfs(childPath, depth + 1)
      }
    }
  }

  for (const rootPath of rootPaths) {
    dfs(rootPath, 0)
  }
  return out
}

export function getFileNodeAsString(node: FileNode): Array<[string, string]> {
  return [
    ["name: ", node.name],
    ["path: ", node.path],
    ["type: ", node.type.toString()],
    ["expanded: ", node.expanded.toString()]
  ]
}