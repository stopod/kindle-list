import type { BookStatus } from "~/lib/books";

/** 読書ステータスのピル。READ=ミント＋✨ / UNKNOWN=ラベンダー */
export function StatusBadge({ status }: { status: BookStatus }) {
  if (status === "READ") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-mint/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shadow-sm backdrop-blur">
        <span className="sparkle" aria-hidden="true">
          ✨
        </span>
        既読
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-lavender/90 px-2 py-0.5 text-[10px] font-bold text-indigo-900/80 shadow-sm backdrop-blur">
      未確認
    </span>
  );
}
