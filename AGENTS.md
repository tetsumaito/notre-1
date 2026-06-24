<!-- Codex用: この AGENTS.md は同階層の CLAUDE.md を元に作成。Claude Code固有のコマンドや .claude 配下の記述は、Codexでは参考情報として扱う。 -->

# Notre-1 プロジェクト

## デザインシステム

- 楽天EC LPのデザインは `company/dev/docs/design-rakuten-ec-lp.md` を参照すること

## ブログ運用

- ブログ記事は `blog/*.html` を**直接編集**する（生成ツールは使わない）
- 新規記事は既存の `blog/xxx.html` を複製して作成し、`blog/index.html` に一覧カードを追加する
- ヘッダー/フッター/モーダルは `main.js` が `/assets/includes/` から実行時に挿入。JSON-LD（スキーマ）やOGP等はHTML内に直書きする
- ビルド工程なし。`build.sh` が `blog/` をそのまま `dist/` へコピーして配信する
