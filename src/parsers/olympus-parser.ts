import type {
  ChapterList,
  Datum,
  ExtractedChapterData,
  OlympusList,
  Serie,
} from '@type/olympus';

export class OlympusParser {
  parseSeries(content: OlympusList): Serie[] {
    const data = content.data.series.data;

    return data.map(({ name, slug }) => {
      return {
        title: `${name} | Olympus Scanlation`,
        href: `https://olympusbiblioteca.com/series/comic-${slug}`,
        folder: `Olympus Scanlation Series`,
        slug,
      };
    });
  }

  parseChapters(data: ChapterList): ExtractedChapterData[] {
    return data.data.map((chapter: Datum) => ({
      id: chapter.id,
      chapter: parseInt(chapter.name),
      last_page: data.meta.last_page,
    }));
  }
}
