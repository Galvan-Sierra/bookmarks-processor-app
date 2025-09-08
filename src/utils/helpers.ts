import type { Bookmark } from '@type/bookmark';
import { readdir } from 'node:fs/promises';

export async function readDirectory(path: string): Promise<string[]> {
  const normalizePath = path.replaceAll('/', '\\');

  const files = await readdir(normalizePath, { recursive: true });
  return files.map((file) => normalizePath + file);
}

export function getUniqueBookmarkValuesByProperty(
  bookmarks: Bookmark[],
  property: 'title' | 'href'
): Bookmark[] {
  const uniqueValues = new Map<string, Bookmark>();

  if (!bookmarks?.length) return [];

  bookmarks.forEach((bookmark) => {
    if (!uniqueValues.has(bookmark[property])) {
      uniqueValues.set(bookmark[property], bookmark);
    }
  });

  return Array.from(uniqueValues.values());
}
