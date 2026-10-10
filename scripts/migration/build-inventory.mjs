// Migration inventory: every old tribal.gov.in page, document, media file, query-string
// page and outside link that could be found, where it goes on the new site, and how far
// that has been verified. Run after `npm run build`:
//
//   node scripts/migration/build-inventory.mjs [--crawl <crawl.json>] [--out <folder>]
//
// Defaults: crawl docs/Migration/live-crawl.json, output docs/Migration/
// (the docs/ folder of this repository; MOTA_DOCS_DIR changes it, see scripts/paths.mjs).
//
// Sources, reconciled with each other (a crawl alone does not prove completeness):
//   1. legacy source  files under LEGACY_DIR (default ../MoTA_Website_Old/App) and the
//                     links written in its pages, master pages and user controls
//   2. live crawl     output of scripts/migration/crawl-live.mjs (database lists, query pages)
//   3. new build      links in dist/
//   4. decisions      src/data/legacy-urls.json; probe results in src/data/generated/link-meta.json
// Not reconciled yet: the database (waiting for the NIC content export). Items that exist
// only in the database and were not reached by the crawl cannot appear here.
//
// Writes inventory.csv (one row per item) and summary.json (counts, inputs, limits).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCS } from '../paths.mjs';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEGACY = process.env.LEGACY_DIR ? path.resolve(process.env.LEGACY_DIR) : path.resolve(ROOT, '..', 'MoTA_Website_Old', 'App');
const DIST = path.join(ROOT, 'dist');
const MIGRATION = path.join(DOCS, 'Migration');
const CRAWL = arg('--crawl', path.join(MIGRATION, 'live-crawl.json'));
const OUT = path.resolve(arg('--out', MIGRATION));
const ORIGIN = 'https://tribal.gov.in';

const readJson = async (p, dflt) => { try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return dflt; } };
const map = await readJson(path.join(ROOT, 'src/data/legacy-urls.json'));
const probes = await readJson(path.join(ROOT, 'src/data/generated/link-meta.json'), {});
const crawl = CRAWL ? await readJson(path.resolve(CRAWL)) : null;
if (!map) throw new Error('src/data/legacy-urls.json not found');
try { await fs.access(path.join(DIST, 'index.html')); } catch { throw new Error('dist/ not found: run npm run build first'); }

// ---------------------------------------------------------------- classification
// Folders that were never meant to be public, or hold server code: not migrated.
const INTERNAL_DIRS = /^(auth|app_code[^/]*|app_data|app_globalresources|bin|aspnet_client|fckeditor|usercontrol|script_later|old master|chat_popup)(\/|$)/i;
// Folders of the old design (themes, scripts, fonts, players): replaced by the new design.
const DESIGN_DIRS = /^(app_themes|css[^/]*|js[^/]*|javascript[^/]*|jsforhindi|jwplayer[^/]*|fonts|theme|images_cms|assets)(\/|$)/i;
const EXT = {
  page: /\.(aspx|html?)$/i,
  document: /\.(pdf|docx?|xlsx?|pptx?|odt|ods|rtf|txt|csv|zip|rar|7z)$/i,
  media: /\.(jpe?g|png|gif|svg|webp|bmp|tiff?|mp3|mp4|ogg|mpeg|mpg|wmv|avi|flv|swf|wav)$/i,
  design: /\.(css|js|map|woff2?|ttf|eot|otf|cur|htc|less|scss)$/i,
};
// Site pages live at the top level and in these folders. HTML elsewhere (e.g. the UNDP
// training module in writereaddata/) is uploaded content, kept like a document.
const PAGE_DIRS = /^((resourceshindi|schemes|resources|old pages)\/)?[^/]+$/i;
function classify(rel) {
  if (/(^|\/)(thumbs\.db|\.ds_store|desktop\.ini)$/i.test(rel)) return 'system-file';
  if (INTERNAL_DIRS.test(rel)) return 'internal';
  if (/\.aspx$/i.test(rel)) return 'page';
  if (EXT.page.test(rel)) return PAGE_DIRS.test(rel) ? 'page' : 'document';
  if (DESIGN_DIRS.test(rel) || EXT.design.test(rel)) return 'design-asset';
  if (EXT.document.test(rel)) return 'document';
  if (EXT.media.test(rel)) return 'media';
  return 'server-file';
}
const isHindi = (rel) => /^resourceshindi\//i.test(rel);
// Old pages whose lists come from the database (sanction orders, archives, tenders,
// minutes, photo albums, results) and query-string pages: their items arrive with the export.
const DB_LISTS = /(sanction|senction|pfms_|whatsnew|tender|photo|minutes|results\.aspx|highlight)|\?/i;

// IIS treats paths case-insensitively and tribal.nic.in is the same site.
const OWN = /^(www\.)?tribal\.(gov|nic)\.in$/i;
function normalise(raw, base) {
  let u;
  try { u = new URL(raw.trim().replace(/\\/g, '/').replace(/&amp;/g, '&'), base); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  u.hash = '';
  if (!OWN.test(u.hostname)) return { external: true, url: u.href };
  let p;
  try { p = decodeURIComponent(u.pathname); } catch { p = u.pathname; }
  p = p.replace(/^\/+/, '').replace(/\/{2,}/g, '/');
  return { external: false, rel: p, key: p.toLowerCase(), query: u.search };
}

// ---------------------------------------------------------------- 1. legacy source
const rows = new Map(); // key -> row
const row = (key, init) => {
  if (!rows.has(key)) rows.set(key, { key, type: '', legacy_url: '', language: '', title: '', found_in: new Set(), linked_from: new Set(), linked_by_href: false, in_source: 'no', bytes: '', live_status: '', new_links: new Set(), action: '', new_location: '', status: '', notes: new Set(), ...init });
  return rows.get(key);
};
const files = await fs.readdir(LEGACY, { recursive: true, withFileTypes: true });
const sourcePages = [];
for (const d of files) {
  if (!d.isFile()) continue;
  const abs = path.join(d.parentPath ?? d.path, d.name);
  const rel = path.relative(LEGACY, abs).split(path.sep).join('/');
  const kind = classify(rel);
  const r = row(rel.toLowerCase(), {});
  r.type = kind;
  r.legacy_url = `${ORIGIN}/${rel.split('/').map(encodeURIComponent).join('/')}`;
  r.language = isHindi(rel) ? 'hi' : '';
  r.in_source = 'yes';
  r.found_in.add('legacy source');
  if (kind === 'document' || kind === 'media') r.bytes = (await fs.stat(abs)).size;
  // Public master pages and user controls hold the menus; the admin panel (AUTH/) and the
  // unused "old master/" folder are not public, so their links are not counted.
  if (kind === 'page' || (/\.(master|ascx)$/i.test(rel) && !/^(auth|old master)\//i.test(rel))) sourcePages.push({ abs, rel });
}
// Links written in pages, master pages (menus) and user controls.
for (const { abs, rel } of sourcePages) {
  const html = await fs.readFile(abs, 'utf8').catch(() => '');
  const pageUrl = `${ORIGIN}/${rel}`;
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? html.match(/Title\s*=\s*"([^"]*)"/)?.[1];
  if (title && rows.has(rel.toLowerCase())) rows.get(rel.toLowerCase()).title = title.replace(/\s+/g, ' ').trim();
  for (const m of html.matchAll(/(href|src|NavigateUrl|ImageUrl)\s*=\s*["']([^"'<>]+)["']/gi)) {
    const v = m[2];
    const asLink = /^(href|NavigateUrl)$/i.test(m[1]);
    if (/^(#|javascript:|mailto:|tel:|<%|~\/?$)/i.test(v) || v.includes('<%')) continue;
    const n = normalise(v.replace(/^~\//, '/'), pageUrl);
    if (!n) continue;
    if (n.external) { const r = row(`ext:${n.url}`, { type: 'external-link', legacy_url: n.url }); r.found_in.add('legacy source'); r.linked_from.add(rel); continue; }
    if (!n.rel) continue;
    const r = row(n.key, {});
    if (!r.legacy_url) r.legacy_url = `${ORIGIN}/${n.rel.split('/').map(encodeURIComponent).join('/')}`;
    if (!r.type) r.type = classify(n.rel);
    r.linked_from.add(rel);
    if (asLink) r.linked_by_href = true;
    if (n.query && classify(n.rel) === 'page') {
      const q = row(`${n.key}${n.query.toLowerCase()}`, { type: 'query-page', legacy_url: `${ORIGIN}/${n.rel}${n.query}` });
      q.found_in.add('legacy source'); q.linked_from.add(rel);
    }
  }
}

// ---------------------------------------------------------------- 2. live crawl
if (crawl) {
  for (const p of crawl.pages) {
    const n = normalise(p.url, ORIGIN);
    if (!n || n.external) continue;
    const key = n.query ? `${n.key}${n.query.toLowerCase()}` : n.key;
    const r = row(key, { type: n.query ? 'query-page' : classify(n.rel), legacy_url: p.url });
    r.found_in.add('live crawl');
    r.live_status = String(p.status || p.error || '');
    if (p.title && !r.title) r.title = p.title;
    if (p.postbacks) r.notes.add(`${p.postbacks} postback-only links not followed`);
    const from = n.rel + (n.query ?? '');
    for (const link of [...p.pages, ...p.documents]) {
      const t = normalise(link, p.finalUrl);
      if (!t || t.external) continue;
      const tk = t.query && classify(t.rel) === 'page' ? `${t.key}${t.query.toLowerCase()}` : t.key;
      const tr = row(tk, { type: t.query && classify(t.rel) === 'page' ? 'query-page' : classify(t.rel), legacy_url: `${ORIGIN}/${t.rel}${t.query && classify(t.rel) === 'page' ? t.query : ''}` });
      tr.found_in.add('live crawl'); tr.linked_from.add(from); tr.linked_by_href = true;
    }
    for (const link of p.external) { const r2 = row(`ext:${link}`, { type: 'external-link', legacy_url: link }); r2.found_in.add('live crawl'); r2.linked_from.add(from); }
  }
}

// ---------------------------------------------------------------- 3. new build
async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p))); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const newPagesFor = new Map(); // key -> Set(new page)
for (const f of await walk(DIST)) {
  const page = '/' + path.relative(DIST, f).split(path.sep).join('/').replace(/index\.html$/, '');
  const html = await fs.readFile(f, 'utf8');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const n = normalise(m[1].replace(/&amp;/g, '&'), ORIGIN + page);
    if (!n) continue;
    const key = n.external ? `ext:${n.url}` : (n.query && classify(n.rel) === 'page' ? `${n.key}${n.query.toLowerCase()}` : n.key);
    if (!newPagesFor.has(key)) newPagesFor.set(key, new Set());
    newPagesFor.get(key).add(page);
  }
}

// ---------------------------------------------------------------- 4. decisions and status
const lowerMap = (o) => new Map(Object.entries(o).map(([k, v]) => [k.toLowerCase(), v]));
const redirects = lowerMap(map.redirects);
const held = lowerMap(map.notRedirectedYet);
const retired = lowerMap(map.retired);
const decide = lowerMap(map.decisionNeeded ?? {});
const probe = (url) => probes[url] ?? probes[url.replace('https://tribal.gov.in', 'http://tribal.gov.in')] ?? probes[url.replace('https://', 'https://www.')];

for (const r of rows.values()) {
  const pagesInNew = newPagesFor.get(r.key) ?? new Set();
  r.new_links = pagesInNew;
  const linkedNew = pagesInNew.size > 0;
  const p = r.type !== 'external-link' ? probe(r.legacy_url) : probe(r.legacy_url);
  if (p && !r.live_status) r.live_status = String(p.status);
  switch (r.type) {
    case 'page': {
      if (decide.has(r.key)) { r.action = 'none yet'; r.status = 'DECISION NEEDED (Ministry)'; r.notes.add(decide.get(r.key)); }
      else if (held.has(r.key)) { r.action = 'not redirected yet'; r.new_location = redirects.get(r.key) ?? ''; r.status = 'blocked: content not migrated'; r.notes.add(held.get(r.key)); }
      else if (redirects.has(r.key)) { r.action = 'redirect 301'; r.new_location = redirects.get(r.key); r.status = 'redirect verified on UAT (tests/redirects.test.mjs); staging pending'; }
      else if (retired.has(r.key)) { r.action = 'retire (404)'; r.status = 'decided'; r.notes.add(retired.get(r.key)); }
      else if (r.in_source === 'no' && r.live_status === '200') { r.action = 'none'; r.status = 'UNMAPPED: live page missing from the legacy source copy'; }
      else if (r.in_source === 'no') { r.action = 'none'; r.status = `dead link in old site (not in legacy source${r.live_status ? `; live ${r.live_status}` : ''})`; }
      else { r.action = 'none'; r.status = 'UNMAPPED'; }
      break;
    }
    case 'query-page': {
      const base = r.key.split('?')[0];
      if (retired.has(base)) { r.action = 'retire (404)'; r.status = 'decided'; r.notes.add(retired.get(base)); break; }
      r.action = held.has(base) ? 'not redirected yet' : redirects.has(base) ? 'redirect 301 (query dropped)' : 'none';
      r.new_location = redirects.get(base) ?? '';
      r.status = /photos|photoalbum|senctionreport|sanction|pfms|tender|whatsnew|minutes/i.test(base)
        ? 'pending: item-level content needs the NIC export' : (r.action === 'none' ? 'UNMAPPED' : 'page-level redirect only');
      break;
    }
    case 'document':
    case 'media': {
      r.action = 'keep at same address (static file)';
      r.new_location = 'same URL';
      if (r.in_source === 'no') r.status = r.live_status === '200' ? 'MISSING FROM SOURCE COPY (live 200)' : `missing at source${r.live_status ? ` (live ${r.live_status})` : ''}`;
      else if (linkedNew) r.status = 'linked in new site; file present';
      else if (r.linked_from.size && [...r.linked_from].every((f) => DB_LISTS.test(f))) r.status = 'pending: in a database list (needs the NIC export)';
      else if (r.linked_from.size && r.type === 'media' && /\.(jpe?g|png|gif|svg|webp|bmp)$/i.test(r.key)) r.status = 'REVIEW: picture on old pages, not shown on new pages (file kept)';
      else if (r.linked_from.size && (r.type === 'document' || r.linked_by_href)) r.status = 'CONTENT GAP: linked from old pages, not from new site';
      else if (r.linked_from.size) r.status = 'picture on old pages; new site uses its own copies (not matched by URL)';
      else r.status = 'not linked anywhere found (kept for deep links)';
      break;
    }
    case 'design-asset': r.action = 'retire (old design)'; r.status = 'replaced by the new design'; break;
    case 'internal': r.action = 'not published'; r.status = 'internal or server code (back-office only)'; break;
    case 'server-file': r.action = 'not published'; r.status = 'server file'; break;
    case 'system-file': r.action = 'not published'; r.status = 'system file'; break;
    case 'external-link': {
      // Script and font libraries loaded by the old design are not content.
      if (/^https?:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com|code\.jquery\.com|ajax\.googleapis\.com|maxcdn\.bootstrapcdn\.com|stackpath\.bootstrapcdn\.com)\//i.test(r.legacy_url)) {
        r.type = 'design-asset'; r.action = 'retire (old design)'; r.status = 'replaced by the new design (self-hosted)';
        break;
      }
      r.action = linkedNew ? 'linked from new site' : 'not linked from new site';
      r.status = linkedNew ? 'kept' : 'REVIEW: outside link dropped or replaced';
      break;
    }
    default: r.status = 'unclassified';
  }
}

// Root-level Google verification files are kept in public/.
for (const r of rows.values()) if (/^google[0-9a-f]+\.html$/.test(r.key)) { r.type = 'verification-file'; r.action = 'keep (public/)'; r.new_location = 'same URL'; r.status = 'present in new build'; }

// ---------------------------------------------------------------- output
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const header = ['type', 'legacy_url', 'language', 'title', 'found_in', 'in_legacy_source', 'live_status', 'bytes', 'linked_from_old_pages', 'action', 'new_location', 'linked_from_new_pages', 'status', 'notes'];
const order = ['page', 'query-page', 'verification-file', 'document', 'media', 'external-link', 'design-asset', 'internal', 'server-file', 'system-file'];
const list = [...rows.values()].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || a.key.localeCompare(b.key));
const lines = [header.join(',')];
for (const r of list) {
  const lf = [...r.linked_from];
  const nl = [...r.new_links];
  lines.push([r.type, r.legacy_url, r.language, r.title, [...r.found_in].join('; '), r.in_source, r.live_status, r.bytes,
    lf.length > 3 ? `${lf.slice(0, 3).join('; ')} (+${lf.length - 3})` : lf.join('; '), r.action, r.new_location,
    nl.length > 3 ? `${nl.slice(0, 3).join('; ')} (+${nl.length - 3})` : nl.join('; '), r.status, [...r.notes].join(' | ')].map(csvCell).join(','));
}
await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(path.join(OUT, 'inventory.csv'), lines.join('\n') + '\n');

const count = (pred) => list.filter(pred).length;
const byType = Object.fromEntries(order.map((t) => [t, count((r) => r.type === t)]));
const byStatus = {};
for (const r of list) { const k = `${r.type}: ${r.status}`; byStatus[k] = (byStatus[k] ?? 0) + 1; }
const keptBytes = list.filter((r) => (r.type === 'document' || r.type === 'media') && r.in_source === 'yes').reduce((s, r) => s + Number(r.bytes || 0), 0);
const summary = {
  generated: new Date().toISOString(),
  inputs: {
    legacySource: path.relative(ROOT, LEGACY),
    liveCrawl: crawl ? { file: path.basename(CRAWL), generated: crawl.generated, pagesFetched: crawl.pages.length, boundaries: crawl.boundaries, stoppedAt: crawl.stoppedAt } : 'not included',
    newBuild: 'dist/',
    decisions: 'src/data/legacy-urls.json',
    database: 'NOT RECONCILED: waiting for the NIC content export',
  },
  rows: list.length,
  byType,
  byStatus: Object.fromEntries(Object.entries(byStatus).sort()),
  documentsAndMediaToKeepGB: Number((keptBytes / 1e9).toFixed(2)),
  completeness: 'UNVERIFIED until the database export is reconciled; see docs/MIGRATION.md',
};
await fs.writeFile(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
console.log(JSON.stringify({ rows: summary.rows, byType, documentsAndMediaToKeepGB: summary.documentsAndMediaToKeepGB }, null, 1));
for (const [k, v] of Object.entries(summary.byStatus)) if (/UNMAPPED|GAP|MISSING|REVIEW|blocked|pending|missing/i.test(k)) console.log(`${String(v).padStart(6)}  ${k}`);
