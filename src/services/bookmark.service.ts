import type { Bookmark, SearchOptions } from '@type/bookmark';

export class BookmarkService {
  private bookmarks: Bookmark[] = [];
  private hrefSet: Set<string> = new Set();

  add(newBookmarks: Bookmark[], folderName?: string): void {
    const newHrefs = new Set<string>();

    for (const newBookmark of newBookmarks) {
      if (!this.exists(newBookmark.href)) {
        newHrefs.add(newBookmark.href);

        if (folderName) newBookmark.folder = folderName;
      }
    }

    if (newHrefs.size > 0) {
      this.bookmarks.push(...newBookmarks.filter((b) => newHrefs.has(b.href)));
      this.hrefSet = new Set([...this.hrefSet, ...newHrefs]);
    }
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
      includeAllWords = false, // ✅ Por defecto mantiene comportamiento actual (OR)
    } = options;

    // Validaciones de entrada
    if (
      !includeWords ||
      (Array.isArray(includeWords) && includeWords.length === 0)
    ) {
      return [];
    }

    // Normalizar includeWords a array
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
          regexFlags,
          includeAllWords
        );
      } else {
        return this.matchWithKeywords(
          searchText,
          includeWords,
          excludeWords,
          caseSensitive,
          includeAllWords
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

  clear(): void {
    this.bookmarks = [];
    this.hrefSet = new Set();
  }

  orderByDomain(): Bookmark[] {
    this.bookmarks = this.sortBookmarksByDomainFrequency(this.bookmarks);
    return [...this.bookmarks]; // Retorna copia para inmutabilidad
  }

  extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      console.warn(`Invalid URL detected: ${url}`);
      return 'invalid-url';
    }
  }

  private sortBookmarksByDomainFrequency(bookmarks: Bookmark[]): Bookmark[] {
    if (!bookmarks?.length) return [];

    return Object.entries(
      Object.groupBy(bookmarks, (bookmark) => bookmark.folder)
    ).flatMap(([, folderBookmarks]) => {
      const domainGroups = Object.groupBy(
        folderBookmarks as Bookmark[],
        (bookmark) => this.extractDomain(bookmark.href)
      );

      return Object.entries(domainGroups)
        .sort(
          ([, a], [, b]) => (b as Bookmark[]).length - (a as Bookmark[]).length
        )
        .flatMap(([, domainBookmarks]) => domainBookmarks as Bookmark[]);
    });
  }

  private matchWithRegex(
    searchText: string,
    includeWords: string[],
    excludeWords: string[],
    caseSensitive: boolean,
    regexFlags: string,
    includeAllWords: boolean // ✅ Nuevo parámetro
  ): boolean {
    try {
      let flags = regexFlags;
      if (!caseSensitive && !flags.includes('i')) {
        flags += 'i';
      }

      // ✅ Lógica actualizada para includeAllWords
      const includeMatchFn = includeAllWords
        ? (patterns: string[]) =>
            patterns.every((pattern) => {
              const regex = new RegExp(pattern, flags);
              return regex.test(searchText);
            })
        : (patterns: string[]) =>
            patterns.some((pattern) => {
              const regex = new RegExp(pattern, flags);
              return regex.test(searchText);
            });

      const hasIncludeMatch = includeMatchFn(includeWords);

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
    caseSensitive: boolean,
    includeAllWords: boolean
  ): boolean {
    const prepareText = (text: string) =>
      caseSensitive ? text : text.toLowerCase();

    const searchTextPrep = prepareText(searchText);
    const includeWordsPrep = includeWords.map(prepareText);
    const excludeWordsPrep = excludeWords.map(prepareText);

    const hasIncludeWord = includeAllWords
      ? includeWordsPrep.every((word) => searchTextPrep.includes(word)) // AND lógico
      : includeWordsPrep.some((word) => searchTextPrep.includes(word)); // OR lógico

    const hasExcludeWord = excludeWordsPrep.some((word) =>
      searchTextPrep.includes(word)
    );

    return hasIncludeWord && !hasExcludeWord;
  }

  private exists(href: string): boolean {
    return this.hrefSet.has(href);
  }

  static orderBookmarksByDomain(bookmarks: Bookmark[]): Bookmark[] {
    return BookmarkService.prototype.sortBookmarksByDomainFrequency(bookmarks);
  }
}
