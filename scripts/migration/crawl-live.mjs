// Bounded, polite crawl of the live tribal.gov.in pages for the migration inventory.
// It finds what the legacy source files cannot show: lists filled from the database,
// query-string pages (photos.aspx?cat_id=…, senctionReport.aspx?id=…) and items that
// open only through ASP.NET postbacks.
//
//   node scripts/migration/crawl-live.mjs [--out <file.json>] [--max 900] [--delay 1000]
//
// Default output: docs/Migration/live-crawl.json (see scripts/paths.mjs).
//
// Boundaries (recorded in the output): GET requests only, one at a time, at most one
// per --delay ms; tribal.gov.in pages only; documents are listed but not downloaded;
// forms and postbacks are never submitted; link depth 2 from the seed pages.
// Seeds: every public .aspx page in the legacy source (LEGACY_DIR) plus Home.aspx.
//
// TLS: in Oct 2026 tribal.gov.in did not send its intermediate certificate, so Node
// fails with UNABLE_TO_VERIFY_LEAF_SIGNATURE. Download the intermediate from the
// "CA Issuers" URL in the server certificate, convert it to PEM and pass it with
// NODE_EXTRA_CA_CERTS=<file.pem>. Never switch certificate checking off.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCS } from '../paths.mjs';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const OUT = arg('--out', path.join(DOCS, 'Migration', 'live-crawl.json'));
const MAX = Number(arg('--max', 900));
const DELAY = Number(arg('--delay', 1000));
const MAX_DEPTH = 2;
const ORIGIN = 'https://tribal.gov.in';
const UA = 'Mozilla/5.0 (compatible; MoTA-website-migration-inventory; contact: web team, Ministry of Tribal Affairs)';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const legacy = process.env.LEGACY_DIR ? path.resolve(process.env.LEGACY_DIR) : path.resolve(root, '..', 'MoTA_Website_Old', 'App');
// Folders whose pages the public could reach. AUTH/ (admin panel) and editor/system folders are excluded.
const PUBLIC_DIRS = ['.', 'ResourcesHindi', 'schemes', 'Resources', 'old pages'];
const DOC_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|csv|txt|jpe?g|png|gif|mp3|mp4|ogg|mpeg|wmv|swf)$/i;

const seeds = ['Home.aspx'];
for (const dir of PUBLIC_DIRS) {
  for (const f of await fs.readdir(path.join(legacy, dir)).catch(() => [])) {
    if (f.toLowerCase().endsWith('.aspx')) seeds.push(dir === '.' ? f : `${dir}/${f}`);
  }
}

// One key per page, ignoring case (IIS is case-insensitive) and the fragment.
const keyOf = (u) => { const x = new URL(u); return (x.pathname + x.search).toLowerCase(); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

const queue = seeds.map((s) => ({ url: new URL(s.split('/').map(encodeURIComponent).join('/'), `${ORIGIN}/`).href, depth: 0, from: 'legacy-source' }));
const seen = new Set(queue.map((q) => keyOf(q.url)));
const pages = [];
let stoppedAt = null;

while (queue.length) {
  if (pages.length >= MAX) { stoppedAt = `request limit ${MAX} reached; ${queue.length} pages left in the queue`; break; }
  const { url, depth, from } = queue.shift();
  const rec = { url, depth, from, status: 0, finalUrl: url, bytes: 0, pages: [], documents: [], embedded: [], external: [], postbacks: 0 };
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
    rec.status = res.status;
    rec.finalUrl = res.url;
    const type = res.headers.get('content-type') ?? '';
    const body = type.includes('text/html') ? await res.text() : '';
    rec.bytes = body.length;
    rec.title = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
    rec.postbacks = (body.match(/__doPostBack\(/g) ?? []).length;
    for (const m of body.matchAll(/(href|src)\s*=\s*["']([^"'#][^"']*)["']/gi)) {
      let target;
      try { target = new URL(decode(m[2].trim()), res.url); } catch { continue; }
      const embedded = m[1].toLowerCase() === 'src';
      if (!/^https?:$/.test(target.protocol)) continue;
      target.hash = '';
      const own = /^(www\.)?tribal\.(gov|nic)\.in$/i.test(target.hostname);
      if (!own) { rec.external.push(target.href); continue; }
      if (DOC_EXT.test(target.pathname)) { (embedded ? rec.embedded : rec.documents).push(target.href); continue; }
      if (!/\.aspx$/i.test(target.pathname)) continue;
      rec.pages.push(target.href);
      // Same host only; tribal.nic.in links are recorded but fetched as tribal.gov.in.
      const fetchUrl = `${ORIGIN}${target.pathname}${target.search}`;
      const k = keyOf(fetchUrl);
      if (depth < MAX_DEPTH && !seen.has(k) && !/\/auth\//i.test(target.pathname)) {
        seen.add(k);
        queue.push({ url: fetchUrl, depth: depth + 1, from: url });
      }
    }
    for (const list of ['pages', 'documents', 'embedded', 'external']) rec[list] = [...new Set(rec[list])];
  } catch (e) {
    rec.error = String(e.message ?? e);
  }
  pages.push(rec);
  if (pages.length % 25 === 0) console.log(`${pages.length} fetched, ${queue.length} queued`);
  await sleep(DELAY);
}

const out = {
  generated: new Date().toISOString(),
  origin: ORIGIN,
  boundaries: { method: 'GET only, sequential', delayMs: DELAY, maxRequests: MAX, maxDepth: MAX_DEPTH, seeds: seeds.length, excluded: 'AUTH/ (admin panel), forms, postbacks, document downloads' },
  stoppedAt,
  pages,
};
await fs.mkdir(path.dirname(path.resolve(OUT)), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(out, null, 1));
console.log(`Done: ${pages.length} pages fetched${stoppedAt ? ` (${stoppedAt})` : ''}. Written to ${OUT}`);
