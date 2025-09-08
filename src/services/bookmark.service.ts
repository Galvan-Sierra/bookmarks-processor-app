import type { Bookmark, SearchOptions } from '@type/bookmark';

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

  getAll(): Bookmark[] {
    return [...this.bookmarks];
  }

  findBy(options: SearchOptions): Bookmark[] {
    let { includeWords } = options;

    const {
      excludeWords = [],
      caseSensitive = false,
      searchInHref = true,
      searchInTitle = true,
      searchInFolder = false,
      useRegex = false,
      regexFlags = 'g',
    } = options;

    if (includeWords.length === 0) {
      return [];
    }

    if (typeof includeWords === 'string') {
      includeWords = [includeWords];
    }

    return this.bookmarks.filter((bookmark) => {
      const searchTexts: string[] = [];
      if (searchInTitle) searchTexts.push(bookmark.title);
      if (searchInHref) searchTexts.push(bookmark.href);
      if (searchInFolder && bookmark.folder) searchTexts.push(bookmark.folder);

      const searchText = searchTexts.join(' ');

      if (useRegex) {
        return this.matchWithRegex(
          searchText,
          includeWords,
          excludeWords,
          caseSensitive,
          regexFlags
        );
      } else {
        return this.matchWithKeywords(
          searchText,
          includeWords,
          excludeWords,
          caseSensitive
        );
      }
    });
  }

  extractBy(options: SearchOptions): Bookmark[] {
    const bookmarksToRemove = this.findBy(options);

    if (bookmarksToRemove.length > 0) {
      this.remove(bookmarksToRemove);
    }

    return bookmarksToRemove;
  }

  remove(bookmarksToRemove: Bookmark[]): void {
    const bookmarksToRemoveSet = new Set(bookmarksToRemove.map((b) => b.href));

    this.bookmarks = this.bookmarks.filter(
      (bookmark) => !bookmarksToRemoveSet.has(bookmark.href)
    );

    bookmarksToRemoveSet.forEach((href) => this.hrefSet.delete(href));
  }

  private byHref(bookmark: Bookmark): string {
    return bookmark.href;
  }

  private matchWithRegex(
    searchText: string,
    includeWords: string[],
    excludeWords: string[],
    caseSensitive: boolean,
    regexFlags: string
  ): boolean {
    try {
      let flags = regexFlags;
      if (!caseSensitive && !flags.includes('i')) {
        flags += 'i';
      }

      const hasIncludeMatch = includeWords.some((pattern) => {
        const regex = new RegExp(pattern, flags);
        return regex.test(searchText);
      });

      const hasExcludeMatch = excludeWords.some((pattern) => {
        const regex = new RegExp(pattern, flags);
        return regex.test(searchText);
      });

      return hasIncludeMatch && !hasExcludeMatch;
    } catch (error) {
      console.error('❌ Error in regex pattern:', error);
      return false;
    }
  }

  private matchWithKeywords(
    searchText: string,
    includeWords: string[],
    excludeWords: string[],
    caseSensitive: boolean
  ): boolean {
    const prepareText = (text: string) =>
      caseSensitive ? text : text.toLowerCase();

    const searchTextPrep = prepareText(searchText);
    const includeWordsPrep = includeWords.map(prepareText);
    const excludeWordsPrep = excludeWords.map(prepareText);

    const hasIncludeWord = includeWordsPrep.some((word) =>
      searchTextPrep.includes(word)
    );

    const hasExcludeWord = excludeWordsPrep.some((word) =>
      searchTextPrep.includes(word)
    );

    return hasIncludeWord && !hasExcludeWord;
  }

  private exists(href: string): boolean {
    return this.hrefSet.has(href);
  }
}
