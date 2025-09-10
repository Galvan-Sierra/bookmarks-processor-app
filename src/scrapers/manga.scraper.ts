import { ikigai } from '@config/scraping-sites';
import { BaseScraper } from '@scrapers/base.scraper';
import type { Bookmark } from '@type/bookmark';
import type { MangaTrackerConfig } from '@type/scraping';
import { DOMHelper } from '@utils/dom';
import { createDownloadLink } from '@utils/scraping-utils';

class MangaTracker extends BaseScraper<MangaTrackerConfig> {
  private currentPage = 1;
  private timeInterval = 1;
  private isNavigating = false;
  private shouldNavigateToNextPage = false;

  constructor(config: MangaTrackerConfig) {
    super(config);
  }

  configure(
    currentPage = 1,
    shouldNavigateToNextPage = false,
    timeInterval = 3
  ): this {
    this.currentPage = currentPage;
    this.shouldNavigateToNextPage = shouldNavigateToNextPage;
    this.timeInterval = timeInterval;
    return this;
  }

  setupInterval(): void {
    this.intervalId = setInterval(() => {
      if (this.isNavigating) {
        console.log('⏳ Navegando, esperando...');
        return;
      }

      this.scanItems(this.config.selectors);

      if (this.shouldNavigateToNextPage) {
        this.navigateToNextPage();
      }

      console.log(`📊 Mangas escaneados: ${this.items.size}`);
    }, this.DEFAULT_INTERVAL * this.timeInterval);
  }

  getTrackerName(): string {
    return 'MangaTracker';
  }

  processItems(elements: Element[]): void {
    elements.forEach((element) => {
      const mangaData = this.extractData(element);

      if (!this.itemExists(mangaData.href)) {
        this.addItem(mangaData);
        console.log(`📚 Nuevo manga: ${mangaData.title}`);
      }
    });
  }

  // Métodos propios del MangaTracker

  printStats(): void {
    console.log(`📈 Estadísticas: Total: ${this.items.size} mangas`);
  }

  private extractData(element: Element): Bookmark {
    const { selectors } = this.config;

    return {
      title: DOMHelper.extractCompleteText(element, selectors.title),
      href: DOMHelper.extractHref(element, selectors.href),
      folder: this.config.pageName,
    };
  }

  private navigateToNextPage(): void {
    const nextPageUrl = this.config.selectors.nextPage(this.currentPage);
    console.log(`🌊 Navegando a página ${this.currentPage + 1}...`);

    this.isNavigating = true;

    this.fetchAndUpdatePage(nextPageUrl)
      .then(() => {
        this.currentPage++;
        console.log('✅ Navegación completada');
      })
      .catch((error) => {
        console.error('❌ Error al navegar:', error);
      })
      .finally(() => {
        this.isNavigating = false;
      });
  }

  private async fetchAndUpdatePage(url: string): Promise<void> {
    // Actualizar URL sin recargar
    window.history.pushState({}, '', url);

    const response = await fetch(url);
    const html = await response.text();
    const newDoc = new DOMParser().parseFromString(html, 'text/html');

    this.updatePageContent(newDoc);
  }

  private updatePageContent(newDoc: Document): void {
    const currentList = document.querySelector(this.config.selectors.list);
    const newList = newDoc.querySelector(this.config.selectors.list);

    if (currentList && newList) {
      currentList.innerHTML = newList.innerHTML;
    }
  }
}

const mangaTracker = new MangaTracker(ikigai);
mangaTracker.configure(1, true).start();
