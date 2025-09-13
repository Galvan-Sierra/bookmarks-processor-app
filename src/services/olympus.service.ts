import { OlympusParser } from '@parsers/olympus-parser';
import type { Bookmark } from '@type/bookmark';
import type { ExtractedChapterData, Serie } from '@type/olympus';

export class OlympusService {
  private series: Serie[] = [];
  private parser = new OlympusParser();

  async updateAll(
    series: Bookmark[],
    chapters: Bookmark[]
  ): Promise<Bookmark[]> {
    await this.getSeries();

    const updatedSeries = this.updateSeries(series);
    const updatedChapters = await this.updateChapters(chapters);

    console.log('Updated series:', updatedSeries.length);
    console.log('Updated chapters:', updatedChapters.length);

    return [updatedSeries, updatedChapters].flat();
  }

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
    const updatedBookmarks = bookmarks.map((bookmark) => {
      const serie = this.series.find((serie) => serie.title === bookmark.title);

      if (!serie) return { ...bookmark, folder: 'Manga Not Found' };

      return { ...bookmark, href: serie.href };
    });

    return updatedBookmarks;
  }

  async updateChapters(bookmarks: Bookmark[]): Promise<Bookmark[]> {
    return Promise.all(
      bookmarks.map(async (bookmark) => {
        return this.updateBookmark(bookmark);
      })
    );
  }

  private async updateBookmark(bookmark: Bookmark): Promise<Bookmark> {
    {
      const { title, chapterNumber } = this.getInformationChapter(bookmark);
      const slug = this.series.find((serie) => serie.title === title)?.slug;

      if (!slug) return { ...bookmark, folder: 'Olympus Scanlation Not Found' };

      const foundChapter = await this.findChapter(slug, chapterNumber);

      if (!foundChapter)
        return { ...bookmark, folder: 'Olympus Scanlation Not Found' };

      const chapter = foundChapter.id;
      const href = `https://olympusbiblioteca.com/capitulo/${chapter}/comic-${slug}`;

      return { ...bookmark, href };
    }
  }

  private async findChapter(
    slug: string,
    chapterNumber: number
  ): Promise<ExtractedChapterData | null | undefined> {
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const apiUrl = this.getChaptersUrl(slug, page);

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data) return null;

      hasNextPage = data.meta.last_page > page;
      page++;

      const chapters = this.parser.parseChapters(data);

      const chapter = chapters.find(
        (chapter) => chapter.chapter === chapterNumber
      );

      if (!chapter) return null;
      return chapter;
    }
  }

  private getInformationChapter(bookmark: Bookmark) {
    const splitTitle = bookmark.title.split(' ');

    const title = splitTitle.slice(3).join(' ');
    const chapterNumber = Number(splitTitle[1]);

    return { title, chapterNumber };
  }

  private getSeriesUrl(page: number): string {
    return `https://olympusbiblioteca.com/api/series?page=${page}&direction=asc&type=comic`;
  }

  private getChaptersUrl(slug: string, page: number): string {
    return `https://dashboard.olympusbiblioteca.com/api/series/${slug}/chapters?page=${page}&direction=desc&type=comic`;
  }

  private isRunning(): boolean {
    return this.series.length > 0;
  }
}
