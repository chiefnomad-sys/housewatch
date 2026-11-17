import type { APIRoute } from 'astro';
import { HMARK } from '../data/marks';
// Gothic H with the red bar on a black tile.
export const GET: APIRoute = () => {
  const b = HMARK.bar;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="72" fill="#0b0b0b"/><g transform="translate(256 256) scale(0.82) translate(-256 -236)"><path fill="#fff" d="${HMARK.h}"/><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#e4312b"/></g></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
