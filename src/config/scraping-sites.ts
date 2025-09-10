import type { MangaTrackerConfig, TwitterTrackerConfig } from '@type/scraping';

export const TWITTER_CONFIG: TwitterTrackerConfig = {
  pageName: 'twitter accounts',
  selectors: {
    list: '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > section > div > div',
    item: 'div',
    title:
      'div > div > button > div > div.css-175oi2r.r-1iusvr4.r-16y2uox > div.css-175oi2r.r-1awozwy.r-18u37iz.r-1wtj0ep > div.css-175oi2r.r-1wbh5a2.r-dnmrzs.r-1ny4l3l > div > div.css-175oi2r.r-1wbh5a2.r-dnmrzs > a > div.css-175oi2r.r-1awozwy.r-18u37iz.r-dnmrzs > div.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-b88u0q.r-1awozwy.r-6koalj.r-1udh08x.r-3s2u2q > span.css-1jxf684.r-dnmrzs.r-1udh08x.r-1udbk01.r-3s2u2q.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3',
    href: 'div > div > button > div > div.css-175oi2r.r-1iusvr4.r-16y2uox > div.css-175oi2r.r-1awozwy.r-18u37iz.r-1wtj0ep > div.css-175oi2r.r-1wbh5a2.r-dnmrzs.r-1ny4l3l > div > div.css-175oi2r.r-1wbh5a2.r-dnmrzs > a',
  },
  savedSelectors: {
    list: 'div[aria-label="Cronología: Guardados"]',
    item: 'article[data-testid="tweet"]',
    title: 'span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3',
    href: 'a[role="link"]',
    savedButton: 'button[data-testid="removeBookmark"]',
  },
  normalizers: {
    href: {
      base: 'https://x.com',
      end: '/media',
    },
  },
};

export const ikigai: MangaTrackerConfig = {
  pageName: 'ikigai manga',
  normalizers: {
    title: { base: '', end: ' | Ikigai Mangas' },
    href: { base: 'https://visualikigai.kloudytech.com/', end: '/' },
  },
  selectors: {
    list: 'body > main > section > ul',
    item: 'li',
    title: 'a > h3',
    href: 'a',
  },
  nextPage: (page: number) =>
    `https://visualikigai.kloudytech.com//series/?pagina=${page}`,
  initialPage: 1,
};
