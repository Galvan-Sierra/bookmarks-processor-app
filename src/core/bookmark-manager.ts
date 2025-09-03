import { HtmlParser } from '@parsers/html-parser';
import { BookmarkService } from '@services/bookmark.service';
import type { Bookmark, SearchOptions } from '@type/bookmark';
import { FileHandler } from '@utils/file-handler';

export class BookmarkManager {
  private fileHandler = new FileHandler();
  private parser = new HtmlParser();
  private bookmarkService = new BookmarkService();

  private isLoaded: boolean = false;

  constructor(private path: string) {}

  async read(): Promise<void> {
    try {
      const content = await this.fileHandler.read(this.path);
      const bookmarks = this.parser.parse(content);
      this.bookmarkService.addBookmarks(bookmarks);

      this.isLoaded = true;
      console.log(`📚 Se han cargado ${bookmarks.length} marcadores`);
    } catch (error: any) {
      console.error(`⚠ ${error.message}`);
    }
  }

  async save(): Promise<void> {
    this.validateLoaded();

    try {
      const bookmarks = this.bookmarkService.getBookmarks();
      const content = this.parser.serialize(bookmarks);
      await this.fileHandler.write(this.path, content);

      console.log(`📝 Se ha guardado el archivo original`);
    } catch (error: any) {
      console.error(`⚠ ${error.message}`);
    }
  }

  async delete(): Promise<void> {
    try {
      await this.fileHandler.delete(this.path);

      console.log(`📝 Se ha eliminado el archivo ${this.path}`);
    } catch (error) {
      console.error(`⚠ ${error}`);
    }
  }

  findBy(options: SearchOptions): Bookmark[] {
    this.validateLoaded();

    const results = this.bookmarkService.findBookmarksBy(options);
    const searchType = options.useRegex ? 'regex' : 'palabras clave';
    console.log(
      `🔍 Encontrados ${results.length} marcadores con ${searchType}`
    );

    return results;
  }

  private validateLoaded(): void {
    if (!this.isLoaded)
      throw new Error('Bookmarks not loaded. Call read() first.').message;
  }
}
