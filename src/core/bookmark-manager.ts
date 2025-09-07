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
}
