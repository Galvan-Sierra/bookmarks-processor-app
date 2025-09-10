import { ikigai } from '@config/scraping-sites';
import { BaseScraper } from '@scrapers/base.scraper';
import type { Bookmark } from '@type/bookmark';
import type { MangaTrackerConfig } from '@type/scraping';
import { DOMHelper } from '@utils/dom';
import { createDownloadLink } from '@utils/scraping-utils';

const DEFAULT_PAGE = 1;

class MangaTracker extends BaseScraper<MangaTrackerConfig> {
  protected configure(...args: any): this {
    throw new Error('Method not implemented.');
  }
  protected processItems(...args: any): void {
    throw new Error('Method not implemented.');
  }
  protected setupInterval(): void {
    throw new Error('Method not implemented.');
  }
  protected getTrackerName(): string {
    throw new Error('Method not implemented.');
  }
  private currentPage: number;
  private isNavigating = false;

  constructor(config: MangaTrackerConfig) {
    super(config);
    this.currentPage = config.initialPage ?? DEFAULT_PAGE;
  }

  start(shouldNavigateToNextPage = false, timeInterval = 2): void {
    if (this.isRunning()) {
      console.warn('🔄 MangaTracker ya está ejecutándose');
      return;
    }

    console.log('🚀 MangaTracker iniciado');

    // Escaneo inicial
    // this.scanMangas();

    // Configurar interval
    this.intervalId = setInterval(() => {
      if (this.isNavigating) {
        console.log('⏳ Navegando, esperando...');
        return;
      }

      this.scanMangas();

      if (shouldNavigateToNextPage) {
        this.navigateToNextPage();
      }

      console.log(`📊 Mangas escaneados: ${this.items.size}`);
    }, this.DEFAULT_INTERVAL * timeInterval);
  }

  scanNow(): void {
    console.log('🔍 Iniciando escaneo manual...');
    this.scanMangas();
  }

  printStats(): void {
    console.log(`📈 Estadísticas: Total: ${this.items.size} mangas`);
  }

  // ====================================
  // MÉTODOS PRIVADOS - ESCANEO
  // ====================================

  private scanMangas(): void {
    const listElement = DOMHelper.querySelector(this.config.selectors.list);

    if (!listElement) {
      console.warn('⚠️ Lista de mangas no encontrada');
      return;
    }

    const mangaElements = listElement.querySelectorAll(
      this.config.selectors.item
    );
    this.processMangaElements(mangaElements);
  }

  private processMangaElements(elements: NodeListOf<Element>): void {
    elements.forEach((element) => {
      const mangaData = this.extractMangaData(element);

      if (!this.itemExists(mangaData.href)) {
        this.addItem(mangaData);
        console.log(`📚 Nuevo manga: ${mangaData.title}`);
      }
    });
  }

  private extractMangaData(element: Element): Bookmark {
    const { selectors } = this.config;

    return {
      title: DOMHelper.extractCompleteText(element, selectors.title),
      href: DOMHelper.extractHref(element, selectors.href),
      folder: this.config.pageName,
    };
  }

  // ====================================
  // MÉTODOS PRIVADOS - NAVEGACIÓN
  // ====================================

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

  // ====================================
  // MÉTODOS PRIVADOS - UTILIDADES
  // ====================================
}

const mangaTracker = new MangaTracker(ikigai);
mangaTracker.start(true); // Intervalo de 2 segundos, navegación automática activada
