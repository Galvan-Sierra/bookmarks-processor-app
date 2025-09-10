import {
  TWITTER_CONFIG,
  FOLLOW_SELECTORS,
  SAVED_SELECTORS,
} from '@config/scraping-sites';
import { BaseScraper } from '@scrapers/base.scraper';
import type {
  BaseScraperConfig,
  ScanMode,
  TwitterBookmark,
  AccountStats,
} from '@type/scraping';
import type { BaseSelectors, TwitterSavedSelectors } from '@type/selectors';
import { DOMHelper } from '@utils/dom';

const MAX_SAVED_BATCH = 2;

class TwitterAccountTracker extends BaseScraper {
  constructor(
    config: BaseScraperConfig,
    private followSelectors: BaseSelectors,
    private savedSelectors: TwitterSavedSelectors
  ) {
    super(config);
  }

  start(mode: ScanMode, intervalSeconds: number = 1): void {
    if (this.intervalId) {
      console.warn(`🔄 TwitterAccountTracker ya está ejecutándose (${mode})`);
      return;
    }

    const scanFunction =
      mode === 'follow'
        ? () => this.scanFollowAccounts()
        : () => this.scanSavedAccounts();

    this.intervalId = setInterval(() => {
      scanFunction();
      this.logScanProgress(mode);
    }, this.DEFAULT_INTERVAL * intervalSeconds);

    console.log(`🚀 TwitterAccountTracker iniciado (modo: ${mode})`);
  }

  printStats(): void {
    const stats = this.getAccountStats();
    console.log(`📈 Estadísticas:
    - Seguidos: ${stats.follow}
    - Guardados: ${stats.saved}
    - Total: ${stats.total}`);
  }

  private scanFollowAccounts(): void {
    const list = DOMHelper.querySelector(this.followSelectors.list);

    if (!list) return;

    const accountElements = DOMHelper.querySelectorAll(
      this.followSelectors.item,
      list
    );

    this.processAccountElements(
      accountElements,
      this.followSelectors,
      'follow'
    );
  }

  private scanSavedAccounts(): void {
    const list = DOMHelper.querySelector(this.savedSelectors.list);
    if (!list) {
      console.warn('⚠️ Lista de guardados no encontrada');
      return;
    }

    const savedElements = list.querySelectorAll(this.savedSelectors.item);
    const savedItems = Array.from(savedElements).slice(0, MAX_SAVED_BATCH);

    if (savedItems.length === 0) {
      console.warn('⚠️ No se encontraron elementos guardados');
      return;
    }

    this.processSavedElements(savedItems, this.savedSelectors, 'saved');
  }

  private processAccountElements(
    elements: NodeListOf<Element>,
    selectors: BaseSelectors,
    folder: TwitterBookmark['folder']
  ): void {
    elements.forEach((element) => {
      const title = DOMHelper.extractCompleteText(element, selectors.title);
      const href = DOMHelper.extractHref(element, selectors.href);

      if (!this.itemExists(href)) {
        this.addItem({ title, href, folder });
        console.log(
          `${
            folder === 'follow' ? '👥' : '💾'
          } Nueva cuenta ${folder}: ${title} (${href})`
        );
      }
    });
  }

  private processSavedElements(
    elements: Element[],
    selectors: TwitterSavedSelectors,
    folder: TwitterBookmark['folder']
  ): void {
    elements.forEach((element) => {
      const title = DOMHelper.extractCompleteText(element, selectors.title);
      const href = DOMHelper.extractHref(element, selectors.href);

      if (!this.itemExists(href)) {
        this.addItem({ title, href, folder });
        console.log(`💾 Nueva cuenta ${folder}: ${title} (${href})`);
      }

      DOMHelper.clickElement(element);
    });
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

const twitterTracker = new TwitterAccountTracker(
  TWITTER_CONFIG,
  FOLLOW_SELECTORS,
  SAVED_SELECTORS
);
