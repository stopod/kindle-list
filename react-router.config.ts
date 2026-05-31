import type { Config } from "@react-router/dev/config";

// GitHub Pages のプロジェクトサイト（https://<user>.github.io/kidle-list/）向け設定。
// - ssr: false      … サーバを持たない静的サイト
// - prerender       … ビルド時に各ルートの HTML を生成（事前レンダリング）
// - basename        … サブパス配信に対応
export default {
  ssr: false,
  prerender: ["/"],
  basename: "/kidle-list/",
  future: {
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
