// @ts-check
import { defineConfig } from 'astro/config';
import remarkCjkFriendly from 'remark-cjk-friendly';

/**
 * Markdownの<table>を <div class="blog-table-wrap"> でラップする。
 * 既存の blog-inline.css が `.blog-table-wrap table` 前提のため。
 */
function rehypeTableWrap() {
  return (tree) => {
    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      node.children = node.children.map((child) => {
        walk(child);
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['blog-table-wrap'] },
            children: [child],
          };
        }
        return child;
      });
    };
    walk(tree);
  };
}

// 出力は ../blog（=notre.co.jp/blog）。サイト全体は静的デプロイのまま。
// build後に `npm run sync`(rsync) で dist/ を ../blog/ にミラーする。
export default defineConfig({
  site: 'https://notre.co.jp',
  base: '/blog',
  trailingSlash: 'ignore',
  build: { format: 'file' },
  markdown: {
    // 日本語で **強調** の直後にCJK文字/全角句読点が続くと変換されない問題を解消
    remarkPlugins: [remarkCjkFriendly],
    rehypePlugins: [rehypeTableWrap],
  },
});
