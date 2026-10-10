// Copy of the built site (dist/) for the GitHub Pages preview, which is served from a
// sub-folder (https://bs-cse-iitb.github.io/MoTA-Website/). The website itself is built for
// the root of tribal.gov.in, so this copy:
// - adds the folder to every root-relative address in the HTML (href, src, srcset, action,
//   poster, data-*) and the CSS (url(...));
// - sends links to documents that only the real server holds (the old site's document
//   folders) to the same address on https://tribal.gov.in;
// - sets data-base on <html>; the kit scripts add it to the addresses they build (Pagefind,
//   search links);
// - adds <meta name="robots" content="noindex">, so the preview does not compete with the
//   official site in search results;
// - leaves out web.config, which only IIS reads.
// It then checks that every internal address in the copy points to a file in it, and stops
// with an error if one does not. Run after `npm run build`:
//
//   node scripts/build-pages.mjs --base /MoTA-Website [--out dist-pages]
//
// With an empty --base (a custom domain), addresses are left as they are.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] ?? fallback : fallback; };
const base = arg('--base', '').replace(/\/+$/, '');
if (base && !/^(\/[A-Za-z0-9._-]+)+$/.test(base)) throw new Error(`--base must look like /MoTA-Website, not "${base}"`);
const dist = path.join(root, 'dist');
const out = path.resolve(root, arg('--out', 'dist-pages'));
const LIVE = 'https://tribal.gov.in';
const DOC = /\.(pdf|docx?|xlsx?|pptx?|odt|ods|csv|zip|rar|jpe?g|png|gif|mp4|mp3)$/i;

await fs.access(path.join(dist, 'index.html')).catch(() => { throw new Error('dist/index.html missing: run npm run build first'); });
await fs.rm(out, { recursive: true, force: true });
await fs.cp(dist, out, { recursive: true });
await fs.rm(path.join(out, 'web.config'), { force: true });

async function walk(dir) {
  const found = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) found.push(...(await walk(p))); else found.push(p);
  }
  return found;
}
const files = await walk(out);
const have = new Set(files.map((f) => '/' + path.relative(out, f).split(path.sep).join('/')));
/** The file a root-relative address serves, or null. */
const target = (u) => {
  const p = decodeURI(u.split(/[?#]/)[0]);
  if (p.endsWith('/')) return have.has(`${p}index.html`) ? `${p}index.html` : null;
  return have.has(p) ? p : have.has(`${p}/index.html`) ? `${p}/index.html` : null;
};
const sentLive = new Set();
/** A root-relative address as the preview must write it. */
function rebase(u) {
  if (!u.startsWith('/') || u.startsWith('//')) return u;
  if (base && (u === base || u.startsWith(`${base}/`))) return u;
  if (DOC.test(u.split(/[?#]/)[0]) && !target(u)) { sentLive.add(u); return LIVE + u; }
  return base + u;
}

const ATTR = /(\s(?:xlink:)?(?:href|src|action|poster|formaction|data-[a-z0-9-]+))="([^"]*)"/gi;
const SRCSET = /(\ssrcset)="([^"]*)"/gi;
let pages = 0, sheets = 0;
for (const f of files) {
  if (f.endsWith('.html')) {
    let s = await fs.readFile(f, 'utf8');
    s = s.replace(ATTR, (m, a, v) => `${a}="${rebase(v)}"`);
    s = s.replace(SRCSET, (m, a, v) => `${a}="${v.split(',').map((c) => c.replace(/^(\s*)(\S+)/, (x, sp, u) => sp + rebase(u))).join(',')}"`);
    if (base) s = s.replace(/<html\b([^>]*)>/i, `<html$1 data-base="${base}">`);
    if (!/<meta\s+name="robots"/i.test(s)) s = s.replace(/<head\b[^>]*>/i, (h) => `${h}<meta name="robots" content="noindex">`);
    await fs.writeFile(f, s);
    pages++;
  } else if (f.endsWith('.css')) {
    const s = await fs.readFile(f, 'utf8');
    await fs.writeFile(f, s.replace(/url\((['"]?)(\/(?!\/)[^)'"]*)\1\)/g, (m, q, u) => `url(${q}${rebase(u)}${q})`));
    sheets++;
  }
}

// Check: every internal address must point to a file in the copy.
const missing = new Map(), stray = new Map();
let checked = 0;
const count = (map, k) => map.set(k, (map.get(k) ?? 0) + 1);
for (const f of files.filter((x) => x.endsWith('.html'))) {
  const s = await fs.readFile(f, 'utf8');
  for (const m of s.matchAll(/\s(?:xlink:)?(?:href|src|action|poster)="([^"]*)"|\ssrcset="([^"]*)"/gi)) {
    const values = m[1] !== undefined ? [m[1]] : m[2].split(',').map((c) => c.trim().split(/\s+/)[0]);
    for (const v of values) {
      if (!v.startsWith('/') || v.startsWith('//')) continue;
      if (base && !v.startsWith(`${base}/`)) { count(stray, v); continue; }
      checked++;
      if (!target(v.slice(base.length))) count(missing, v);
    }
  }
}
for (const f of files.filter((x) => x.endsWith('.css'))) {
  for (const m of (await fs.readFile(f, 'utf8')).matchAll(/url\((['"]?)(\/(?!\/)[^)'"]*)\1\)/g)) {
    if (base && !m[2].startsWith(`${base}/`)) count(stray, m[2]); else { checked++; if (!target(m[2].slice(base.length))) count(missing, m[2]); }
  }
}

const top = (map) => [...map].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([u, n]) => `  ${n} × ${u}`).join('\n');
console.log(`GitHub Pages copy in ${path.relative(root, out)}/: ${pages} pages and ${sheets} style sheets for base "${base || '/'}"; ${sentLive.size} document links sent to ${LIVE}; ${checked} internal addresses checked`);
if (stray.size) console.log(`Root-relative addresses left without the base:\n${top(stray)}`);
if (missing.size) console.log(`Internal addresses with no file in the copy:\n${top(missing)}`);
if (stray.size || missing.size) process.exit(1);
console.log('All internal addresses point to files in the copy.');
