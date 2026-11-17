import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getStories } from '../lib/content';
import { SITE } from '../site';

export async function GET(context: APIContext) {
  const stories = await getStories();
  return rss({
    title: 'Housewatch',
    description: SITE.description,
    site: context.site!,
    items: stories.map((s) => ({ title: s.data.title, description: s.data.dek, pubDate: s.data.date, link: `/stories/${s.id}/`, categories: s.data.beats })),
  });
}
