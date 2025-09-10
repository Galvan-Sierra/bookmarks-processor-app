import type { Bookmark } from '@type/bookmark';
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

export interface twitterTrackerConfig
  extends BaseScraperConfig<TwitterSavedSelectors> {
  savedSelectors: TwitterSavedSelectors;
}
export interface MangaTrackerConfig extends BaseScraperConfig {
  selectors: MangaSelectors;
  initialPage?: number;
}

export interface TwitterBookmark extends Bookmark {
  folder: 'follow' | 'saved';
}

export interface AccountStats {
  follow: number;
  saved: number;
  total: number;
}

export type ScanMode = 'follow' | 'saved';
