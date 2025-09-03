import type { Bookmark } from '@type/bookmark';

export class BookmarkService {
  private bookmarks: Bookmark[] = [];

  addBookmarks(bookmarks: Bookmark[]): void {
    this.bookmarks = [...this.bookmarks, ...bookmarks];
  }
  getBookmarks(): Bookmark[] {
    return [...this.bookmarks];
  }
}
