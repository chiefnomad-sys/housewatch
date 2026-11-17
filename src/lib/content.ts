import { getCollection, type CollectionEntry } from 'astro:content';
import { beatSlug } from '../site';

export type Story = CollectionEntry<'articles'>;

export async function getStories(): Promise<Story[]> {
  const all = await getCollection('articles', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const storyUrl = (s: Story) => `/stories/${s.id}/`;
export const mainBeat = (s: Story) => s.data.beats[0];
export const mainBeatUrl = (s: Story) => `/${beatSlug(mainBeat(s))}/`;

export function readMinutes(s: Story) {
  const words = (s.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function pickLead(stories: Story[]) {
  return stories.find((s) => s.data.featured) ?? stories[0];
}

const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const fmtShort = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date) => fmt.format(d);
export const formatShort = (d: Date) => fmtShort.format(d);
