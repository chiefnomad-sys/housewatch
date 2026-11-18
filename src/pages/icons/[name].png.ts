import type { APIRoute } from 'astro';
import { appIcon } from '../../cards/render';

// Icons for the home screen (web app manifest) and Android's install prompt.
const ICONS: Record<string, [number, number]> = {
  'icon-192': [192, 0.78],
  'icon-512': [512, 0.78],
  'maskable-192': [192, 0.6],
  'maskable-512': [512, 0.6],
};

export function getStaticPaths() {
  return Object.keys(ICONS).map((name) => ({ params: { name } }));
}

export const GET: APIRoute = async ({ params }) => {
  const [size, scale] = ICONS[params.name!];
  return new Response(await appIcon(size, scale), { headers: { 'Content-Type': 'image/png' } });
};
