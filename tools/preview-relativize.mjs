// Turns a PREVIEW_FILES=1 build into a self-contained folder with relative links,
// for sharing a preview outside Netlify. Not used by the real site.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.argv[2]);
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(root);
function target(p) {
  const [pathPart, rest = ''] = p.split(/(?=[?#])/);
  let t = pathPart;
  if (t === '/') t = '/index.html';
  else if (t.endsWith('/')) t = t.slice(0, -1) + '.html';
  return { t: t.slice(1), rest: p.slice(pathPart.length) };
}
const banner = '<div style="background:#ffd34d;color:#111;font:600 13px/1.4 Oswald,Arial,sans-serif;letter-spacing:.04em;padding:8px 16px;text-align:center">PREVIEW. The Daily signup and contact form start working once the site is on Netlify.</div>';
for (const f of files) {
  const dir = path.dirname(f);
  if (f.endsWith('.html')) {
    let s = fs.readFileSync(f, 'utf8');
    s = s.replace(/(href|src|data-card)="(\/(?!\/)[^"]*)"/g, (m, attr, p) => {
      const { t, rest } = target(p);
      let rel = path.relative(dir, path.join(root, t)) || path.basename(t);
      return `${attr}="${rel}${rest}"`;
    });
    s = s.replace('<body>', '<body>' + banner);
    fs.writeFileSync(f, s);
  } else if (f.endsWith('.css')) {
    let s = fs.readFileSync(f, 'utf8');
    s = s.replace(/url\((\/(?!\/)[^)]+)\)/g, (m, p) => `url(${path.relative(dir, path.join(root, p.slice(1)))})`);
    fs.writeFileSync(f, s);
  }
}
console.log('relativized', files.length, 'files');
