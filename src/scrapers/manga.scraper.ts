// ====================================
// CONSTANTES
// ====================================

import type { Bookmark } from '@type/bookmark';
import type { MangaTrackerConfig } from '@type/scraping';
import { createDownloadLink } from '@utils/scraping-utils';

const DEFAULT_INTERVAL = 1000; // 1 segundo
const DEFAULT_PAGE = 1;

// ====================================
// CLASE PRINCIPAL
// ====================================

class MangaTracker {
  private readonly mangas = new Map<string, Bookmark>();
  private readonly config: MangaTrackerConfig;
  private currentPage: number;
  private isNavigating = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: MangaTrackerConfig) {
    this.config = config;
    this.currentPage = config.initialPage ?? DEFAULT_PAGE;
  }

  // ====================================
  // MÉTODOS PÚBLICOS
  // ====================================

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

      console.log(`📊 Mangas escaneados: ${this.mangas.size}`);
    }, DEFAULT_INTERVAL * timeInterval);
  }

  scanNow(): void {
    console.log('🔍 Iniciando escaneo manual...');
    this.scanMangas();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isNavigating = false;
      console.log('⏹️ MangaTracker detenido');
    }
  }

  addMangas(mangas: Bookmark[]): void {
    const addedCount = mangas.reduce((count, manga) => {
      if (!this.mangaExists(manga.href)) {
        this.addManga(manga);
        return count + 1;
      }
      return count;
    }, 0);

    if (addedCount > 0) {
      console.log(`➕ ${addedCount} mangas agregados`);
    }
  }

  clearMangas(): void {
    const count = this.mangas.size;
    this.mangas.clear();
    console.log(`🗑️ ${count} mangas eliminados`);
  }

  printStats(): void {
    console.log(`📈 Estadísticas: Total: ${this.mangas.size} mangas`);
  }

  getMangas(): Bookmark[] {
    return Array.from(this.mangas.values());
  }

  downloadJSON(): void {
    const mangaList = this.getMangas();
    const jsonData = JSON.stringify(mangaList, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    createDownloadLink(blob, `${this.config.pageName}.json`);
    console.log(`📁 Descargando ${mangaList.length} mangas`);
  }

  // ====================================
  // MÉTODOS PRIVADOS - ESCANEO
  // ====================================

  private scanMangas(): void {
    const listElement = this.querySelector(this.config.selectors.list);

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

      if (
        this.isValidMangaData(mangaData) &&
        !this.mangaExists(mangaData.href)
      ) {
        this.addManga(mangaData);
        console.log(`📚 Nuevo manga: ${mangaData.title}`);
      }
    });
  }

  private extractMangaData(element: Element): Bookmark {
    const { selectors } = this.config;

    return {
      title: this.extractText(element, selectors.title),
      href: this.extractHref(element, selectors.href),
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

  private isRunning(): boolean {
    return this.intervalId !== null;
  }

  private isValidMangaData(manga: Bookmark): boolean {
    return Boolean(manga.title.trim() && manga.href.trim());
  }

  private extractText(element: Element, selector: string): string {
    const textElement = element.querySelector(selector);
    return textElement?.textContent?.trim() || 'Sin nombre';
  }

  private extractHref(element: Element, selector: string): string {
    const linkElement = element.querySelector(selector);
    return linkElement?.getAttribute('href')?.trim() || '';
  }

  private querySelector(
    selector: string,
    parent: Element | Document = document
  ): Element | null {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      console.error(`❌ Selector inválido: ${selector}`, error);
      return null;
    }
  }

  private mangaExists(href: string): boolean {
    const normalizedUrl = this.normalizeUrl(href);
    return this.mangas.has(normalizedUrl);
  }

  private addManga(manga: Bookmark): void {
    const normalizedUrl = this.normalizeUrl(manga.href);
    const normalizedTitle = this.normalizeTitle(manga.title);

    const mangaItem: Bookmark = {
      ...manga,
      title: normalizedTitle,
      href: normalizedUrl,
    };

    this.mangas.set(normalizedUrl, mangaItem);
  }

  private normalizeTitle(title: string): string {
    if (!title.trim()) return '';
    let normalized = title.trim();

    const { base, end } = this.config.titleNormalize;
    normalized = title.startsWith(base) ? title : `${base}${title}`;

    if (!normalized.endsWith(end)) {
      normalized += end;
    }

    return normalized;
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Normaliza una URL para que tenga el formato base+slug+end.
   * Si la URL ya tiene el formato base+slug+end, se devuelve la
   * URL original. De lo contrario, se devuelve la URL normalizada.
   * @param {string} url - La URL a normalizar.
   * @returns {string} La URL normalizada.
   */
  /*******  04953e37-a34b-4bd6-9532-f58f328a8d76  *******/
  private normalizeUrl(url: string): string {
    if (!url.trim()) return '';

    let normalized = url.trim();

    const { base, end } = this.config.urlNormalize;
    normalized = url.startsWith(base) ? url : `${base}${url}`;

    if (!normalized.endsWith(end)) {
      normalized += end;
    }

    return normalized;
  }
}

// ====================================
// CLASE PRINCIPAL DE EJEMPLO
// ====================================

// ====================================
// EJEMPLO DE USO
// ====================================*

const ikigai: MangaTrackerConfig = {
  pageName: 'ikigai manga',
  titleNormalize: { base: '', end: ' | Ikigai Mangas' },
  urlNormalize: { base: 'https://viralikigai.damilok.xyz', end: '/' },
  selectors: {
    list: 'body > main > section > ul',
    item: 'li',
    title: 'a > h3',
    href: 'a',
    nextPage: (page: number) =>
      `https://viralikigai.damilok.xyz/series/?pagina=${page}`,
  },
  initialPage: 1,
};

// const mangaTracker = new MangaTracker(ikigai);
// mangaTracker.start(true); // Intervalo de 2 segundos, navegación automática activada
