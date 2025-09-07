import { HtmlParser } from '@parsers/html-parser';
import { BookmarkService } from '@services/bookmark.service';
import type { Bookmark, SearchOptions } from '@type/bookmark';
import { FileHandler } from '@utils/file-handler';

export class BookmarkManager {
  private bookmarkService = new BookmarkService();
  private fileHandler = new FileHandler();
  private parser = new HtmlParser();

  private isLoaded: boolean = false;

  constructor(private path: string) {}

  async readBookmarks(): Promise<void> {
    try {
      const fileContent = await this.fileHandler.readFile(this.path);
      const parsedBookmarks = this.parser.parse(fileContent);
      this.bookmarkService.add(parsedBookmarks);

      this.isLoaded = true;
      console.log(`📚 Se han cargado ${parsedBookmarks.length} marcadores`);
    } catch (error: any) {
      console.error(`⚠ ${error.message}`);
    }
  }

  async saveBookmarks(): Promise<void> {
    this.validateBookmarksLoaded();

    try {
      const bookmarks = this.bookmarkService.getAll();
      const htmlContent = this.parser.serialize(bookmarks);
      await this.fileHandler.writeFile(this.path, htmlContent);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  async deleteFile(): Promise<void> {
    try {
      await this.fileHandler.deleteFile(this.path);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  findBookmarksBy(options: SearchOptions): Bookmark[] {
    this.validateBookmarksLoaded();

    const results = this.bookmarkService.findBy(options);
    const searchType = options.useRegex ? 'regex' : 'palabras clave';

    console.log(
      `🔍 Se han encontrado ${results.length} marcadores con ${searchType}`
    );

    return results;
  }

  extractBookmarksBy(options: SearchOptions): Bookmark[] {
    this.validateBookmarksLoaded();

    const extracted = this.bookmarkService.extractBy(options);
    const searchType = options.useRegex ? 'regex' : 'keywords';

    if (extracted.length > 0) {
      console.log(
        `✅ Extracted ${extracted.length} bookmarks using ${searchType}`
      );
    } else {
      console.log('ℹ️ No bookmarks found to extract');
    }

    return extracted;
  }

  private validateBookmarksLoaded(): void {
    if (!this.isLoaded) {
      throw new Error(
        'Bookmarks not loaded. Please call readBookmarks() first.'
      );
    }
  }
}
