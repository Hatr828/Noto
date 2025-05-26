export interface FileNode {
  id: string;
  parentId: string | null;
  name: string;
  type: 'folder' | 'file';
  expanded?: boolean; 
}