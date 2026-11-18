import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import keystatic from '@keystatic/astro';

// Pages are prerendered (static). Only the Keystatic admin at /keystatic and its
// /api/keystatic routes run on demand, as Netlify functions.
// PREVIEW_FILES=1 builds a plain static copy with page.html files, used only for
// sharing a preview outside Netlify.
const previewFiles = process.env.PREVIEW_FILES === '1';

export default defineConfig({
  site: 'https://housewatch.news',
  trailingSlash: 'ignore',
  ...(previewFiles
    ? { build: { format: 'file' } }
    : { adapter: netlify({ devFeatures: { edgeFunctions: false } }) }),
  integrations: [
    react(),
    ...(previewFiles ? [] : [keystatic()]),
    sitemap({ filter: (page) => !page.includes('/keystatic') && !page.includes('/thanks') && !page.includes('/offline') }),
  ],
});
