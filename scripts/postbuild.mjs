// @ts-check
/**
 * GitHub Pages 配信向けのビルド後処理。
 *
 * React Router の basename ("/kidle-list/") により、事前レンダリングされた HTML は
 * build/client/kidle-list/index.html に出力される。一方アセットは build/client/assets/ にある。
 *
 * GitHub Pages のプロジェクトサイトは artifact を https://<user>.github.io/kidle-list/ で配信するため、
 * 「artifact ルート = /kidle-list/」となる。よって index.html を artifact ルートへ移動し、
 * アセット参照 (/kidle-list/assets/...) と URL を一致させる。
 *
 *  - build/client/kidle-list/index.html -> build/client/index.html
 *  - build/client/404.html              （SPA フォールバック = index の複製）
 *  - build/client/.nojekyll             （_ 始まりファイルを Jekyll に処理させない）
 */
import {
  existsSync,
  renameSync,
  copyFileSync,
  writeFileSync,
  rmSync,
  readdirSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = resolve(ROOT, "build/client");
const NESTED = resolve(CLIENT, "kidle-list/index.html");
const ROOT_INDEX = resolve(CLIENT, "index.html");

if (!existsSync(CLIENT)) {
  console.error("✗ build/client が見つかりません。先に `npm run build` を実行してください。");
  process.exit(1);
}

if (existsSync(NESTED)) {
  renameSync(NESTED, ROOT_INDEX);
  // 空になった kidle-list ディレクトリを掃除
  const nestedDir = resolve(CLIENT, "kidle-list");
  if (existsSync(nestedDir) && readdirSync(nestedDir).length === 0) {
    rmSync(nestedDir, { recursive: true, force: true });
  }
  console.log("✔ index.html を artifact ルートへ移動");
} else if (!existsSync(ROOT_INDEX)) {
  console.error("✗ index.html が見つかりません（build/client/kidle-list/index.html もありません）。");
  process.exit(1);
}

// SPA フォールバック（深いパスでのリロード対策）
copyFileSync(ROOT_INDEX, resolve(CLIENT, "404.html"));
// Jekyll 無効化
writeFileSync(resolve(CLIENT, ".nojekyll"), "");

console.log("✔ 404.html / .nojekyll を生成 -> build/client");
