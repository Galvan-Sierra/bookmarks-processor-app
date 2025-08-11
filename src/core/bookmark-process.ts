import { Bookmark, SearchOptions } from '@type/bookmark';
import { HTMLParser } from '@parsers/html-parser';
import { FileHandler } from '@utils/file-handler';
import { DEFAULT_OUTPUT_PATH } from '@config/constants';
import { BookmarkService } from '@services/bookmark.service';

export class BookmarkProcess {
  private path: string;
  private isLoaded: boolean = false;
  private bookmarks: Bookmark[] = [];

  // dependencias
  private handler: FileHandler;
  private parser: HTMLParser;
  private service: BookmarkService;

  constructor(path: string) {
    this.path = path;

    // dependencias
    this.handler = new FileHandler();
    this.parser = new HTMLParser();
    this.service = new BookmarkService();
  }

  async start(): Promise<void> {
    try {
      const content = await this.handler.read(this.path);
      const bookmarks = this.parser.parse(content);

      this.bookmarks = bookmarks;
      this.isLoaded = true;

      console.log(`📚 Se han cargado ${bookmarks.length} marcadores`);
    } catch (error) {
      throw new Error(`No se pudo cargar el archivo de marcadores: ${error}`);
    }
  }

  async save(): Promise<void> {
    this.ensureInitialized();

    try {
      const content = this.parser.serialize('', this.bookmarks);
      await this.handler.write(this.path, content);

      console.log(`📝 Se ha guardado el archivo original`);
    } catch (error) {
      throw new Error(`No se pudo guardar el archivo: ${error}`);
    }
  }

  async saveOutput(fileName: string, bookmarks: Bookmark[]): Promise<void> {
    if (bookmarks.length === 0) {
      console.warn(`⚠ No hay marcadores para guardar en ${fileName}`);
      return;
    }

    try {
      const content = this.parser.serialize(fileName, bookmarks);
      await this.handler.write(
        `${DEFAULT_OUTPUT_PATH}/${fileName}.html`,
        content
      );
      console.log(`📝 Se ha guardado el archivo de salida: ${fileName}.html`);
    } catch (error) {
      console.error(`❌ Error al guardar el archivo de salida: ${error}`);
      throw new Error(`No se pudo guardar el archivo de salida: ${error}`);
    }
  }

  getBookmarks(): Bookmark[] {
    this.ensureInitialized();
    return this.bookmarks;
  }

  findBookmarksBy(options: SearchOptions): Bookmark[] {
    this.ensureInitialized();
    return this.service.findBookmarksBy(this.bookmarks, options);
  }

  updateBookmarks(updates: Bookmark[], param: keyof Bookmark): void {
    this.ensureInitialized();
    const updatedBookmarks = this.service.updateBookmarks(
      this.bookmarks,
      updates,
      param
    );
  }

  private ensureInitialized(): void {
    if (!this.isLoaded) {
      throw new Error(
        '⚠ El procesador no está inicializado. Llama a start() primero.'
      );
    }
  }
}
