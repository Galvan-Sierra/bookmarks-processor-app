import { DEFAULT_OUTPUT_PATH } from '@config/constants';
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

  async saveOutputBookmarks(
    fileName: string,
    bookmarksToSave: Bookmark[]
  ): Promise<void> {
    if (bookmarksToSave.length === 0) {
      console.warn(`⚠ No hay marcadores para guardar en ${fileName}`);
      return;
    }

    const outputPath = `${DEFAULT_OUTPUT_PATH}${fileName}.html`;

    try {
      const fileContent = this.parser.serialize(bookmarksToSave);
      await this.fileHandler.writeFile(outputPath, fileContent);
      console.log(`📝 Se ha guardado el archivo de salida: ${fileName}.html`);
    } catch (error) {
      throw new Error(`Failed to export bookmarks: ${error}`);
    }
  }

  async deleteFile(): Promise<void> {
    try {
      await this.fileHandler.deleteFile(this.path);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  getBookmarks(): Bookmark[] {
    return this.bookmarkService.getAll();
  }

  addBookmarks(newBookmarks: Bookmark[]): void {
    const initialBookmarkCount = this.bookmarkService.getAll().length;

    try {
      this.bookmarkService.add(newBookmarks);

      const addedBookmarkCount =
        this.bookmarkService.getAll().length - initialBookmarkCount;

      console.log(`➕ Se han agregado ${addedBookmarkCount} marcadores`);
    } catch (error) {
      console.error(`❌ Error al agregar marcadores: ${error}`);
      throw error;
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

  deleteBookmarks(bookmarksToDelete: Bookmark[]): void {
    const initialCount = this.bookmarkService.getAll().length;

    this.bookmarkService.remove(bookmarksToDelete);

    const deletedCount = initialCount - this.bookmarkService.getAll().length;

    console.log(`🗑️ ${deletedCount} bookmarks deleted`);
  }
  private validateBookmarksLoaded(): void {
    if (!this.isLoaded) {
      throw new Error(
        'Bookmarks not loaded. Please call readBookmarks() first.'
      );
    }
  }
}
