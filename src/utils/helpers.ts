export function capitalizeText(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getDomains(bookmarks: { url: string }[]): string[] {
  if (bookmarks.length === 0) return [];

  const domains = new Set<string>();

  bookmarks.forEach((manga) => {
    try {
      const url = new URL(manga.url);
      const domain = url.hostname;
      if (!domains.has(domain)) {
        domains.add(domain);
      }
    } catch (error) {
      console.error(`Invalid URL: ${manga.url}`, error);
    }
  });

  return Array.from(domains.values());
}
