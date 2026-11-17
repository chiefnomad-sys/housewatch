import type { APIRoute } from 'astro';
import { appIcon } from '../cards/render';
export const GET: APIRoute = async () => new Response(await appIcon(180), { headers: { 'Content-Type': 'image/png' } });
