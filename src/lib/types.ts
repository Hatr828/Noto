export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  expanded?: boolean;
  children?: FileNode[];
}