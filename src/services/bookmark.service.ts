import type { Bookmark } from '@type/bookmark';

export class BookmarkService {
  private bookmarks: Bookmark[] = [];
  private hrefSet: Set<string> = new Set();

  add(bookmarks: Bookmark[]): void {
    if (bookmarks.length === 0) return;

    bookmarks.forEach((bookmark) => {
      if (!this.exists(bookmark.href)) {
        this.hrefSet.add(bookmark.href);
        this.bookmarks.push(bookmark);
      }
    });
  }

  get(): Bookmark[] {
    return [...this.bookmarks];
  }

  private exists(href: string): boolean {
    return this.hrefSet.has(href);
  }
}
