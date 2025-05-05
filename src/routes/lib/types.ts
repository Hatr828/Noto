export interface FileNode {
    nodePath: string;
    title: string;
    hasChildren: boolean;
    childrenArray?: FileNode[];
}
  