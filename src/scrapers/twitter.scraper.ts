import type { TwitterBookmark, ScanMode, AccountStats } from '@type/scraping';
import type { BaseSelectors, TwitterSavedSelectors } from '@type/selectors';

// CONSTANTS
const BASE_URL = 'https://x.com';
const MEDIA_PATH = '/media';
const DEFAULT_INTERVAL = 1000; // 1 second
const MAX_SAVED_BATCH = 2; // Maximum saved elements to process per scan

// UTILITY FUNCTIONS
const createDownloadLink = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const normalizeTwitterUrl = (url: string): string => {
  if (!url) return '';

  let normalizedUrl = url.startsWith(BASE_URL) ? url : `${BASE_URL}${url}`;

  if (!normalizedUrl.endsWith(MEDIA_PATH)) normalizedUrl += MEDIA_PATH;

  return normalizedUrl;
};

// MAIN CLASS
class TwitterAccountTracker {
  private accounts = new Map<string, TwitterBookmark>();
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private followSelectors: BaseSelectors,
    private savedSelectors: TwitterSavedSelectors
  ) {}

  // PUBLIC METHODS
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
    }, DEFAULT_INTERVAL * intervalSeconds);

    console.log(`🚀 TwitterAccountTracker iniciado (modo: ${mode})`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ TwitterAccountTracker detenido');
    }
  }

  addAccounts(accounts: TwitterBookmark[]): void {
    let addedCount = 0;
    accounts.forEach((account) => {
      if (!this.accountExists(account.href)) {
        this.addAccount(account);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      console.log(`📥 ${addedCount} cuentas añadidas manualmente`);
    }
  }

  clearAccounts(): void {
    const count = this.accounts.size;
    this.accounts.clear();
    console.log(`🗑️ ${count} cuentas eliminadas`);
  }

  getAccounts(): TwitterBookmark[] {
    return Array.from(this.accounts.values());
  }

  printStats(): void {
    const stats = this.getAccountStats();
    console.log(`📈 Estadísticas:
    - Seguidos: ${stats.follow}
    - Guardados: ${stats.saved}
    - Total: ${stats.total}`);
  }

  downloadJSON(): void {
    const accounts = this.getAccounts();
    const jsonData = JSON.stringify(accounts, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    createDownloadLink(blob, 'twitter-accounts.json');
    console.log(`📁 Descargando ${accounts.length} cuentas`);
  }

  // PRIVATE SCANNING METHODS
  private scanFollowAccounts(): void {
    const list = this.querySelector(this.followSelectors.list);
    if (!list) {
      console.warn('⚠️ Lista de follows no encontrada');
      return;
    }

    const accountElements = list.querySelectorAll(this.followSelectors.item);
    this.processAccountElements(
      accountElements,
      this.followSelectors,
      'follow'
    );
  }

  private scanSavedAccounts(): void {
    const list = this.querySelector(this.savedSelectors.list);
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
      const title = this.extractCompleteText(element, selectors.title);
      const href = this.extractHref(element, selectors.href);

      if (this.isValidAccountData(title, href) && !this.accountExists(href)) {
        this.addAccount({ title, href, folder });
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
      const title = this.extractCompleteText(element, selectors.title);
      const href = this.extractHref(element, selectors.href);

      if (this.isValidAccountData(title, href) && !this.accountExists(href)) {
        this.addAccount({ title, href, folder });
        console.log(`💾 Nueva cuenta ${folder}: ${title} (${href})`);
      }

      // Intentar hacer click en el botón de guardar
      this.clickSaveButton(element);
    });
  }

  // TEXT EXTRACTION METHODS
  private extractCompleteText(element: Element, selector: string): string {
    const targetElement = this.querySelector(selector, element);
    if (!targetElement) return '';

    return this.extractTextFromNode(targetElement);
  }

  private extractTextFromNode(node: Node): string {
    let text = '';

    for (const childNode of Array.from(node.childNodes)) {
      if (childNode.nodeType === Node.TEXT_NODE) {
        text += childNode.textContent || '';
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        const element = childNode as Element;
        text += this.extractTextFromElement(element);
      }
    }

    return text.trim();
  }

  private extractTextFromElement(element: Element): string {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case 'img':
        return element.getAttribute('alt') || '';
      case 'span':
        return this.extractTextFromNode(element);
      default:
        return element.textContent || '';
    }
  }

  private extractHref(element: Element, selector: string): string {
    return this.querySelector(selector, element)?.getAttribute('href') || '';
  }

  // HELPER METHODS
  private querySelector(
    selector: string,
    parent: Element | Document = document
  ): Element | null {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      console.error(`Selector inválido: ${selector}`, error);
      return null;
    }
  }

  private clickSaveButton(element: Element): void {
    try {
      const saveButton = this.querySelector(
        this.savedSelectors.savedButton,
        element
      ) as HTMLButtonElement;

      if (saveButton) {
        saveButton.click();
      }
    } catch (error) {
      console.warn('❌ Botón de guardar no encontrado');
    }
  }

  private isValidAccountData(title: string, href: string): boolean {
    return Boolean(title?.trim() && href?.startsWith('/'));
  }

  private accountExists(href: string): boolean {
    const normalizedUrl = normalizeTwitterUrl(href);
    return this.accounts.has(normalizedUrl);
  }

  private addAccount(account: TwitterBookmark): void {
    const normalizedHref = normalizeTwitterUrl(account.href);
    this.accounts.set(normalizedHref, { ...account, href: normalizedHref });
  }

  private getAccountStats(): AccountStats {
    const accounts = this.getAccounts();
    const followCount = accounts.filter(
      (acc) => acc.folder === 'follow'
    ).length;
    const savedCount = accounts.filter((acc) => acc.folder === 'saved').length;

    return {
      follow: followCount,
      saved: savedCount,
      total: this.accounts.size,
    };
  }

  private logScanProgress(mode: ScanMode): void {
    console.log(
      `📊 [${mode.toUpperCase()}] Cuentas escaneadas: ${this.accounts.size}`
    );
  }
}

// CONFIGURATION
const FOLLOW_SELECTORS: BaseSelectors = {
  list: '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > section > div > div',
  item: 'div',
  title:
    'div > div > button > div > div.css-175oi2r.r-1iusvr4.r-16y2uox > div.css-175oi2r.r-1awozwy.r-18u37iz.r-1wtj0ep > div.css-175oi2r.r-1wbh5a2.r-dnmrzs.r-1ny4l3l > div > div.css-175oi2r.r-1wbh5a2.r-dnmrzs > a > div.css-175oi2r.r-1awozwy.r-18u37iz.r-dnmrzs > div.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-b88u0q.r-1awozwy.r-6koalj.r-1udh08x.r-3s2u2q > span.css-1jxf684.r-dnmrzs.r-1udh08x.r-1udbk01.r-3s2u2q.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3',
  href: 'div > div > button > div > div.css-175oi2r.r-1iusvr4.r-16y2uox > div.css-175oi2r.r-1awozwy.r-18u37iz.r-1wtj0ep > div.css-175oi2r.r-1wbh5a2.r-dnmrzs.r-1ny4l3l > div > div.css-175oi2r.r-1wbh5a2.r-dnmrzs > a',
};

const SAVED_SELECTORS: TwitterSavedSelectors = {
  list: 'div[aria-label="Cronología: Guardados"]',
  item: 'article[data-testid="tweet"]',
  title: 'span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3',
  href: 'a[role="link"]',
  savedButton: 'button[data-testid="removeBookmark"]',
};

// INITIALIZATION
const twitterTracker = new TwitterAccountTracker(
  FOLLOW_SELECTORS,
  SAVED_SELECTORS
);

// USAGE EXAMPLES
// twitterTracker.start('follow');
// twitterTracker.start('saved');
// twitterTracker.printStats();
// twitterTracker.stop();
// twitterTracker.downloadJSON();
