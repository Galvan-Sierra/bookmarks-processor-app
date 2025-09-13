import { OlympusParser } from '@parsers/olympus-parser';
import type { Bookmark } from '@type/bookmark';
import type {
  OlympusList,
  Datum,
  ChapterList,
  ExtractedChapterData,
  OldSerie,
  Serie,
} from '@type/olympus';

export class OlympusService {
  private list: OldSerie[] = [];
  private series: Serie[] = [];

  private parser = new OlympusParser();

  async getSeries(): Promise<void> {
    const series: Serie[] = [];

    if (this.isRunning()) return;

    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await fetch(this.getSeriesUrl(page));
      const data = await response.json();

      const parsedSeries = this.parser.parseSeries(data);
      series.push(...parsedSeries);

      hasNextPage = data.data.series.last_page > page;
      page++;
    }

    this.series = series;
  }

  updateSeries(bookmarks: Bookmark[]): Bookmark[] {
    // validar si están cargados del api
    if (!this.isRunning()) this.getSeries();

    // actualizar la information, buscando por titulo normalizado
    const updatedBookmarks = bookmarks.map((bookmark) => {
      const serie = this.series.find((serie) => serie.title === bookmark.title);
      if (serie) bookmark.href = serie.href;
      return bookmark;
    });

    return updatedBookmarks;
  }

  private getChapterApiUrl(slug: string, page: number = 1): string {
    return `https://dashboard.olympusbiblioteca.com/api/series/${slug}/chapters?page=${page}&direction=desc&type=comic`;
  }

  async getMangaData(Bookmarks: Bookmark[]): Promise<Bookmark[]> {
    return Promise.all(
      Bookmarks.map(async (bookmark) => {
        const { mangaTitle, chapterNumber, slug } =
          this.getInformationChapter(bookmark);

        const findSlug = this.list.find((serie) =>
          serie.title.includes(mangaTitle)
        );

        console.log('find slug ' + findSlug?.slug);

        const apiUrl = this.getChapterApiUrl(findSlug?.slug || '');
        if (!findSlug?.slug) console.error('error con ' + mangaTitle);

        console.log('api url ' + apiUrl);
        const findChapter = await this.findChapter(apiUrl, chapterNumber);

        console.log('find chapter ' + findChapter?.id);

        if (!findChapter?.id) {
          console.error('error con ' + chapterNumber);
          return bookmark;
        }
        const chapter = findChapter?.id;

        const href = `https://olympusbiblioteca.com/capitulo/${chapter}/comic-${slug}`;

        // response.json().then((data) => )

        return {
          ...bookmark,
          href,
        };
      })
    );
    // return Promise.all(updatedBookmarks);
  }

  private async findChapter(apiUrl: string, chapterNumber: number) {
    let firstQuest: ChapterList = await fetch(apiUrl)
      .then((response) => response.json())
      .catch((error) => console.error('error con la primera peticion' + error));

    if (!firstQuest) return null;
    const chapters = this.extractChapterData(firstQuest);

    let chapter = chapters.find((chapter) => chapter.chapter === chapterNumber);

    if (chapter) return chapter;

    for (let i = 2; i <= firstQuest.meta.last_page; i++) {
      const response = await fetch(this.getChapterApiUrl(apiUrl, i))
        .then((response) => {
          return response.json();
        })
        .catch((error) =>
          console.error('error con la segunda peticion' + error)
        );

      if (!response) return null;
      chapter = this.extractChapterData(response).find(
        (chapter) => chapter.chapter === chapterNumber
      );
      return chapter;
    }
  }

  private getInformationChapter(bookmark: Bookmark) {
    const mangaTitle = bookmark.title.split(' ').slice(3).join(' ').trim();
    const chapterNumber = Number(bookmark.title.split(' ')[1]);
    const slug = this.list.find((serie) =>
      serie.title.includes(mangaTitle)
    )?.slug;

    if (!slug) {
      console.error('error con ' + mangaTitle);
      console.error('error con ' + slug);
    }
    return {
      mangaTitle,
      chapterNumber,
      slug,
    };
  }

  // Interfaces (las que ya tienes definidas)

  // Función que extrae name (como número), id y last_page
  private extractChapterData(chapterList: ChapterList): ExtractedChapterData[] {
    return chapterList?.data?.map((chapter: Datum) => ({
      chapter: parseInt(chapter.name, 10), // Convierte el name string a número
      id: chapter.id,
      last_page: chapterList.meta.last_page, // last_page está en meta, no en cada capítulo
    }));
  }

  private getSeriesUrl(page: number): string {
    return `https://olympusbiblioteca.com/api/series?page=${page}&direction=asc&type=comic`;
  }

  private isRunning(): boolean {
    return this.series.length > 0;
  }
}
