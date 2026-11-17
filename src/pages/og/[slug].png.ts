import type { APIRoute } from 'astro';
import { getStories, mainBeat } from '../../lib/content';
import { previewImage } from '../../cards/render';

export async function getStaticPaths() {
  const stories = await getStories();
  return [
    { params: { slug: 'default' }, props: { title: 'Independent news for the everyday firefighter' } },
    ...stories.map((s) => ({ params: { slug: s.id }, props: { title: s.data.title, beat: mainBeat(s) } })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const { title, beat } = props as { title: string; beat?: string };
  return new Response(await previewImage({ title, beat }), { headers: { 'Content-Type': 'image/png' } });
};
