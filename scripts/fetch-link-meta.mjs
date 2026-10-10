// Probes every harvested document/external link once and caches its HTTP status,
// size and content type in src/data/generated/link-meta.json.
// GIGW 3.0 asks that downloads show format and size; this lets the UI print
// "PDF · 1.2 MB" next to each document and lets us report broken legacy links.
//
//   node scripts/fetch-link-meta.mjs            (probe links not yet cached)
//   node scripts/fetch-link-meta.mjs --refresh  (probe everything again)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesFile = path.join(root, 'src/data/generated/legacy-pages.json');
const outFile = path.join(root, 'src/data/generated/link-meta.json');
const refresh = process.argv.includes('--refresh');
const CONCURRENCY = 6;
const TIMEOUT_MS = 20000;
const UA = 'Mozilla/5.0 (MoTA website link audit; NIC)';

const pages = JSON.parse(await fs.readFile(pagesFile, 'utf8'));
let cache = {};
try { cache = JSON.parse(await fs.readFile(outFile, 'utf8')); } catch { /* first run */ }

const urls = new Set();
for (const page of Object.values(pages)) {
  for (const section of page.sections) {
    for (const link of section.links) {
      if (link.kind === 'document' || link.kind === 'external' || link.kind === 'legacy') {
        if (link.url.startsWith('http')) urls.add(link.url);
      }
    }
  }
}
const todo = [...urls].filter((u) => refresh || !cache[u]);
console.log(`${urls.size} unique links, probing ${todo.length}`);

function human(bytes) {
  if (!bytes || Number.isNaN(bytes)) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Node's fetch rejects tribal.gov.in because the server omits its intermediate
// TLS certificate (reported in the project documentation). curl resolves the
// chain the way browsers do, so probes go through curl.
async function curlHead(url, extra = []) {
  const args = ['-s', '-I', '-L', '-m', String(TIMEOUT_MS / 1000), '-A', UA, ...extra, url];
  const { stdout } = await run('curl', args, { maxBuffer: 1024 * 1024 });
  const blocks = stdout.trim().split(/\r?\n\r?\n/).filter((b) => /^HTTP\//.test(b.trim()));
  const last = blocks.at(-1) || '';
  const status = Number((last.match(/^HTTP\/[\d.]+\s+(\d+)/) || [])[1] || 0);
  const header = (name) => ((last.match(new RegExp(`^${name}:\\s*(.*)$`, 'im')) || [])[1] || '').trim();
  return { status, length: header('content-length'), range: header('content-range'), type: header('content-type').split(';')[0] };
}

async function probe(url) {
  try {
    let res = await curlHead(url);
    if ([0, 403, 405, 501].includes(res.status)) res = await curlHead(url, ['-X', 'GET', '-r', '0-0']);
    let bytes = Number(res.length);
    if (res.range && res.range.includes('/')) bytes = Number(res.range.split('/').pop());
    const ok = res.status > 0 && res.status < 400;
    // IIS answers some missing files with a 200 HTML page, so HTML for a .pdf URL counts as broken.
    const looksBroken = ok && /\.(pdf|docx?|xlsx?|pptx?)$/i.test(new URL(url).pathname) && res.type.startsWith('text/html');
    return { status: res.status, ok: ok && !looksBroken, type: res.type, size: human(bytes), checked: new Date().toISOString().slice(0, 10) };
  } catch (err) {
    return { status: 0, ok: false, error: String(err.code || err.name || err), checked: new Date().toISOString().slice(0, 10) };
  }
}

let done = 0;
const queue = [...todo];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    cache[url] = await probe(url);
    done += 1;
    if (done % 50 === 0) {
      console.log(`  ${done}/${todo.length}`);
      await fs.writeFile(outFile, JSON.stringify(cache, null, 1));
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await fs.writeFile(outFile, JSON.stringify(cache, null, 1));

const broken = Object.entries(cache).filter(([, m]) => !m.ok);
console.log(`done. ${Object.keys(cache).length} cached, ${broken.length} not reachable`);
