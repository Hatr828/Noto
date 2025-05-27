export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  expanded: boolean;
  children?: FileNode[];
}
