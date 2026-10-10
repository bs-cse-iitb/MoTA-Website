// Link checker for the built site (GIGW 3.0: no broken links, no "under
// construction" pages). Run after `npm run build`.
//
//   node scripts/check-links.mjs             internal links, images and anchors
//   node scripts/check-links.mjs --external  also probe every external link (curl)
//
// Writes docs/Evidence/link-report.csv and broken-links-report.csv (legacy documents
// that are missing on tribal.gov.in and were therefore left out of the new site).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { EVIDENCE } from './paths.mjs';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const external = process.argv.includes('--external');

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
async function exists(urlPath) {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  const candidates = [path.join(dist, clean), path.join(dist, clean, 'index.html')];
  for (const c of candidates) {
    try { const st = await fs.stat(c); if (st.isFile()) return true; } catch { /* next */ }
  }
  return false;
}

// Search-engine ownership files (public/google*.html, kept at their old addresses) are not pages.
const files = (await walk(dist)).filter((f) => !/^google[0-9a-f]+\.html$/.test(path.basename(f)));
const internal = new Map(); // href -> [pages]
const ext = new Map();
const anchors = [];
let pagesWithoutH1 = [];

for (const f of files) {
  const html = await fs.readFile(f, 'utf8');
  const page = '/' + path.relative(dist, f).replace(/index\.html$/, '').replace(/\\/g, '/');
  if (!/<h1[\s>]/.test(html)) pagesWithoutH1.push(page);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/<(a|img|link|script|source)\b[^>]*?\s(href|src|srcset)="([^"]+)"/g)) {
    const attr = m[2];
    const vals = attr === 'srcset' ? m[3].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[3]];
    for (let v of vals) {
      v = decode(v);
      if (!v || v.startsWith('data:') || v.startsWith('mailto:') || v.startsWith('tel:') || v.startsWith('javascript:')) continue;
      if (v.startsWith('#')) {
        if (v.length > 1 && !ids.has(v.slice(1)) && v !== '#top') anchors.push([page, v]);
        continue;
      }
      if (v.startsWith('/')) {
        if (!internal.has(v)) internal.set(v, new Set());
        internal.get(v).add(page);
      } else if (/^https?:/.test(v)) {
        if (!ext.has(v)) ext.set(v, new Set());
        ext.get(v).add(page);
      }
    }
  }
}

const brokenInternal = [];
for (const [href, pages] of internal) {
  if (href.startsWith('/pagefind/')) continue; // generated after astro build
  if (!(await exists(href))) brokenInternal.push([href, [...pages].slice(0, 3).join(' ')]);
}

console.log(`Pages scanned:            ${files.length}`);
console.log(`Unique internal links:    ${internal.size}`);
console.log(`Unique external links:    ${ext.size}`);
console.log(`Broken internal links:    ${brokenInternal.length}`);
brokenInternal.slice(0, 50).forEach(([h, p]) => console.log(`   ✗ ${h}   (on ${p})`));
console.log(`Missing in-page anchors:  ${anchors.length}`);
anchors.slice(0, 20).forEach(([p, a]) => console.log(`   ✗ ${a} on ${p}`));
console.log(`Pages without an <h1>:    ${pagesWithoutH1.length}`);
pagesWithoutH1.slice(0, 10).forEach((p) => console.log(`   ✗ ${p}`));

// Redirect loops: a link to an old page on tribal.gov.in that dist/web.config also
// redirects would send the visitor straight back (see src/data/legacy-urls.json).
const webConfig = await fs.readFile(path.join(dist, 'web.config'), 'utf8');
const unxml = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const redirectRules = [...webConfig.matchAll(/<rule name="legacy-[^"]*"[^>]*>\s*<match url="([^"]+)" ignoreCase="true" \/>/g)]
  .map((m) => new RegExp(unxml(m[1]), 'i'));
const loops = [];
for (const [href, pages] of ext) {
  const m = href.match(/^https?:\/\/(?:www\.)?tribal\.(?:gov|nic)\.in\/([^?#]*)/i);
  if (m && redirectRules.some((re) => re.test(decodeURIComponent(m[1])))) loops.push([href, [...pages].slice(0, 3).join(' ')]);
}
console.log(`Links to redirected old pages (loops): ${loops.length}`);
loops.slice(0, 20).forEach(([h, p]) => console.log(`   ✗ ${h}   (on ${p})`));

// External probe (optional)
const rows = [['url', 'status', 'ok', 'used_on']];
if (external) {
  const cacheFile = path.join(root, 'src/data/generated/link-meta.json');
  let cache = {};
  try { cache = JSON.parse(await fs.readFile(cacheFile, 'utf8')); } catch { /* none */ }
  const urls = [...ext.keys()];
  let i = 0;
  async function probe(u) {
    if (cache[u]) return cache[u];
    try {
      const { stdout } = await run('curl', ['-s', '-o', '/dev/null', '-I', '-L', '-m', '20', '-A', 'Mozilla/5.0 (MoTA link audit)', '-w', '%{http_code}', u]);
      let status = Number(stdout.trim());
      if ([0, 403, 405].includes(status)) {
        const g = await run('curl', ['-s', '-o', '/dev/null', '-L', '-m', '20', '-r', '0-0', '-A', 'Mozilla/5.0 (MoTA link audit)', '-w', '%{http_code}', u]);
        status = Number(g.stdout.trim());
      }
      return { status, ok: status > 0 && status < 400 };
    } catch { return { status: 0, ok: false }; }
  }
  const results = new Map();
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (i < urls.length) { const u = urls[i++]; results.set(u, await probe(u)); }
  }));
  let bad = 0;
  for (const [u, r] of results) {
    rows.push([u, r.status, r.ok ? 'yes' : 'no', [...ext.get(u)].slice(0, 2).join(' ')]);
    if (!r.ok) bad++;
  }
  console.log(`External links not reachable from this network: ${bad} of ${results.size} (see docs/Evidence/link-report.csv)`);
}

// Legacy documents excluded because they are missing on the live server
const metaFile = path.join(root, 'src/data/generated/link-meta.json');
const pagesFile = path.join(root, 'src/data/generated/legacy-pages.json');
try {
  const meta = JSON.parse(await fs.readFile(metaFile, 'utf8'));
  const legacy = JSON.parse(await fs.readFile(pagesFile, 'utf8'));
  const where = {};
  for (const [k, v] of Object.entries(legacy)) for (const s of v.sections) for (const l of s.links) (where[l.url] ??= { page: v.source, title: l.title, section: s.heading });
  const broken = [['legacy_page', 'section', 'title', 'url', 'http_status']];
  for (const [u, m] of Object.entries(meta)) {
    const own = /^https?:\/\/(www\.)?tribal\.(gov|nic)\.in\//i.test(u);
    if (own && !m.ok && (m.status === 404 || m.status === 410 || m.status === 200) && where[u]) broken.push([where[u].page, where[u].section, where[u].title, u, m.status]);
  }
  await fs.mkdir(EVIDENCE, { recursive: true });
  const csv = (r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
  await fs.writeFile(path.join(EVIDENCE, 'broken-links-report.csv'), broken.map(csv).join('\n'));
  if (external) await fs.writeFile(path.join(EVIDENCE, 'link-report.csv'), rows.map(csv).join('\n'));
  console.log(`Legacy documents missing on tribal.gov.in (left out, listed in docs/Evidence/broken-links-report.csv): ${broken.length - 1}`);
} catch (e) {
  console.log('Legacy link report skipped:', e.message);
}

process.exitCode = brokenInternal.length || anchors.length || loops.length ? 1 : 0;
