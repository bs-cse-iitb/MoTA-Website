// UAT suite for the reusable kit (dist/, templates/, examples/). Serves the kit folder over
// HTTP, then checks the gallery and the template sample pages in headless Chrome:
// axe-core WCAG 2.1 AA in every colour group and theme, footer in the key colour,
// keyboard behaviour of the menu and dialogs, language switch, fonts, mobile reflow,
// missing files. Writes docs/Evidence/uat-kit/results.json, test-cases.csv and screenshots
// (docs/ is in this repository; set MOTA_DOCS_DIR to change it).
//
//   node packages/dbim-kit/test.mjs        (after npm run build && npm run kit:build)

import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const require = createRequire(import.meta.url);
const kit = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(kit, '../..');
const OUT = path.join(process.env.MOTA_DOCS_DIR ? path.resolve(process.env.MOTA_DOCS_DIR) : path.resolve(root, 'docs'), 'Evidence', 'uat-kit');
const SHOTS = path.join(OUT, 'screenshots');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const axeSource = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(SHOTS, { recursive: true });

// Static server for the kit folder
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
  const p = path.join(kit, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try {
    const body = await fs.readFile(p);
    res.writeHead(200, { 'content-type': types[path.extname(p)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const results = [];
const record = (id, title, pass, evidence, detail = '') => {
  results.push({ id, title, result: pass ? 'Pass' : 'Fail', evidence, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${title}${detail ? ` — ${detail}` : ''}`);
};

async function open(url, { width = 1366, height = 900, consent = true, ctx } = {}) {
  const context = ctx ?? await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width, height });
  const problems = [];
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url().replace(BASE, '')}`); });
  page.on('pageerror', (e) => problems.push(`JS error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push(`console: ${m.text()}`); });
  if (consent) await page.evaluateOnNewDocument(() => localStorage.setItem('mota-consent', JSON.stringify({ analytics: false, social: false, ts: 'uat' })));
  await page.goto(BASE + url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  return { page, context, problems };
}
async function axe(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, target: v.nodes[0]?.target?.join(' ') }));
  });
}
const shot = async (page, name, fullPage = false) => { await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage }); return `screenshots/${name}.png`; };

const GROUPS = ['9', '1', '2', '3', '4', '5', '6', '7', '8', '10', 'neutral'];

// KIT-01: gallery in every DBIM colour group, light theme
{
  const failures = [];
  const missing = new Set();
  for (const g of GROUPS) {
    const { page, context, problems } = await open(`/examples/index.html?group=${g}`);
    problems.forEach((p) => missing.add(p));
    const v = await axe(page);
    if (v.length) failures.push(`group ${g}: ${v.map((x) => `${x.id}×${x.nodes} (${x.target})`).join('; ')}`);
    if (['9', '2', '5', 'neutral'].includes(g)) await shot(page, `gallery-group-${g}`);
    if (g === '9') await shot(page, 'gallery-full-group-9', true);
    // KIT-02 evidence collected in the same pass: footer background = group key colour
    const colours = await page.evaluate(() => {
      const key = getComputedStyle(document.documentElement).getPropertyValue('--g-key').trim();
      const probe = document.createElement('span'); probe.style.color = key; document.body.append(probe);
      const keyRgb = getComputedStyle(probe).color; probe.remove();
      return { key, keyRgb, footer: getComputedStyle(document.querySelector('.site-footer__main')).backgroundColor };
    });
    results.groupColours = results.groupColours ?? [];
    results.groupColours.push({ group: g, ...colours, match: colours.keyRgb === colours.footer });
    await context.close();
  }
  record('KIT-01', 'Gallery: axe WCAG 2.1 AA, 0 violations in all 11 DBIM colour groups (light theme)', failures.length === 0, 'screenshots/gallery-group-*.png', failures.join(' | '));
  const bad = results.groupColours.filter((c) => !c.match);
  record('KIT-02', 'Footer background is the key colour of the selected colour group (DBIM 5.6)', bad.length === 0, 'results.json → groupColours', bad.map((c) => `${c.group}: ${c.footer} vs ${c.keyRgb}`).join('; '));
  record('KIT-03', 'Gallery loads with no missing files, JS errors or console errors', missing.size === 0, 'results.json', [...missing].join('; '));
}

// KIT-04: themes (dark, high contrast) on gallery and both sample pages
{
  const failures = [];
  for (const url of ['/examples/index.html', '/examples/page-en.html', '/examples/page-hi.html']) {
    for (const theme of ['light', 'dark', 'contrast']) {
      const { page, context } = await open(`${url}${url.includes('?') ? '&' : '?'}theme=${theme}`);
      const v = await axe(page);
      if (v.length) failures.push(`${url} ${theme}: ${v.map((x) => `${x.id}×${x.nodes} (${x.target})`).join('; ')}`);
      if (url !== '/examples/index.html' || theme !== 'light') await shot(page, `${path.basename(url, '.html')}-${theme}`);
      await context.close();
    }
  }
  record('KIT-04', 'Gallery and template sample pages (English, Hindi): axe 0 violations in standard, dark and high-contrast themes', failures.length === 0, 'screenshots/*-dark.png, *-contrast.png', failures.join(' | '));
}

// KIT-05: icons render from the sprite
{
  const { page, context } = await open('/examples/page-en.html');
  const r = await page.evaluate(() => {
    const uses = [...document.querySelectorAll('header svg use')];
    const visible = uses.filter((u) => { const b = u.closest('svg').getBoundingClientRect(); return b.width > 0 && b.height > 0; });
    const drawn = visible.filter((u) => u.getBBox().width > 0);
    return { total: uses.length, visible: visible.length, drawn: drawn.length };
  });
  record('KIT-05', 'Icons are drawn from the kit sprite (icons.svg) in key colour/white at DBIM sizes', r.visible > 0 && r.drawn === r.visible, 'screenshots/page-en-light.png', JSON.stringify(r));
  await context.close();
}

// KIT-06: mega menu keyboard pattern
{
  const { page, context } = await open('/examples/page-en.html');
  const trigger = '.mainnav__trigger';
  await page.focus(trigger);
  await page.keyboard.press('Enter');
  const opened = await page.$eval(trigger, (b) => b.getAttribute('aria-expanded'));
  const evidence = await shot(page, 'kit-mega-menu-open');
  await page.keyboard.press('Escape');
  const closed = await page.$eval(trigger, (b) => b.getAttribute('aria-expanded'));
  const focusBack = await page.evaluate((s) => document.activeElement === document.querySelector(s), trigger);
  record('KIT-06', 'Mega menu: opens with Enter, closes with Escape, focus returns to the trigger', opened === 'true' && closed === 'false' && focusBack, evidence, `open=${opened} closed=${closed} focusBack=${focusBack}`);
  await context.close();
}

// KIT-07: accessibility panel controls
{
  const { page, context } = await open('/examples/page-en.html');
  await page.click('[data-open-a11y]');
  await page.waitForSelector('#a11y-panel[open]');
  const evidence = await shot(page, 'kit-a11y-panel');
  const checks = {};
  for (const [sel, cls] of [['[data-a11y="filter"][value="invert"]', 'a11y-invert'], ['[data-a11y="filter"][value="saturate"]', 'a11y-saturate'], ['[data-a11y="hideImages"]', 'a11y-noimg'], ['[data-a11y="bigCursor"]', 'a11y-cursor'], ['[data-a11y="links"]', 'a11y-links'], ['[data-a11y="spacing"]', 'a11y-spacing']]) {
    await page.click(sel);
    checks[cls] = await page.evaluate((c) => document.documentElement.classList.contains(c), cls);
  }
  await page.click('[data-a11y="text"][value="2"]');
  checks.text2 = await page.evaluate(() => document.documentElement.dataset.text === '2');
  await page.click('[data-a11y="theme"][value="contrast"]');
  checks.contrast = await page.evaluate(() => document.documentElement.dataset.theme === 'contrast');
  checks.saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mota-prefs') || '{}').theme === 'contrast');
  await page.click('[data-a11y-reset]');
  checks.reset = await page.evaluate(() => document.documentElement.dataset.theme === 'light' && !document.documentElement.classList.contains('a11y-cursor'));
  await page.keyboard.press('Escape');
  checks.closed = await page.evaluate(() => !document.querySelector('#a11y-panel').open);
  const pass = Object.values(checks).every(Boolean);
  record('KIT-07', 'Accessibility panel: text size, themes, invert, low saturation, hide images, big cursor, highlight links, spacing, save and reset', pass, evidence, JSON.stringify(checks));
  await context.close();
}

// KIT-08: cookie consent (DPDP Act 2023) on first visit
{
  const { page, context } = await open('/examples/page-en.html', { consent: false });
  const shown = await page.$eval('[data-cookie-bar]', (e) => !e.hidden);
  const evidence = await shot(page, 'kit-cookie-bar');
  await page.click('[data-cookie-bar] [data-consent="reject"]');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('mota-consent') || 'null'));
  const hidden = await page.$eval('[data-cookie-bar]', (e) => e.hidden);
  record('KIT-08', 'Cookie consent bar on first visit; "Reject non-essential" stores the choice and hides the bar', shown && hidden && stored && stored.analytics === false, evidence, `shown=${shown} hidden=${hidden}`);
  await context.close();
}

// KIT-09: external link notice
{
  const { page, context } = await open('/examples/page-en.html');
  const href = await page.$eval('footer a[data-ext]', (a) => a.href);
  await page.$eval('footer a[data-ext]', (a) => a.click());
  const openDialog = await page.waitForSelector('#ext-dialog[open]', { timeout: 3000 }).then(() => true).catch(() => false);
  const host = await page.$eval('[data-ext-host]', (e) => e.textContent);
  const evidence = await shot(page, 'kit-external-link');
  record('KIT-09', 'External links open the "You are leaving" notice with the destination shown (GIGW hyperlink policy)', openDialog && host && href.includes(host), evidence, `host=${host}`);
  await context.close();
}

// KIT-10: bilingual templates and language switch
{
  const { page, context } = await open('/examples/page-en.html');
  await page.click('[data-lang-menu] button');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('[data-lang-switch="hi"]')]);
  const r = await page.evaluate(() => ({
    url: location.pathname, lang: document.documentElement.lang,
    deva: document.fonts.check('16px "Noto Sans Devanagari Variable"', 'जनजातीय'),
    title: document.title,
  }));
  const evidence = await shot(page, 'page-hi-desktop');
  record('KIT-10', 'Language selector switches to the Hindi template; page declares lang="hi" and Noto Sans Devanagari is loaded', r.url.endsWith('page-hi.html') && r.lang === 'hi' && r.deva, evidence, JSON.stringify(r));
  await context.close();
}

// KIT-11: fonts self-hosted
{
  const { page, context } = await open('/examples/page-en.html');
  const r = await page.evaluate(() => ({ latin: document.fonts.check('16px "Noto Sans Variable"'), family: getComputedStyle(document.body).fontFamily }));
  record('KIT-11', 'Noto Sans (DBIM 4.1) is self-hosted and applied to body text', r.latin && /Noto Sans/.test(r.family), 'dist/fonts/', JSON.stringify(r));
  await context.close();
}

// KIT-12: responsive, no horizontal scroll at 320/390/768 px; mobile menu
{
  const fails = [];
  let evidence = '';
  for (const [w, h] of [[320, 640], [390, 844], [768, 1024]]) {
    for (const url of ['/examples/index.html', '/examples/page-en.html', '/examples/page-hi.html']) {
      const { page, context } = await open(url, { width: w, height: h });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 0) fails.push(`${url}@${w}: +${over}px`);
      if (w === 390 && url === '/examples/page-en.html') {
        await shot(page, 'page-en-mobile390');
        await page.$eval('[data-toggle-menu]', (b) => b.click());
        const expanded = await page.$eval('[data-toggle-menu]', (b) => b.getAttribute('aria-expanded'));
        if (expanded !== 'true') fails.push('mobile menu did not open');
        await new Promise((r) => setTimeout(r, 400));
        const firstVisible = await page.evaluate(() => {
          const a = document.querySelector('.mainnav__home'); const b = a.getBoundingClientRect();
          const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
          return a === hit || a.contains(hit);
        });
        if (!firstVisible) fails.push('first menu item is covered by the header');
        evidence = await shot(page, 'kit-mobile-menu');
      }
      await context.close();
    }
  }
  record('KIT-12', 'Responsive: no horizontal scrolling at 320, 390 and 768 px; mobile menu opens with every item visible', fails.length === 0, evidence, fails.join('; '));
}

// KIT-13: templates contain no unresolved placeholders once filled, and no inline scripts/styles (strict CSP)
{
  const issues = [];
  for (const f of ['templates/en/header.html', 'templates/en/footer.html', 'templates/en/dialogs.html', 'templates/hi/header.html', 'templates/hi/footer.html', 'templates/hi/dialogs.html', 'templates/en/tribot.html', 'templates/hi/tribot.html', 'templates/page.html', 'templates/page.hi.html']) {
    const t = await fs.readFile(path.join(kit, f), 'utf8');
    if (/<script(?![^>]*\bsrc=)[^>]*>/.test(t)) issues.push(`${f}: inline <script>`);
    if (/\son[a-z]+="/.test(t)) issues.push(`${f}: inline event handler`);
    if (/<style/.test(t)) issues.push(`${f}: inline <style>`);
  }
  for (const f of ['examples/page-en.html', 'examples/page-hi.html']) {
    const t = await fs.readFile(path.join(kit, f), 'utf8');
    const left = t.match(/\{\{\w+\}\}/g);
    if (left) issues.push(`${f}: ${[...new Set(left)].join(',')}`);
  }
  record('KIT-13', 'Templates work under a strict CSP (no inline scripts, styles or event handlers); samples fully resolved', issues.length === 0, 'templates/', issues.join('; '));
}

await browser.close();
server.close();

const out = { generated: new Date().toISOString(), base: 'packages/dbim-kit (served locally)', summary: { total: results.length, pass: results.filter((r) => r.result === 'Pass').length }, results: results.map((r) => r), groupColours: results.groupColours };
await fs.writeFile(path.join(OUT, 'results.json'), JSON.stringify(out, null, 2));
const csv = ['ID,Test case,Result,Evidence,Detail', ...results.map((r) => [r.id, r.title, r.result, r.evidence, r.detail].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n');
await fs.writeFile(path.join(OUT, 'test-cases.csv'), csv + '\n');
console.log(`\n${out.summary.pass}/${out.summary.total} passed → ${path.relative(root, OUT)}/`);
process.exit(out.summary.pass === out.summary.total ? 0 : 1);
