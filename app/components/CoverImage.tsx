import { useState } from "react";
import type { Book } from "~/lib/books";
import { hueFromString } from "~/lib/books";

/**
 * 書影画像。取得失敗時はシリーズ色から決まるパステルのグラデ地＋頭文字＋📖 を表示。
 */
export function CoverImage({ book }: { book: Book }) {
  const [errored, setErrored] = useState(false);
  const showFallback = errored || !book.coverUrl;

  if (showFallback) {
    const hue = hueFromString(book.series || book.title);
    const bg = `linear-gradient(150deg, hsl(${hue} 90% 90%), hsl(${(hue + 40) % 360} 85% 82%))`;
    const initial = (book.series || book.title).trim().charAt(0) || "📖";
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center"
        style={{ background: bg }}
        aria-hidden="true"
      >
        <span
          className="font-display text-3xl text-white drop-shadow-sm sm:text-4xl"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
        >
          {initial}
        </span>
        <span className="line-clamp-2 text-[10px] font-medium leading-tight text-white/90">
          {book.series || book.title}
        </span>
        <span className="text-lg">📖</span>
      </div>
    );
  }

  return (
    <img
      src={book.coverUrl!}
      alt={book.title}
      loading="lazy"
      onError={() => setErrored(true)}
      className="h-full w-full object-cover"
    />
  );
}
