import type { Book } from "~/lib/books";
import { CoverImage } from "./CoverImage";

/** 1冊分の書影カード。クリックで Amazon 商品ページへ。 */
export function BookCard({ book }: { book: Book }) {
  return (
    <a
      href={book.productUrl ?? "#"}
      target="_blank"
      rel="noreferrer"
      title={book.title}
      className="group block rounded-2xl bg-surface p-2 shadow-[0_4px_14px_-6px_rgba(255,79,158,0.4)] ring-1 ring-border-soft transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_22px_-8px_rgba(255,79,158,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink active:scale-[0.97]"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-cream">
        <CoverImage book={book} />

        {/* 巻数（右上） */}
        {book.volume != null && (
          <div className="absolute right-1.5 top-1.5">
            <span className="rounded-full bg-pink-vivid px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              #{book.volume}
            </span>
          </div>
        )}
      </div>

      <div className="px-1 pb-1 pt-2">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-ink group-hover:text-pink-vivid">
          {book.title}
        </p>
        {book.authors && (
          <p className="mt-1 line-clamp-1 text-[11px] text-ink-soft">{book.authors}</p>
        )}
      </div>
    </a>
  );
}
