export interface Bookmark {
  title: string;
  href: string;
  folder: string;
  icon?: string;
  addDate?: number;
}

export interface SearchOptions {
  includeWords: string | string[];
  excludeWords?: string[];
  caseSensitive?: boolean;
  searchInHref?: boolean;
  searchInTitle?: boolean;
  searchInFolder?: boolean;
  useRegex?: boolean;
  regexFlags?: string;
}

export interface FolderNode {
  name: string;
  bookmarks: Bookmark[];
  children: Map<string, FolderNode>;
  parent?: FolderNode;
}
