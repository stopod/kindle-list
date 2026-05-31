# 🎀 きんどる本棚 (kidle-list)

自分の Kindle 蔵書(`kindle.csv`)を、ピンク × パステル × サブカルなギャラリーで眺める静的サイト。
React Router v7（フレームワークモード / 事前レンダリング）で作り、GitHub Pages に公開します。

- デザイン方針 … [DESIGN.md](./DESIGN.md)
- 公開URL（例）… `https://<ユーザー名>.github.io/kidle-list/`

## 機能

- 📚 書影グリッド（ASIN から Amazon 書影を表示／取得失敗時はパステルのプレースホルダー）
- 🔍 タイトル・著者の絞り込み検索
- 🏷️ ステータス（既読 / 未確認）フィルタ
- ↕️ 並べ替え（追加日 / タイトル / 著者）
- 📦 シリーズまとめ表示（同一シリーズを巻数バッジ付きで集約）
- 📊 蔵書統計（総数 / 既読 / 未確認 / シリーズ数）

## データの流れ

```
kindle.csv  ──(scripts/build-data.mjs)──▶  app/data/books.json  ──▶  UI
```

- `npm run data` で `kindle.csv` を再変換して `app/data/books.json` を更新します。
- `dev` / `build` の前にも自動で変換が走ります（`predev` / `prebuild`）。
- タイトルからシリーズ名・巻数・レーベルを抽出し、日付を ISO に正規化します。

CSV を更新したら、コミットして push するだけで再ビルド＆再デプロイされます。

## 開発

```bash
npm install
npm run dev      # http://localhost:5173/kidle-list/
```

## 本番ビルド

```bash
npm run build    # prebuild(変換) → 事前レンダリング → postbuild(配置)
```

成果物は `build/client/`（`index.html` をルートに配置済み・`404.html`・`.nojekyll` 付き）。
そのまま GitHub Pages の静的アーティファクトとして配信できます。

## GitHub Pages へ公開する手順

1. リポジトリ名を **`kidle-list`** で作成し push（別名にする場合は下記参照）。
2. GitHub のリポジトリ設定 → **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする。
3. `main` に push すると [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) が
   ビルドして Pages へデプロイします。

### リポジトリ名を変える場合

サブパスを 2 箇所そろえます（リポジトリ名と一致させる）。

- `vite.config.ts` の `base`
- `react-router.config.ts` の `basename`
- あわせて `scripts/postbuild.mjs` の `kidle-list` も置き換え

> ユーザーサイト（`<ユーザー名>.github.io`）やカスタムドメインのルート配信にする場合は、
> `base` / `basename` を `"/"` にしてください。

## 技術スタック

React Router v7 ・ React 19 ・ TypeScript ・ Tailwind CSS v4 ・ Vite
