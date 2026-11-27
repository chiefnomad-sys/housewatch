import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const beat = z.enum(['Paycheck', 'Health', 'The Job', 'Gear']);

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    date: z.coerce.date(),
    beats: z.array(beat).min(1), // the first one is the story's main beat
    author: z.string().default('Housewatch staff'),
    short: z.array(z.string()).default([]), // "The short version" lines, two or three
    featured: z.boolean().default(false), // pin as the homepage lead
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imageCaption: z.string().optional(),
    imageCredit: z.string().optional(),
    // Optional call-out near the top of the story. Placed by src/lib/rehype-pull-quote.mjs.
    pull_quote: z
      .object({
        text: z.string().optional(),
        attribution: z.string().optional(),
        source: z.string().optional(),
        after_paragraph: z.coerce.number().int().min(1).max(6).optional(),
      })
      .optional(),
    sources: z.array(z.object({ title: z.string(), url: z.string().url().optional().or(z.literal('')) })).default([]),
    corrections: z.array(z.object({ date: z.coerce.date(), note: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { articles, pages };
