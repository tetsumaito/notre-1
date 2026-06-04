import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// /blog の記事。Markdown本文 + frontmatterで共通シェル（SUMMARY/FAQ/チェックリスト等）を駆動する。
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(), // 記事のh1
    metaTitle: z.string().optional(), // <title>用（省略時はtitle）。末尾に｜Notre株式会社を自動付与
    description: z.string(), // meta description / OGP
    category: z.string(), // カテゴリピル（例: LINE運用 / AI活用 / CRM）
    publishDate: z.coerce.date(), // 公開日（JSON-LD用 ISO）
    updateDate: z.coerce.date().optional(), // 更新日
    displayDate: z.string(), // 記事ヘッダー表示（例: "2026.04.14 公開"）
    cardDate: z.string().optional(), // 一覧カード表示（例: "2026.04 公開"）
    readingTime: z.string().default('約8分で読めます'),
    thumbnail: z.string(), // ヒーロー/カード画像（例: /assets/img/works/xxx.webp）
    thumbnailAlt: z.string().default(''),
    ogImage: z.string().default('/assets/img/works/works_notre.webp'),
    lead: z.string().optional(), // 記事ヘッダーの説明文
    excerpt: z.string(), // 一覧カードの本文
    summary: z.string(), // SUMMARYボックス（結論先出し）
    about: z.array(z.string()).default([]), // JSON-LD about
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    checklist: z.array(z.string()).default([]),
    checklistTitle: z.string().optional(),
    checklistNote: z.string().optional(),
    references: z.array(z.string()).default([]),
    note: z.string().optional(),
    ctaTitle: z.string().optional(),
    ctaText: z.string().optional(),
    draft: z.boolean().default(false),
    externalUrl: z.string().optional(), // 既存の静的HTML記事を一覧に載せる場合だけ指定
  }),
});

export const collections = { blog };
