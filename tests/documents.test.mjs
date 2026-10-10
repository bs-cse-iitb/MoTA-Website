// Every document the new pages link to on tribal.gov.in must open at its old address
// (GIGW 3.0: keep existing URLs; documents are kept as static files). Run after a build,
// against a server that has the document folders:
//
//   node scripts/serve-uat.mjs --docs ../MoTA_Website_Old/App     # local stand-in
//   BASE_URL=http://127.0.0.1:4322 npm run test:documents
//
// On staging, point BASE_URL at the staging server instead. Uses HEAD requests only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:4322').replace(/\/$/, '');
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const DOC = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|csv|mp3|mp4)$/i;
const TYPE = { pdf: 'application/pdf', doc: 'application/msword', xls: 'application/vnd.ms-excel', zip: 'application/zip', mp4: 'video/mp4', mp3: 'audio/mpeg' };

async function htmlFiles(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p))); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// Paths of documents on the Ministry's own server linked from the new pages.
const docs = new Map(); // path -> first page linking it
for (const f of await htmlFiles(dist)) {
  const html = await fs.readFile(f, 'utf8');
  for (const m of html.matchAll(/href="(?:https?:\/\/(?:www\.)?tribal\.(?:gov|nic)\.in)?(\/[^"#?]+)"/gi)) {
    const p = m[1].replace(/&amp;/g, '&');
    if (DOC.test(p) && !docs.has(p)) docs.set(p, '/' + path.relative(dist, f).replace(/index\.html$/, ''));
  }
}

test(`documents linked from the new pages open at their old addresses (${docs.size})`, async (t) => {
  for (const [p, page] of docs) {
    await t.test(p, async () => {
      const res = await fetch(BASE + p, { method: 'HEAD' });
      assert.equal(res.status, 200, `${p} (linked on ${page}) answered ${res.status}`);
      const ext = p.split('.').pop().toLowerCase();
      if (TYPE[ext]) assert.match(res.headers.get('content-type') ?? '', new RegExp(TYPE[ext].replace('.', '\\.')));
    });
  }
});
