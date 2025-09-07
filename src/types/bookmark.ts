export interface Bookmark {
  title: string;
  href: string;
  folder: string;
  icon?: string;
  addDate?: number;
}

export interface FolderNode {
  name: string;
  bookmarks: Bookmark[];
  children: Map<string, FolderNode>;
  parent?: FolderNode;
}
