import type { Bookmark, SearchOptions } from '@type/bookmark';

export class BookmarkService {
  private bookmarks: Bookmark[] = [];

  addBookmarks(bookmarks: Bookmark[]): void {
    this.bookmarks = [...this.bookmarks, ...bookmarks];
  }
  getBookmarks(): Bookmark[] {
    return [...this.bookmarks];
  }

  findBookmarksBy(options: SearchOptions): Bookmark[] {
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

    if (typeof includeWords === 'string') includeWords = [includeWords];
    if (includeWords.length === 0) return [];

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
}
