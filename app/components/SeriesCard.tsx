import type { SeriesGroup } from "~/lib/books";
import { CoverImage } from "./CoverImage";
import { StatusBadge } from "./StatusBadge";

/**
 * シリーズまとめカード。背後に重なった紙で「束」を表現し、全巻数を表示。
 * 単巻の場合は通常カード相当の見た目になる。
 */
export function SeriesCard({ group }: { group: SeriesGroup }) {
  const rep = group.representative;
  const multi = group.count > 1;
  // シリーズ内に1冊でも既読があれば既読扱いのバッジ
  const anyRead = group.books.some((b) => b.status === "READ");

  return (
    <a
      href={rep.productUrl ?? "#"}
      target="_blank"
      rel="noreferrer"
      title={`${group.series}（全${group.count}巻）`}
      className="group block rounded-2xl bg-surface p-2 shadow-[0_4px_14px_-6px_rgba(255,79,158,0.4)] ring-1 ring-border-soft transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_22px_-8px_rgba(255,79,158,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink active:scale-[0.97]"
    >
      <div className="relative aspect-2/3">
        {/* 背後の束（複数巻のときだけ） */}
        {multi && (
          <>
            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-3 rounded-xl bg-lavender/50" />
            <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rotate-1 rounded-xl bg-pink/40" />
          </>
        )}

        <div className="relative h-full w-full overflow-hidden rounded-xl bg-cream ring-1 ring-border-soft">
          <CoverImage book={rep} />

          <div className="absolute left-1.5 top-1.5">
            <StatusBadge status={anyRead ? "READ" : rep.status} />
          </div>

          {multi && (
            <div className="absolute right-1.5 top-1.5">
              <span className="rounded-full bg-pink-vivid px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                全{group.count}巻
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-1 pb-1 pt-2">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-ink group-hover:text-pink-vivid">
          {group.series}
        </p>
        {rep.authors && (
          <p className="mt-1 line-clamp-1 text-[11px] text-ink-soft">{rep.authors}</p>
        )}
      </div>
    </a>
  );
}
