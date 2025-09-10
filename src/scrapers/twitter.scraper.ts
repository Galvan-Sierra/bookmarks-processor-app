import { TWITTER_CONFIG } from '@config/scraping-sites';
import { BaseScraper } from '@scrapers/base.scraper';
import { DOMHelper } from '@utils/dom';

import type { Bookmark } from '@type/bookmark';
import type { TwitterTrackerConfig } from '@type/scraping';
import type { BaseSelectors, TwitterSavedSelectors } from '@type/selectors';

export interface TwitterBookmark extends Bookmark {
  folder: 'follow' | 'saved';
}

export interface AccountStats {
  follow: number;
  saved: number;
  total: number;
}

export type ScanMode = 'follow' | 'saved';

const MAX_SAVED_BATCH = 2;

class TwitterAccountTracker extends BaseScraper<TwitterTrackerConfig> {
  private mode: ScanMode = 'follow';
  private intervalSeconds: number = 1;

  constructor(config: TwitterTrackerConfig) {
    super(config);
  }

  configure(mode: ScanMode, intervalSeconds = 1): this {
    this.mode = mode;
    this.intervalSeconds = intervalSeconds;
    return this;
  }

  setupInterval(): void {
    const selectors =
      this.mode === 'follow'
        ? this.config.selectors
        : this.config.savedSelectors;

    const scanFunction =
      this.mode === 'follow'
        ? () => this.scanItems(selectors)
        : () => this.scanItems(selectors);

    this.intervalId = setInterval(() => {
      scanFunction();
      this.logScanProgress(this.mode);
    }, this.DEFAULT_INTERVAL * this.intervalSeconds);
  }

  protected getTrackerName(): string {
    return 'TwitterAccountTracker';
  }

  printStats(): void {
    const stats = this.getAccountStats();
    console.log(`📈 Estadísticas:
    - Seguidos: ${stats.follow}
    - Guardados: ${stats.saved}
    - Total: ${stats.total}`);
  }

  processItems(
    elements: Element[],
    selectors: BaseSelectors | TwitterSavedSelectors
  ): void {
    const folder = this.mode === 'follow' ? 'follow' : 'saved';

    if (this.mode === 'saved') {
      elements = elements.slice(0, MAX_SAVED_BATCH);
    }

    for (const element of elements) {
      const title = DOMHelper.extractCompleteText(element, selectors.title);
      const href = DOMHelper.extractHref(element, selectors.href);

      if (!this.itemExists(href)) {
        this.addItem({ title, href, folder });

        console.log(`💾 Nueva cuenta ${folder}: ${title} (${href})`);
      }

      if (this.mode === 'saved' && 'savedButton' in selectors) {
        const saveButton = DOMHelper.querySelector(
          selectors.savedButton,
          element
        ) as HTMLButtonElement;

        DOMHelper.clickElement(saveButton);
      }
    }
  }

  private getAccountStats(): AccountStats {
    const accounts = this.getItems();
    const followCount = accounts.filter(
      (acc) => acc.folder === 'follow'
    ).length;
    const savedCount = accounts.filter((acc) => acc.folder === 'saved').length;

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
twitterTracker.configure('follow').start();
