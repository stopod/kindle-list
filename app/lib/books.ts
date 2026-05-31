import raw from "~/data/books.json";

export type BookStatus = "READ" | "UNKNOWN" | (string & {});

export interface Book {
  id: string;
  title: string;
  series: string;
  volume: number | null;
  label: string | null;
  authors: string;
  dateRaw: string;
  date: string | null;
  year: number | null;
  month: number | null;
  status: BookStatus;
  asin: string;
  coverUrl: string | null;
  productUrl: string | null;
}

export interface LibraryStats {
  total: number;
  read: number;
  unknown: number;
  seriesCount: number;
  authorCount: number;
}

export interface Library {
  generatedFrom: string;
  stats: LibraryStats;
  books: Book[];
}

export const library = raw as Library;
export const allBooks: Book[] = library.books;
export const stats: LibraryStats = library.stats;

export type SortKey = "date-desc" | "title-asc" | "author-asc";

export const SORT_LABELS: Record<SortKey, string> = {
  "date-desc": "追加日が新しい順",
  "title-asc": "タイトル順",
  "author-asc": "著者順",
};

/** シリーズをまとめた表示用グループ */
export interface SeriesGroup {
  key: string;
  series: string;
  books: Book[]; // 巻順ソート済み
  representative: Book; // 代表（最小巻 or 先頭）
  count: number;
}

const collator = new Intl.Collator("ja");

/** 検索・並べ替えを適用 */
export function filterAndSort(
  books: Book[],
  opts: { query: string; sort: SortKey }
): Book[] {
  const q = opts.query.trim().toLowerCase();
  let out = q
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authors.toLowerCase().includes(q) ||
          b.series.toLowerCase().includes(q)
      )
    : books.slice();

  out = [...out].sort((a, b) => {
    switch (opts.sort) {
      case "title-asc":
        return collator.compare(a.title, b.title);
      case "author-asc":
        return (
          collator.compare(a.authors, b.authors) ||
          collator.compare(a.series, b.series) ||
          (a.volume ?? 0) - (b.volume ?? 0)
        );
      case "date-desc":
      default:
        // 追加日の新しい順。同日は元の並び（CSV順）を保つため date のみで比較
        return (b.date ?? "").localeCompare(a.date ?? "");
    }
  });

  return out;
}

/** 巻順比較（巻数なしは末尾） */
function byVolume(a: Book, b: Book): number {
  if (a.volume == null && b.volume == null) return collator.compare(a.title, b.title);
  if (a.volume == null) return 1;
  if (b.volume == null) return -1;
  return a.volume - b.volume;
}

/** シリーズ単位にまとめる（並び順は books の並びを尊重して最初の出現順） */
export function groupBySeries(books: Book[]): SeriesGroup[] {
  const map = new Map<string, Book[]>();
  for (const b of books) {
    const arr = map.get(b.series);
    if (arr) arr.push(b);
    else map.set(b.series, [b]);
  }
  const groups: SeriesGroup[] = [];
  for (const [series, arr] of map) {
    const sorted = [...arr].sort(byVolume);
    groups.push({
      key: series,
      series,
      books: sorted,
      representative: sorted[0],
      count: arr.length,
    });
  }
  return groups;
}

/** 文字列から決定的にパステルの色相を得る（書影フォールバック用） */
export function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) % 360;
  }
  return h;
}
