export interface Bookmark {
  title: string;
  url: string;
  folder: string;
  icon?: string;
  addDate?: number;
}

export interface SearchOptions {
  includeWords: string[];
  excludeWords?: string[];
  caseSensitive?: boolean;
  searchInUrl?: boolean;
  searchInTitle?: boolean;
  searchInFolder?: boolean;
  useRegex?: boolean;
  regexFlags?: string;
}
