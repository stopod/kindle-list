// @ts-check
/**
 * kindle.csv -> app/data/books.json 変換スクリプト
 *
 * - CSV を引用符対応でパース
 * - 日付 "2026年5月29日" を ISO ("2026-05-29") に正規化
 * - タイトルからシリーズ名・巻数・レーベルを抽出
 * - ASIN から Amazon 書影 URL / 商品 URL を生成
 *
 * 使い方: node scripts/build-data.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "kindle.csv");
const OUT = resolve(ROOT, "app/data/books.json");

/** 全角数字 → 半角数字 */
function toHalfWidthDigits(s) {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/** RFC4180 風の最小 CSV パーサ（ダブルクオート / "" エスケープ対応） */
function parseCsv(text) {
  // BOM 除去
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

/** "2026年5月29日" -> { iso, year, month } */
function parseJpDate(s) {
  const m = s.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!m) return { iso: null, year: null, month: null };
  const [, y, mo, d] = m;
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return { iso, year: Number(y), month: Number(mo) };
}

/**
 * タイトルから { series, volume, label, displayTitle } を抽出。
 * 例: "茶柱倶楽部　2巻 (芳文社コミックス)" -> series:"茶柱倶楽部" volume:2 label:"芳文社コミックス"
 */
function parseTitle(rawTitle) {
  let title = rawTitle.trim();
  let label = null;

  // 末尾の (...) / （...） をレーベルとして切り出す（複数連なっていれば全て剥がす）。
  // ただし中身が数字だけの括弧は巻数なので剥がさない（例: 妹は知っている（３））。
  let lm;
  while ((lm = title.match(/[（(]([^（）()]+)[）)]\s*$/))) {
    const inner = lm[1].trim();
    if (/^[0-9０-９]+$/.test(inner)) break;
    if (label === null) label = inner; // 表示用は最初（最も右）の1つ
    title = title.slice(0, lm.index).trim();
  }

  // 【...】〔...〕（特典・限定などの注記）を任意位置から除去
  let work = title
    .replace(/[【〔][^【】〔〕]*[】〕]/g, " ")
    .replace(/[\s　]+/g, " ")
    .trim();

  // 全角数字を半角に寄せた版で巻数判定（series は元の見た目を保つ）。
  // 全角→半角は1文字対応なので work とインデックスは一致する。
  const normalized = toHalfWidthDigits(work);

  // 明示的な巻数マーカー（「版」など曖昧なものは含めない）。
  // 文字列の任意位置から探し、最も左に現れたものを採用 → その「前」をシリーズ名にする。
  const markers = [
    /第\s*([0-9]+)\s*巻/, // 第N巻
    /([0-9]+)\s*巻/, // N巻
    /\bvol\.?\s*([0-9]+)/i, // Vol.N / volN
    /\bvolume\s*([0-9]+)/i, // VOLUME N
    /\bsession\s*([0-9]+)/i, // session N
    /[#＃]\s*([0-9]+)/, // #N
    /[(（]\s*([0-9]+)\s*[)）]/, // (N) / （N）
  ];
  let best = null; // { index, volume }
  for (const re of markers) {
    const m = normalized.match(re);
    if (m && (best === null || m.index < best.index)) {
      best = { index: m.index, volume: Number(m[1]) };
    }
  }
  // 強いマーカーが無ければ、末尾の独立した数字（空白区切り）だけ拾う
  if (best === null) {
    const m = normalized.match(/[\s　]+([0-9]+)\s*$/);
    if (m) best = { index: m.index, volume: Number(m[1]) };
  }

  let volume = null;
  let series = work;
  if (best) {
    volume = best.volume;
    // マーカー以降（巻数・副題）を捨て、前半をシリーズ名にする
    const head = work.slice(0, best.index).replace(/[\s　]+$/, "").trim();
    if (head) series = head;
  }

  series = series.replace(/[\s　]+$/, "").trim() || work;
  return { series, volume, label };
}

function coverUrl(asin) {
  // Amazon 書影。{ASIN}.{locale}.{size}.jpg / 取得不可時は UI 側でフォールバック
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`;
}

function productUrl(asin) {
  return `https://www.amazon.co.jp/dp/${asin}`;
}

// ---- main ----
const text = readFileSync(SRC, "utf8");
const rows = parseCsv(text);
const header = rows[0].map((h) => h.trim());
const idx = {
  title: header.indexOf("title"),
  authors: header.indexOf("authors"),
  date: header.indexOf("date"),
  status: header.indexOf("status"),
  asin: header.indexOf("asin"),
};

const books = rows.slice(1).map((r, i) => {
  const rawTitle = r[idx.title] ?? "";
  const { series, volume, label } = parseTitle(rawTitle);
  const { iso, year, month } = parseJpDate(r[idx.date] ?? "");
  const asin = (r[idx.asin] ?? "").trim();
  return {
    id: asin || `row-${i}`,
    title: rawTitle.trim(),
    series,
    volume,
    label,
    authors: (r[idx.authors] ?? "").trim(),
    dateRaw: (r[idx.date] ?? "").trim(),
    date: iso,
    year,
    month,
    status: (r[idx.status] ?? "").trim(),
    asin,
    coverUrl: asin ? coverUrl(asin) : null,
    productUrl: asin ? productUrl(asin) : null,
  };
});

// 統計
const total = books.length;
const read = books.filter((b) => b.status === "READ").length;
const unknown = total - read;
// UI のグルーピング（app/lib/books.ts の seriesKey）と同じ正規化で数える
const seriesKey = (s) => s.normalize("NFKC").replace(/\s+/g, "").toLowerCase();
const seriesCount = new Set(books.map((b) => seriesKey(b.series))).size;
const authorCount = new Set(books.map((b) => b.authors).filter(Boolean)).size;

const payload = {
  generatedFrom: "kindle.csv",
  stats: { total, read, unknown, seriesCount, authorCount },
  books,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");

console.log(`✔ ${total} 冊を書き出しました -> app/data/books.json`);
console.log(`  READ: ${read} / UNKNOWN: ${unknown} / シリーズ: ${seriesCount} / 著者: ${authorCount}`);
