import { HtmlParser } from '@parsers/html-parser';
import { BookmarkService } from '@services/bookmark.service';
import type { Bookmark } from '@type/bookmark';
import { FileHandler } from '@utils/file-handler';

export class BookmarkManager {
  private bookmarkService = new BookmarkService();
  private fileHandler = new FileHandler();
  private parser = new HtmlParser();

  private isLoaded: boolean = false;

  constructor(private path: string) {}

  async read(): Promise<void> {
    try {
      const content = await this.fileHandler.readFile(this.path);
      const bookmarks = this.parser.parse(content);
      this.bookmarkService.add(bookmarks);

      this.isLoaded = true;
      console.log(`📚 Se han cargado ${bookmarks.length} marcadores`);
    } catch (error: any) {
      console.error(`⚠ ${error.message}`);
    }
  }

  async save(): Promise<void> {
    this.validateLoaded();

    try {
      const bookmarks = this.bookmarkService.get();
      const content = this.parser.serialize(bookmarks);
      await this.fileHandler.writeFile(this.path, content);

      console.log(`📝 Se ha guardado el archivo original`);
    } catch (error: any) {
      console.error(`⚠ ${error.message}`);
    }
  }

  private validateLoaded(): void {
    if (!this.isLoaded)
      throw new Error('Bookmarks not loaded. Call read() first.').message;
  }
}
