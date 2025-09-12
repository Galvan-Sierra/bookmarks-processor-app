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

export const mhScan: MangaTrackerConfig = {
  pageName: 'mhScan manga',
  normalizers: {},
  selectors: {
    list: 'body > div.wrap > div > div.site-content > div.c-page-content > div > div > div > div > div > div > div.c-page__content > div > div',

    item: 'div',
    title: 'div.col-8.col-md-10 > div.tab-summary > div.post-title > h3',
    href: 'div.col-8.col-md-10 > div.tab-summary > div.post-title > h3 > a',
  },
};

export const lectorKnight: MangaTrackerConfig = {
  pageName: 'lectorknight',
  normalizers: {
    title: { base: '', end: ' - Lector KNS' },
    href: { base: '', end: '/' },
  },
  selectors: {
    list: 'body > div.wrap > div > div.site-content > div.c-page-content.style-1 > div > div > div > div > div.main-col-inner > div > div.c-page__content > div.tab-content-wrap > div',
    item: '.manga__item ',
    title: 'div.manga__content > div > div > h2 > a',
    href: 'div.manga__content > div > div > h2 > a',
  },
  nextPage: (page) => `https://lectorknight.com/biblioteca/page/${page}`,
  initialPage: 1,
};

export const plotTwistManga: MangaTrackerConfig = {
  pageName: 'plot twist manga',
  normalizers: {
    title: { base: '', end: ' - Plot Twist No Fansub' },
  },
  selectors: {
    list: '#tdi_52',
    item: 'div',
    title: 'div > div.td-module-meta-info > h2',
    href: 'div > div.td-module-meta-info > h2 > a',
  },
};

export const ravenMangas: MangaTrackerConfig = {
  pageName: 'raven mangas',
  normalizers: {
    title: { base: '', end: ' | Raven series' },
  },
  selectors: {
    list: '#projectsDiv',
    item: 'figure',
    title:
      'div.absolute-b-left.w-full.py-2.px-1.md\\:px-2.rounded-inherit.text-center.flex.flex-col.gap-2 > a > figcaption',
    href: 'a',
  },
  nextPage: (page) => `https://ravensword.lat/comics?page=${page}`,
  initialPage: 1,
};
