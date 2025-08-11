import { Bookmark, SearchOptions } from '@type/bookmark';

export class BookmarkService {
  findBookmarksBy(bookmarks: Bookmark[], options: SearchOptions): Bookmark[] {
    const {
      includeWords,
      excludeWords = [],
      caseSensitive = false,
      searchInUrl = true,
      searchInTitle = true,
      searchInFolder = false,
      useRegex = false,
      regexFlags = 'g',
    } = options;

    if (includeWords.length === 0) {
      return [];
    }

    return bookmarks.filter((bookmark) => {
      // Textos donde buscar
      const searchTexts: string[] = [];
      if (searchInTitle) searchTexts.push(bookmark.title);
      if (searchInUrl) searchTexts.push(bookmark.url);
      if (searchInFolder && bookmark.folder) searchTexts.push(bookmark.folder);

      const searchText = searchTexts.join(' ');

      if (useRegex) {
        try {
          // Construir flags de regex
          let flags = regexFlags;
          if (!caseSensitive && !flags.includes('i')) {
            flags += 'i';
          }

          // Debe coincidir con al menos una expresión regular incluida
          const hasIncludeMatch = includeWords.some((pattern) => {
            const regex = new RegExp(pattern, flags);
            return regex.test(searchText);
          });

          // No debe coincidir con ninguna expresión regular excluida
          const hasExcludeMatch = excludeWords.some((pattern) => {
            const regex = new RegExp(pattern, flags);
            return regex.test(searchText);
          });

          return hasIncludeMatch && !hasExcludeMatch;
        } catch (error) {
          console.error('❌ Error en expresión regular:', error);
          return false;
        }
      } else {
        // Búsqueda por palabras clave tradicional
        const prepareText = (text: string) =>
          caseSensitive ? text : text.toLowerCase();
        const prepareWords = (words: string[]) =>
          words.map((word) => (caseSensitive ? word : word.toLowerCase()));

        const searchTextPrep = prepareText(searchText);
        const includeWordsPrep = prepareWords(includeWords);
        const excludeWordsPrep = prepareWords(excludeWords);

        // Debe contener al menos una palabra incluida
        const hasIncludeWord = includeWordsPrep.some((word) =>
          searchTextPrep.includes(word)
        );

        // No debe contener ninguna palabra excluida
        const hasExcludeWord = excludeWordsPrep.some((word) =>
          searchTextPrep.includes(word)
        );

        return hasIncludeWord && !hasExcludeWord;
      }
    });
  }

  updateBookmarks(
    bookmarks: Bookmark[],
    updates: Bookmark[],
    param: keyof Bookmark
  ): Bookmark[] {
    return bookmarks.map((bookmark) => {
      const updated = updates.find(
        (update) => update[param] === bookmark[param]
      );
      return updated || bookmark;
    });
  }

  deleteDuplicates<Bookmarks, K extends keyof Bookmarks>(
    elements: Bookmarks[],
    param: K
  ): Bookmarks[] {
    const map = new Map<Bookmarks[K], Bookmarks>();
    return elements.filter(
      (element) => !map.has(element[param]) && map.set(element[param], element)
    );
  }
}
