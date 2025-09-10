import { TWITTER_CONFIG } from '@config/scraping-sites';
import { BaseScraper } from '@scrapers/base.scraper';
import { DOMHelper } from '@utils/dom';

import type { Bookmark } from '@type/bookmark';
import type { TwitterTrackerConfig } from '@type/scraping';
import type { BaseSelectors, TwitterSavedSelectors } from '@type/selectors';

enum Folder {
  FOLLOW = '🐤 twitter > follow',
  SAVED = '🐤 twitter > saved',
}
export interface TwitterBookmark extends Bookmark {
  folder: Folder;
}

export interface AccountStats {
  follow: number;
  saved: number;
  total: number;
}

export type ScanMode = keyof typeof Folder;

class TwitterAccountTracker extends BaseScraper<TwitterTrackerConfig> {
  private mode: ScanMode = 'FOLLOW';
  private intervalSeconds: number = 1;
  private maxSavedBatch = 2;

  constructor(config: TwitterTrackerConfig) {
    super(config);
  }

  configure(mode: ScanMode, maxSavedBatch = 2, intervalSeconds = 1): this {
    this.mode = mode;
    this.intervalSeconds = intervalSeconds;
    this.maxSavedBatch = maxSavedBatch;
    return this;
  }

  setupInterval(): void {
    const selectors =
      this.mode === 'FOLLOW'
        ? this.config.selectors
        : this.config.savedSelectors;

    this.intervalId = setInterval(() => {
      this.scanItems(selectors);

      this.logScanProgress(this.mode);
    }, this.DEFAULT_INTERVAL * this.intervalSeconds);
  }

  processItems(
    elements: Element[],
    selectors: BaseSelectors | TwitterSavedSelectors
  ): void {
    const folder = this.mode === 'FOLLOW' ? Folder.FOLLOW : Folder.SAVED;
    const isSavedMode = this.mode === 'SAVED';

    if (isSavedMode) {
      elements = elements.slice(0, this.maxSavedBatch);
    }

    for (const element of elements) {
      const title = DOMHelper.extractCompleteText(element, selectors.title);
      const href = DOMHelper.extractHref(element, selectors.href);

      const normalizedHref = this.normalizeHref(href);

      if (!this.itemExists(normalizedHref)) {
        this.addItem({ title, href, folder });
        console.log(`💾 Nueva cuenta ${this.mode}: ${title} (${href})`);
      }

      if (isSavedMode && 'savedButton' in selectors) {
        const saveButton = DOMHelper.querySelector(
          selectors.savedButton,
          element
        ) as HTMLButtonElement;

        DOMHelper.clickElement(saveButton);
      }
    }
  }

  getTrackerName(): string {
    return 'TwitterAccountTracker';
  }

  printStats(): void {
    const stats = this.getAccountStats();
    console.log(`📈 Estadísticas:
    - Seguidos: ${stats.follow}
    - Guardados: ${stats.saved}
    - Total: ${stats.total}`);
  }

  private getAccountStats(): AccountStats {
    const accounts = this.getItems();

    const followCount = accounts.filter(
      (acc) => acc.folder === Folder.FOLLOW
    ).length;

    const savedCount = accounts.filter(
      (acc) => acc.folder === Folder.SAVED
    ).length;

    return {
      follow: followCount,
      saved: savedCount,
      total: this.items.size,
    };
  }

  private logScanProgress(mode: ScanMode): void {
    console.log(
      `📊 [${mode.toUpperCase()}] Cuentas escaneadas: ${this.items.size}`
    );
  }
}

const twitterTracker = new TwitterAccountTracker(TWITTER_CONFIG);
twitterTracker.configure('FOLLOW').start();
