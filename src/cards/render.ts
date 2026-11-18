// Builds the text-only share cards (4:5, 1080x1350) and link-preview images (1200x630) at build time.
// No photos go on cards: that keeps photo rights simple.
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { WORDMARK, HMARK } from '../data/marks';

const FONT_DIR = path.join(process.cwd(), 'src/cards/fonts');
const font = (file: string) => fs.readFileSync(path.join(FONT_DIR, file));
const FONTS = [
  { name: 'Oswald', data: font('Oswald-SemiBold.ttf'), weight: 600 as const, style: 'normal' as const },
  { name: 'Oswald', data: font('Oswald-Regular.ttf'), weight: 400 as const, style: 'normal' as const },
  { name: 'Anton', data: font('Anton-Regular.ttf'), weight: 400 as const, style: 'normal' as const },
];

const INK = '#0b0b0b';
const WHITE = '#ffffff';
const RED = '#e4312b';
const MUTE = '#a3a3a3';

const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const wordmarkSvg = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORDMARK.viewBox}"><path fill="${WHITE}" d="${WORDMARK.house}"/><g fill="${WHITE}">${WORDMARK.irons.replaceAll('currentColor', WHITE)}</g><path fill="${RED}" d="${WORDMARK.watch}"/></svg>`;
const hmarkSvg = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${HMARK.viewBox}"><path fill="${WHITE}" d="${HMARK.h}"/><rect x="${HMARK.bar.x}" y="${HMARK.bar.y}" width="${HMARK.bar.w}" height="${HMARK.bar.h}" fill="${RED}"/></svg>`;
const stripeSvg = (w: number, h: number) => {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${INK}"/>`;
  for (let x = -h; x < w + h; x += h * 2) s += `<polygon points="${x},${h} ${x + h},0 ${x + 2 * h},0 ${x + h},${h}" fill="${RED}"/>`;
  return s + '</svg>';
};
const [, , vbW, vbH] = WORDMARK.viewBox.split(' ').map(Number);
const WM_RATIO = vbW / vbH;

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): El => ({
  type,
  props: { style, children, ...extra },
});
const img = (src: string, width: number, height: number) => h('img', {}, undefined, { src, width, height });

// Bigger type for shorter headlines.
function headSize(title: string, sizes: [number, number][]) {
  for (const [max, size] of sizes) if (title.length <= max) return size;
  return sizes[sizes.length - 1][1];
}

async function toPng(node: El, width: number, height: number) {
  const svg = await satori(node as never, { width, height, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

export type CardInput = { title: string; beat?: string; date?: string; line?: string };

export async function storyCard({ title, beat, date, line }: CardInput) {
  const W = 1080, H = 1350, pad = 80;
  const size = headSize(title, [[40, 132], [60, 118], [80, 104], [110, 90], [999, 76]]);
  const wmW = 470;
  return toPng(
    h('div', { width: W, height: H, display: 'flex', flexDirection: 'column', background: INK, color: WHITE, fontFamily: 'Oswald' }, [
      img(uri(stripeSvg(W, 34)), W, 34),
      h('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: `${pad}px ${pad}px 0` }, [
        h('div', { display: 'flex', fontSize: 40, fontWeight: 600, letterSpacing: 6, color: RED, textTransform: 'uppercase' }, beat ?? 'Housewatch'),
        h('div', { display: 'flex', marginTop: 34, fontSize: size, fontWeight: 600, lineHeight: 1.04, letterSpacing: -0.5 }, title),
        line
          ? h('div', { display: 'flex', marginTop: 40, paddingTop: 30, borderTop: `3px solid ${RED}`, fontSize: 42, fontWeight: 400, lineHeight: 1.3, color: '#d8d8d8' }, line)
          : h('div', { display: 'flex' }, ''),
      ]),
      h('div', { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: `0 ${pad}px ${pad - 10}px` }, [
        h('div', { display: 'flex', flexDirection: 'column' }, [
          img(uri(wordmarkSvg()), wmW, Math.round(wmW / WM_RATIO)),
          h('div', { display: 'flex', marginTop: 18, fontSize: 28, letterSpacing: 5, color: MUTE, textTransform: 'uppercase' }, date ? `housewatch.news  ·  ${date}` : 'housewatch.news'),
        ]),
        img(uri(hmarkSvg()), 96, 120),
      ]),
    ]),
    W,
    H
  );
}

export async function previewImage({ title, beat }: CardInput) {
  const W = 1200, H = 630, pad = 64;
  const size = headSize(title, [[40, 88], [60, 80], [80, 70], [110, 58], [999, 50]]);
  const wmW = 360;
  return toPng(
    h('div', { width: W, height: H, display: 'flex', flexDirection: 'column', background: INK, color: WHITE, fontFamily: 'Oswald' }, [
      img(uri(stripeSvg(W, 22)), W, 22),
      h('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: `${pad - 10}px ${pad}px 0` }, [
        h('div', { display: 'flex', fontSize: 30, fontWeight: 600, letterSpacing: 5, color: RED, textTransform: 'uppercase' }, beat ?? 'News for the rank and file'),
        h('div', { display: 'flex', marginTop: 20, fontSize: size, fontWeight: 600, lineHeight: 1.05 }, title),
      ]),
      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${pad}px ${pad - 16}px` }, [
        img(uri(wordmarkSvg()), wmW, Math.round(wmW / WM_RATIO)),
        img(uri(hmarkSvg()), 64, 80),
      ]),
    ]),
    W,
    H
  );
}

// Home screen and browser icons: the gothic H with its red bar on black, cropped tight
// so it reads at favicon size. fill is how much of the icon's height the mark takes up;
// maskable icons use less so Android's round or squircle crop never clips it.
const ICON_BOX = { x: 126, y: 63, w: 260, h: 377 }; // the H plus a bolder bar
export function iconSvg(size: number, fill: number, radius = 0) {
  const k = (size * fill) / ICON_BOX.h;
  const tx = (size - ICON_BOX.w * k) / 2 - ICON_BOX.x * k;
  const ty = (size - ICON_BOX.h * k) / 2 - ICON_BOX.y * k;
  const b = HMARK.bar;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" rx="${radius}" fill="${INK}"/>` +
    `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})">` +
    `<path fill="${WHITE}" d="${HMARK.h}"/><rect x="${b.x}" y="406" width="${b.w}" height="34" fill="${RED}"/></g></svg>`;
}
export async function appIcon(size: number, fill = 0.78) {
  return new Resvg(iconSvg(size, fill), { fitTo: { mode: 'width', value: size } }).render().asPng();
}
