import type {
  BaseSelectors,
  MangaSelectors,
  TwitterSavedSelectors,
} from '@type/selectors';

export interface BaseScraperConfig<T extends BaseSelectors = BaseSelectors> {
  pageName: string;
  selectors: T;
  normalizers?: {
    title?: NormalizeConfig;
    href?: NormalizeConfig;
  };
}

export interface NormalizeConfig {
  base: string;
  end: string;
}

export interface TwitterTrackerConfig extends BaseScraperConfig {
  savedSelectors: TwitterSavedSelectors;
}

// --- Manga Tracker Config ---

export interface MangaTrackerConfig extends BaseScraperConfig {
  selectors: MangaSelectors;
  initialPage?: number;
}
