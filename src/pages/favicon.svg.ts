import type { APIRoute } from 'astro';
import { iconSvg } from '../cards/render';
// Gothic H with the red bar, filling most of a rounded black tile.
export const GET: APIRoute = () => new Response(iconSvg(512, 0.9, 72), { headers: { 'Content-Type': 'image/svg+xml' } });
