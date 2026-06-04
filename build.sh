#!/usr/bin/env bash
# Cloudflare Pages ビルド: 公開用ファイルだけを dist/ に集約する。
# 開発用ドキュメント・設定・ビルドソースは配信対象から除外する。
# Cloudflare Pages 設定: Build command = "bash build.sh" / Build output directory = "dist"
set -euo pipefail

OUT="dist"
rm -rf "$OUT"; mkdir -p "$OUT"

# 配信しないトップレベル項目（開発用ファイル・設定・ビルド成果物）
EXCLUDE=(".git" ".github" ".claude" "node_modules" "dist" "_blog-astro" "build.sh"
         "CLAUDE.md" "AGENTS.md" "README.md"
         ".gitignore" ".assetsignore" ".DS_Store" ".vercel" ".wrangler")

shopt -s dotglob nullglob
for item in *; do
  for ex in "${EXCLUDE[@]}"; do [[ "$item" == "$ex" ]] && continue 2; done
  cp -R "$item" "$OUT"/
done

# ネストした .DS_Store も除去
find "$OUT" -name '.DS_Store' -delete 2>/dev/null || true
echo "Built $OUT/ : $(find "$OUT" -type f | wc -l | tr -d ' ') files"
