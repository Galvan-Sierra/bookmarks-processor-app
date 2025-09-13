export interface OlympusList {
  data: Data;
}

export interface Data {
  series: Series;
  recommended_series: string;
}

export interface Series {
  current_page: number;
  data: Datum[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Link[];
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: null;
  to: number;
  total: number;
}

export interface Datum {
  id: number;
  name: string;
  slug: string;
  status: Status | null;
  cover: string;
  cover_srcset: string;
  chapter_count: number;
  type: Type;
  total_views: number;
  monthly_views: number;
}

export interface Status {
  id: number;
  name: string;
}

export enum Type {
  Comic = 'comic',
}

export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}

export interface ChapterList {
  data: Datum[];
  links: Links;
  meta: Meta;
}

export interface Datum {
  name: string;
  id: number;
  published_at: Date;
  team: Team;
  read_by_auth: boolean;
}

export interface Team {
  id: number;
  name: Name;
}

export enum Name {
  Olympus = 'Olympus ',
}

export interface Links {
  first: string;
  last: string;
  prev: null;
  next: string;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  links: Link[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}

export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}

export interface ChapterList {
  data: Datum[];
  links: Links;
  meta: Meta;
}

export interface Datum {
  name: string;
  id: number;
  published_at: Date;
  team: Team;
  read_by_auth: boolean;
}

export interface Team {
  id: number;
  name: Name;
}

// export enum Name {
//   Olympus = 'Olympus ',
// }

export interface Links {
  first: string;
  last: string;
  prev: null;
  next: string;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  links: Link[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

// Interface para el resultado extraído
export interface ExtractedChapterData {
  chapter: number;
  id: number;
  last_page: number;
}
