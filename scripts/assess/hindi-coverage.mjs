// Measures Hindi coverage of /hi/ pages: share of visible main-content text in
// Devanagari, and English text that is NOT marked lang="en" (WCAG 3.1.2).
import fs from 'node:fs/promises';
import path from 'node:path';
import { EVIDENCE } from '../paths.mjs';

const dist = path.resolve('dist/hi');
async function walk(d) { const o = []; for (const e of await fs.readdir(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) o.push(...await walk(p)); else if (e.name === 'index.html') o.push(p); } return o; }
const rows = [];
for (const f of await walk(dist)) {
  let html = await fs.readFile(f, 'utf8');
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!m) continue;
  let main = m[1].replace(/<script[\s\S]*?<\/script>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '');
  // remove elements explicitly marked lang="en" (simple nesting-safe approach for inline elements)
  main = main.replace(/<(\w+)[^>]*aria-hidden="true"[^>]*>(?:(?!<\1[\s>])[\s\S])*?<\/\1>/g, ' ');
  let unmarked = main;
  for (let i = 0; i < 5; i++) unmarked = unmarked.replace(/<(\w+)[^>]*\blang="en"[^>]*>(?:(?!<\1[\s>])[\s\S])*?<\/\1>/g, ' ');
  const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
  const all = text(main), un = text(unmarked);
  const deva = (all.match(/[ऀ-ॿ]/g) || []).length;
  const latinAll = (all.match(/[A-Za-z]/g) || []).length;
  const latinUnmarked = (un.match(/[A-Za-z]{3,}/g) || []).join('').length;
  rows.push({ page: '/' + path.relative(path.resolve('dist'), path.dirname(f)) + '/', deva, latinAll, latinUnmarked, hindiShare: deva / Math.max(1, deva + latinAll) });
}
rows.sort((a, b) => b.latinUnmarked - a.latinUnmarked);
const bad = rows.filter((r) => r.latinUnmarked > 400);
console.log(`Hindi pages: ${rows.length}; median Hindi share ${(rows.map((r) => r.hindiShare).sort()[Math.floor(rows.length / 2)] * 100).toFixed(0)}%`);
console.log(`Pages with >400 unmarked Latin characters: ${bad.length}`);
for (const r of rows.slice(0, 15)) console.log(`  ${r.page.padEnd(60)} hindi ${(r.hindiShare * 100).toFixed(0)}%  unmarked-latin ${r.latinUnmarked}`);
await fs.mkdir(path.join(EVIDENCE, 'assessment'), { recursive: true });
await fs.writeFile(path.join(EVIDENCE, 'assessment', 'hindi-coverage.json'), JSON.stringify(rows, null, 1));
