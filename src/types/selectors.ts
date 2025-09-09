export interface BaseSelectors {
  list: string;
  item: string;
  title: string;
  href: string;
}

export interface MangaSelectors extends BaseSelectors {
  nextPage: (currentPage: number) => string;
}

export interface TwitterSavedSelectors extends BaseSelectors {
  savedButton: string;
}
