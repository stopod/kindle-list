import { useMemo, useState } from "react";
import {
  PiBooksDuotone,
  PiMagnifyingGlassBold,
  PiStackDuotone,
  PiBookmarksSimpleDuotone,
} from "react-icons/pi";
import type { Route } from "./+types/home";
import {
  allBooks,
  stats,
  filterAndSort,
  groupBySeries,
  SORT_LABELS,
  type SortKey,
} from "~/lib/books";
import { BookCard } from "~/components/BookCard";
import { SeriesCard } from "~/components/SeriesCard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "きんどる本棚" },
    {
      name: "description",
      content: "わたしの Kindle 蔵書ギャラリー。ピンクとパステルの本棚をのぞき見。",
    },
  ];
}

const numberFmt = new Intl.NumberFormat("ja-JP");

export default function Home() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [grouped, setGrouped] = useState(false);

  const filtered = useMemo(
    () => filterAndSort(allBooks, { query, sort }),
    [query, sort]
  );
  const groups = useMemo(
    () => (grouped ? groupBySeries(filtered) : []),
    [grouped, filtered]
  );

  const resultCount = grouped ? groups.length : filtered.length;

  return (
    <div className="min-h-dvh">
      <Header />

      <Toolbar
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        grouped={grouped}
        setGrouped={setGrouped}
        resultCount={resultCount}
      />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {resultCount === 0 ? (
          <EmptyState />
        ) : grouped ? (
          <Grid>
            {groups.map((g) => (
              <SeriesCard key={g.key} group={g} />
            ))}
          </Grid>
        ) : (
          <Grid>
            {filtered.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </Grid>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6">
      {children}
    </div>
  );
}

function Header() {
  const pills = [
    { label: "蔵書", value: stats.total, tone: "bg-pink/15 text-pink-vivid" },
    { label: "シリーズ", value: stats.seriesCount, tone: "bg-lavender/30 text-indigo-900/80" },
    { label: "著者", value: stats.authorCount, tone: "bg-lemon/40 text-amber-800" },
  ];
  return (
    <header className="relative overflow-hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-8 pt-10 sm:px-6 sm:pb-10 lg:px-8">
        <div className="flex items-center gap-2.5">
          <PiBooksDuotone className="text-3xl text-pink-vivid sm:text-4xl" aria-hidden="true" />
          <h1 className="font-display text-3xl text-pink-vivid drop-shadow-sm sm:text-4xl">
            きんどる本棚
          </h1>
        </div>
        <p className="max-w-prose text-sm text-ink-soft">
          わたしの Kindle 蔵書ギャラリー。表紙をクリックすると Amazon の商品ページがひらきます。
        </p>
        <ul className="flex flex-wrap gap-2">
          {pills.map((p) => (
            <li
              key={p.label}
              className={`inline-flex items-baseline gap-1 rounded-full px-3 py-1 text-sm font-medium ${p.tone}`}
            >
              <span className="text-xs opacity-80">{p.label}</span>
              <span className="font-display text-base leading-none">
                {numberFmt.format(p.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* 波線（スカラップ）の台紙縁 */}
      <Scallop />
    </header>
  );
}

function Scallop() {
  return (
    <svg
      className="block h-3 w-full text-surface"
      preserveAspectRatio="none"
      viewBox="0 0 1200 16"
      aria-hidden="true"
    >
      <path
        d="M0,16 V8 C50,16 100,16 150,8 C200,0 250,0 300,8 C350,16 400,16 450,8 C500,0 550,0 600,8 C650,16 700,16 750,8 C800,0 850,0 900,8 C950,16 1000,16 1050,8 C1100,0 1150,0 1200,8 V16 Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface ToolbarProps {
  query: string;
  setQuery: (v: string) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
  grouped: boolean;
  setGrouped: (v: boolean) => void;
  resultCount: number;
}

function Toolbar(props: ToolbarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-border-soft bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* 検索 */}
          <label className="relative flex-1">
            <PiMagnifyingGlassBold
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
            <input
              type="search"
              value={props.query}
              onChange={(e) => props.setQuery(e.target.value)}
              placeholder="タイトル・著者で探す"
              className="w-full rounded-full border border-border-soft bg-cream py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft/70 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/50"
            />
          </label>

          {/* ソート */}
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <span className="hidden sm:inline">並び</span>
            <select
              value={props.sort}
              onChange={(e) => props.setSort(e.target.value as SortKey)}
              className="rounded-full border border-border-soft bg-cream px-3 py-2 text-sm text-ink focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/50"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* シリーズまとめトグル */}
          <button
            type="button"
            role="switch"
            aria-checked={props.grouped}
            onClick={() => props.setGrouped(!props.grouped)}
            className={
              props.grouped
                ? "inline-flex items-center gap-2 rounded-full bg-lavender px-3 py-1 text-sm font-medium text-indigo-900/80 shadow-sm"
                : "inline-flex items-center gap-2 rounded-full border border-border-soft bg-cream px-3 py-1 text-sm text-ink-soft hover:border-pink hover:text-pink-vivid"
            }
          >
            <PiStackDuotone className="text-base" aria-hidden="true" />
            <span
              className={
                props.grouped
                  ? "relative h-4 w-7 rounded-full bg-white/70"
                  : "relative h-4 w-7 rounded-full bg-ink-soft/30"
              }
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-pink-vivid transition-all ${
                  props.grouped ? "left-3.5" : "left-0.5"
                }`}
              />
            </span>
            シリーズでまとめる
          </button>

          <span className="ml-auto text-xs text-ink-soft">
            {numberFmt.format(props.resultCount)} 件
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <PiBookmarksSimpleDuotone className="text-5xl text-pink/70" aria-hidden="true" />
      <p className="font-display text-2xl text-pink">みつかりませんでした</p>
      <p className="text-sm text-ink-soft">
        キーワードを変えて、もう一度さがしてみてください。
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-soft py-8 text-center text-xs text-ink-soft">
      <p>きんどる本棚 — {numberFmt.format(stats.total)} 冊の蔵書ギャラリー</p>
    </footer>
  );
}
