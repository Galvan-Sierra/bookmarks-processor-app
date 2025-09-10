export interface BaseSelectors {
  list: string;
  item: string;
  title: string;
  href: string;
}

// --- Twitter Saved Selectors ---
export interface TwitterSavedSelectors extends BaseSelectors {
  savedButton: string;
}

// --- Manga Selectors ---
export interface MangaSelectors extends BaseSelectors {
  nextPage: (currentPage: number) => string;
}
