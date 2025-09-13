import { BookmarkManager } from '@core/bookmark-manager';
import { OlympusService } from '@services/olympus.service';
import type { Bookmark } from '@type/bookmark';

const mangasFile = new BookmarkManager('data/input/mangas.html');
await mangasFile.readBookmarks();

const olympusPage = new OlympusService();
const olympusSeries = await olympusPage.getSeries();

const mangas = mangasFile.findBookmarksBy({
  includeWords: ['olympusbiblioteca.com/capitulo'],
});

const olympusChapters = await olympusPage.getMangaData(mangas);

const parseOlympus: Bookmark[] = olympusChapters.map((serie) => ({
  title: serie.title,
  href: serie.href,
  folder: mangas.find((manga) => manga.title === serie.title)?.folder || '',
  addDate: mangas.find((manga) => manga.title === serie.title)?.addDate || 0,
  icon: mangas.find((manga) => manga.title === serie.title)?.icon || '',
}));

// mangasFile.updateBookmarks(parseOlympus, 'title');
// mangasFile.save();
