// Go-live readiness for the switch-over from the old ASP.NET site. Run after
// `npm run build` and `npm run inventory`. Exits with 1 while anything below is open,
// so a release candidate cannot pass with known migration gaps.
//
//   npm run check:release
//
// Checks: old pages still held back from redirecting (src/data/legacy-urls.json),
// links from the new pages to old .aspx pages (they stop working when the old public
// site is retired), and the migration inventory's open items (docs/Migration/summary.json).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCS } from './paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(await fs.readFile(path.join(root, 'src/data/legacy-urls.json'), 'utf8'));
const problems = [];

const undecided = Object.entries(map.decisionNeeded ?? {});
if (undecided.length) problems.push(`${undecided.length} old addresses need a Ministry decision:\n${undecided.map(([p, why]) => `     - ${p}: ${why}`).join('\n')}`);

const held = Object.entries(map.notRedirectedYet);
if (held.length) problems.push(`${held.length} old pages are held back because their content is not migrated:\n${held.map(([p, why]) => `     - ${p}: ${why}`).join('\n')}`);

async function htmlFiles(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p))); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const aspx = new Map();
for (const f of await htmlFiles(path.join(root, 'dist'))) {
  const html = await fs.readFile(f, 'utf8');
  for (const m of html.matchAll(/href="(https?:\/\/(?:www\.)?tribal\.(?:gov|nic)\.in\/[^"]*\.aspx[^"]*)"/gi)) {
    aspx.set(m[1], (aspx.get(m[1]) ?? 0) + 1);
  }
}
if (aspx.size) problems.push(`${aspx.size} links from the new pages point to old .aspx pages:\n${[...aspx.keys()].slice(0, 20).map((u) => `     - ${u}`).join('\n')}`);

let summary;
try { summary = JSON.parse(await fs.readFile(path.join(DOCS, 'Migration', 'summary.json'), 'utf8')); } catch { problems.push('docs/Migration/summary.json missing: run npm run inventory'); }
if (summary) {
  const open = Object.entries(summary.byStatus).filter(([k]) => /UNMAPPED|CONTENT GAP|MISSING FROM SOURCE|DECISION|REVIEW|blocked|pending/.test(k));
  if (open.length) problems.push(`Migration inventory has open items:\n${open.map(([k, v]) => `     - ${v} × ${k}`).join('\n')}`);
  if (/NOT RECONCILED/.test(summary.inputs.database)) problems.push('Content not reconciled with the database (NIC content export not received).');
}

if (problems.length) {
  console.log(`NOT READY for go-live (${problems.length} open areas):\n`);
  problems.forEach((p, i) => console.log(`${i + 1}. ${p}\n`));
  process.exitCode = 1;
} else {
  console.log('Ready: no migration blockers found. Staging verification is still required (docs/DEPLOYMENT.md).');
}
