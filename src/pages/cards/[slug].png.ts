import type { APIRoute } from 'astro';
import { getStories, mainBeat, formatDate } from '../../lib/content';
import { storyCard } from '../../cards/render';

export async function getStaticPaths() {
  const stories = await getStories();
  return stories.map((s) => ({ params: { slug: s.id }, props: { story: s } }));
}

export const GET: APIRoute = async ({ props }) => {
  const s = (props as { story: Awaited<ReturnType<typeof getStories>>[number] }).story;
  const png = await storyCard({ title: s.data.title, beat: mainBeat(s), date: formatDate(s.data.date), line: s.data.short[0] });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
