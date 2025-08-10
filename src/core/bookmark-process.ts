import { Bookmark } from '@type/bookmark';
import { HTMLParser } from '@parsers/html-parser';
import { FileHandler } from '@utils/file-handler';

export class BookmarkProcess {
  private path: string;
  private isLoaded: boolean = false;
  private bookmarks: Bookmark[] = [];

  // dependencias
  private handler: FileHandler;
  private parser: HTMLParser;

  constructor(path: string) {
    this.path = path;

    // dependencias
    this.handler = new FileHandler();
    this.parser = new HTMLParser();
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

  private ensureInitialized(): void {
    if (!this.isLoaded) {
      throw new Error(
        '⚠ El procesador no está inicializado. Llama a start() primero.'
      );
    }
  }
}
