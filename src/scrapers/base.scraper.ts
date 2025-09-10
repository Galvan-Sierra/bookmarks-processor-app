import type { Bookmark } from '@type/bookmark';
import type { BaseScraperConfig } from '@type/scraping';
import { createDownloadLink } from '@utils/scraping-utils';

export abstract class BaseScraper<
  TConfig extends BaseScraperConfig = BaseScraperConfig,
  TBookmark extends Bookmark = Bookmark
> {
  protected items: Map<string, TBookmark> = new Map();
  protected intervalId: NodeJS.Timeout | null = null;
  protected DEFAULT_INTERVAL = 1000; // 1 second

  constructor(protected config: TConfig) {}

  protected addItems(...items: TBookmark[]): void {
    let addedCount = 0;

    items.forEach((item) => {
      if (!this.itemExists(item.href)) {
        this.addItem(item);
        addedCount++;
      }
    });

    if (addedCount > 0)
      console.log(`📥 ${addedCount} cuentas añadidas manualmente`);
  }

  protected addItem(item: TBookmark): void {
    const normalizedHref = this.normalizeHref(item.href);
    const normalizedTitle = this.normalizeTitle(item.title);

    this.items.set(normalizedHref, {
      ...item,
      title: normalizedTitle,
      href: normalizedHref,
    });
  }

  protected clearItems(): void {
    const count = this.items.size;
    this.items.clear();
    console.log(`🗑️ ${count} marcadores eliminadas`);
  }

  protected getItems(): TBookmark[] {
    return Array.from(this.items.values());
  }
  protected normalizeHref(href: string): string {
    const normalizer = this.config.normalizers?.href;

    if (!normalizer || !href) return href;

    const { base: baseUrl, end: urlEnd } = normalizer;

    let normalizedUrl = href;

    if (!normalizedUrl.startsWith(baseUrl))
      normalizedUrl = `${baseUrl}${normalizedUrl}`;

    if (!normalizedUrl.endsWith(urlEnd)) normalizedUrl += urlEnd;

    return normalizedUrl;
  }

  protected normalizeTitle(title: string): string {
    const normalizer = this.config.normalizers?.title;

    if (!normalizer || !title) return title;

    const { base: baseTitle, end: titleEnd } = normalizer;

    let normalizedTitle = title;

    if (!normalizedTitle.startsWith(baseTitle))
      normalizedTitle = `${baseTitle}${normalizedTitle}`;

    if (!normalizedTitle.endsWith(titleEnd)) normalizedTitle += titleEnd;

    return normalizedTitle;
  }

  protected itemExists(href: string): boolean {
    const normalizedHref = this.normalizeHref(href);
    return this.items.has(normalizedHref);
  }

  downloadJSON(): void {
    const accounts = this.getItems();
    const jsonData = JSON.stringify(accounts, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    createDownloadLink(blob, `${this.config.pageName}.json`);
    console.log(`📁 Descargando ${accounts.length} cuentas`);
  }

  protected stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ MangaTracker detenido');
    }
  }
}
