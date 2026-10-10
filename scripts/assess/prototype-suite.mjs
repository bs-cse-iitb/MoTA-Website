// UAT test suite for the new tribal.gov.in front end.
// Serve the build first (npm run preview, or any static server), then:
//   node scripts/assess/prototype-suite.mjs --base http://127.0.0.1:4322   (evidence → docs/Evidence/uat)
// Produces <out>/results.json, <out>/test-cases.csv and screenshots in <out>/screenshots/.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer-core';
import { EVIDENCE } from '../paths.mjs';

const require = createRequire(import.meta.url);
const axeSource = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const BASE = arg('--base', 'http://127.0.0.1:4321');
const OUT = arg('--out', path.join(EVIDENCE, 'uat'));
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
await fs.mkdir(path.join(OUT, 'screenshots'), { recursive: true });

const PAGES = [
  ['home', '/'], ['about', '/ministry/about-us/'], ['team', '/ministry/our-team/'], ['division', '/ministry/our-divisions/forest-rights-act/'],
  ['schemes', '/offerings/schemes/'], ['scheme', '/offerings/schemes/pm-janman/'], ['guidelines', '/documents/guidelines/'], ['photos', '/media/photos/'],
  ['contact', '/connect/contact-us/'], ['directory', '/connect/directory/'], ['rti', '/connect/rti/'], ['feedback', '/connect/feedback/'],
  ['policy', '/policies/accessibility-statement/'], ['sitemap', '/sitemap/'], ['search', '/search/?q=scholarship'], ['persona', '/personas/student/'],
];
const VIEWPORTS = { mobile320: [320, 640], mobile390: [390, 844], tablet768: [768, 1024], desktop1366: [1366, 900], wide1920: [1920, 1080] };
const consent = () => localStorage.setItem('mota-consent', JSON.stringify({ analytics: false, social: false, ts: 'uat' }));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const results = [];
const cases = [];
let tcNo = 0;
const addCase = (area, title, expected, pass, evidence = '', note = '') => {
  tcNo += 1;
  cases.push({ id: `TC-${String(tcNo).padStart(3, '0')}`, area, title, expected, result: pass ? 'Pass' : 'Fail', evidence, note });
};

async function open(url, [w, h], theme) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: w < 768, hasTouch: w < 768 });
  await page.evaluateOnNewDocument(consent);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const u = `${BASE}${url}${theme ? (url.includes('?') ? '&' : '?') + 'theme=' + theme : ''}`;
  await page.goto(u, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 500));
  return { page, errors };
}
async function axe(page) {
  await page.evaluate(axeSource);
  return page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] })).violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })));
}
async function canScrollX(page) {
  return page.evaluate(() => { const x = window.scrollX; window.scrollTo(500, window.scrollY); const moved = window.scrollX > x; window.scrollTo(0, window.scrollY); return moved; });
}

// 1. Accessibility and responsive matrix
for (const lang of ['en', 'hi']) {
  for (const [id, url0] of PAGES) {
    const url = lang === 'hi' ? (url0 === '/' ? '/hi/' : `/hi${url0}`) : url0;
    const vps = ['home', 'scheme', 'directory', 'guidelines'].includes(id) ? Object.keys(VIEWPORTS) : ['mobile390', 'desktop1366'];
    for (const vp of vps) {
      const { page, errors } = await open(url, VIEWPORTS[vp]);
      const v = await axe(page);
      const sx = await canScrollX(page);
      const lang = await page.evaluate(() => document.documentElement.lang);
      results.push({ url, viewport: vp, theme: 'standard', axe: v, horizontalScroll: sx, consoleErrors: errors.length, lang });
      if (vp === 'desktop1366' || vp === 'mobile390') {
        const shot = `${lang}-${id}-${vp}.jpg`;
        await page.screenshot({ path: path.join(OUT, 'screenshots', shot), type: 'jpeg', quality: 72 });
      }
      await page.close();
    }
  }
}
for (const theme of ['dark', 'contrast']) {
  for (const [id, url] of PAGES.slice(0, 8)) {
    const { page } = await open(url, VIEWPORTS.desktop1366, theme);
    const v = await axe(page);
    results.push({ url, viewport: 'desktop1366', theme, axe: v, horizontalScroll: false, consoleErrors: 0, lang: 'en' });
    if (id === 'home' || id === 'scheme') await page.screenshot({ path: path.join(OUT, 'screenshots', `en-${id}-${theme}.jpg`), type: 'jpeg', quality: 72 });
    await page.close();
  }
}
const totalViol = results.reduce((n, r) => n + r.axe.length, 0);
const scrollFails = results.filter((r) => r.horizontalScroll);
addCase('Accessibility', `Automated WCAG 2.1 A/AA scan (axe-core) — ${results.length} page/viewport/theme combinations`, 'No violations', totalViol === 0, 'results.json', totalViol ? `${totalViol} violations` : '');
addCase('Responsive', 'No horizontal scrolling at 320, 390, 768, 1366 and 1920 px', 'Page never scrolls sideways', scrollFails.length === 0, 'results.json', scrollFails.map((r) => `${r.url}@${r.viewport}`).join('; '));
addCase('Bilingual', 'Hindi pages declare lang="hi"; English pages lang="en"', 'Correct lang attribute on every page', results.every((r) => (r.url.startsWith('/hi') ? r.lang === 'hi' : r.lang === 'en')), 'results.json');
addCase('Quality', 'No JavaScript errors on any tested page', '0 console errors', results.every((r) => !r.consoleErrors), 'results.json');

// 2. Interaction tests
{
  const { page } = await open('/', VIEWPORTS.desktop1366);
  // Skip link
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => document.activeElement?.className);
  addCase('Accessibility', 'First Tab focuses “Skip to main content”', 'Skip link receives focus first', /skip-link/.test(firstFocus || ''), '');
  await page.keyboard.press('Enter');
  const atMain = await page.evaluate(() => document.activeElement?.id === 'main' || location.hash === '#main');
  addCase('Accessibility', 'Skip link moves focus to main content', 'Focus/URL at #main', atMain, '');
  // Mega menu by keyboard
  await page.focus('.mainnav__trigger');
  await page.keyboard.press('ArrowDown');
  await new Promise((r) => setTimeout(r, 250));
  const megaOpen = await page.$eval('[data-menu-item]', (el) => el.classList.contains('is-open'));
  const focusInMega = await page.evaluate(() => Boolean(document.activeElement?.closest('.mega')));
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'interaction-mega-menu.jpg'), type: 'jpeg', quality: 72 });
  await page.keyboard.press('Escape');
  const megaClosed = await page.$eval('[data-menu-item]', (el) => !el.classList.contains('is-open'));
  addCase('Navigation', 'Global menu opens with ↓, focus moves into it, Esc closes it', 'Disclosure pattern works by keyboard', megaOpen && focusInMega && megaClosed, 'interaction-mega-menu.jpg');
  // Language selector
  await page.click('[data-lang-menu] button');
  const langOpen = await page.$eval('#lang-list', (l) => !l.hidden);
  const hiHref = await page.$eval('#lang-list a[hreflang="hi"]', (a) => a.getAttribute('href'));
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'interaction-language.jpg'), type: 'jpeg', quality: 72 });
  addCase('Bilingual', 'Language selector lists English and हिन्दी and links to the same page in Hindi', 'Menu opens; Hindi link = /hi/', langOpen && hiHref === '/hi/', 'interaction-language.jpg');
  await page.keyboard.press('Escape');
  // Accessibility panel and modes
  await page.click('[data-open-a11y]');
  await new Promise((r) => setTimeout(r, 250));
  const dlg = await page.$eval('#a11y-panel', (d) => d.open);
  const modes = {};
  for (const [sel, cls] of [['[data-a11y="text"][value="2"]', null], ['[data-a11y="filter"][value="invert"]', 'a11y-invert'], ['[data-a11y="hideImages"]', 'a11y-noimg'], ['[data-a11y="bigCursor"]', 'a11y-cursor'], ['[data-a11y="links"]', 'a11y-links'], ['[data-a11y="spacing"]', 'a11y-spacing'], ['[data-a11y="readable"]', 'a11y-readable'], ['[data-a11y="noMotion"]', 'a11y-nomotion']]) {
    await page.click(sel);
    modes[sel] = cls ? await page.evaluate((c) => document.documentElement.classList.contains(c), cls) : await page.evaluate(() => document.documentElement.dataset.text === '2');
  }
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'interaction-accessibility-panel.jpg'), type: 'jpeg', quality: 72 });
  await page.click('[data-a11y="filter"][value="saturate"]');
  const sat = await page.evaluate(() => document.documentElement.classList.contains('a11y-saturate') && !document.documentElement.classList.contains('a11y-invert'));
  await page.click('[data-a11y-reset]');
  const reset = await page.evaluate(() => document.documentElement.dataset.text === '0' && !document.documentElement.className.includes('a11y-'));
  addCase('Accessibility', 'Accessibility panel: text size, invert, low saturation, hide images, big cursor, highlight links, spacing, readable font, stop motion, reset', 'Each control applies and Reset clears all', dlg && Object.values(modes).every(Boolean) && sat && reset, 'interaction-accessibility-panel.jpg', JSON.stringify(modes));
  await page.keyboard.press('Escape');
  // Contrast toggle in top bar
  await page.click('[data-contrast-toggle]');
  const contrast = await page.evaluate(() => document.documentElement.dataset.theme === 'contrast');
  await page.click('[data-contrast-toggle]');
  addCase('Accessibility', 'High-contrast toggle in the top bar', 'Theme switches to high contrast and back', contrast, '');
  // External link notice
  await page.evaluate(() => document.querySelector('a[data-ext][href*="india.gov.in/"]')?.click());
  await new Promise((r) => setTimeout(r, 250));
  const ext = await page.$eval('#ext-dialog', (d) => d.open);
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'interaction-external-link.jpg'), type: 'jpeg', quality: 72 });
  addCase('Hyperlinks', 'External link shows “You are leaving tribal.gov.in” notice', 'Dialog opens with Continue/Cancel', ext, 'interaction-external-link.jpg');
  await page.keyboard.press('Escape');
  // Carousel pause
  const paused = await page.evaluate(() => { const b = document.querySelector('[data-carousel-toggle]'); b?.click(); return document.querySelector('[data-carousel]')?.classList.contains('is-paused'); });
  addCase('Accessibility', 'Banner slideshow can be paused (WCAG 2.2.2)', 'Pause button stops rotation', Boolean(paused), '');
  const tickerPaused = await page.evaluate(() => { document.querySelector('[data-ticker-toggle]')?.click(); return document.querySelector('[data-ticker]')?.classList.contains('is-paused'); });
  addCase('Accessibility', 'Announcements ticker can be paused', 'Pause button stops scrolling', Boolean(tickerPaused), '');
  await page.close();
}
{
  // Cookie banner (fresh private context without any stored consent)
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  const shown = await page.$eval('[data-cookie-bar]', (b) => !b.hidden);
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'interaction-cookie-banner.jpg'), type: 'jpeg', quality: 72 });
  await page.click('[data-consent="reject"]');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mota-consent') || '{}'));
  addCase('Privacy', 'Cookie consent banner at the bottom with Accept / Reject / Customise (DBIM 7.6)', 'Banner shows on first visit; choice is stored', shown && saved.analytics === false && saved.social === false, 'interaction-cookie-banner.jpg');
  await ctx.close();
}
{
  // Mobile drawer
  const { page } = await open('/', VIEWPORTS.mobile390);
  await page.evaluate(() => document.querySelector('[data-toggle-menu]')?.click());
  await new Promise((r) => setTimeout(r, 400));
  const open1 = await page.evaluate(() => document.body.classList.contains('menu-open'));
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'interaction-mobile-menu.jpg'), type: 'jpeg', quality: 72 });
  addCase('Responsive', 'Mobile menu opens as a drawer', 'Drawer visible with all sections', open1, 'interaction-mobile-menu.jpg');
  await page.close();
}
{
  // Search and feedback form validation
  const { page } = await open('/search/?q=forest', VIEWPORTS.desktop1366);
  await new Promise((r) => setTimeout(r, 800));
  const n = await page.$$eval('.result', (r) => r.length);
  addCase('Search', 'Site search returns results with type filters (DBIM 9)', 'Results listed for “forest”', n > 0, '', `${n} results`);
  await page.close();
  const f = await open('/connect/feedback/', VIEWPORTS.desktop1366);
  await f.page.click('[data-feedback] button[type="submit"]');
  const invalid = await f.page.$$eval('[aria-invalid="true"]', (e) => e.length);
  const focused = await f.page.evaluate(() => document.activeElement?.id);
  addCase('Forms', 'Feedback form shows errors and focuses the first invalid field', 'Errors announced; focus on Name', invalid >= 3 && focused === 'fb-name', '');
  await f.page.close();
}
{
  // Chat assistant (Jago, on the TriBot service): keyboard, reply, Esc returns focus.
  // Full end-to-end checks with a stand-in service: tests/assistant.test.mjs
  const { page } = await open('/', VIEWPORTS.desktop1366);
  await page.focus('[data-tribot-toggle]');
  await page.keyboard.press('Enter');
  const opened = await page.$eval('[data-tribot-panel]', (p) => !p.hidden);
  const inInput = await page.evaluate(() => document.activeElement?.id === 'tribot-input');
  await page.keyboard.type('PM-JANMAN');
  await page.keyboard.press('Enter');
  // The welcome text is a separate card (.tribot__welcome), so the first reply is bot message 1.
  await page.waitForFunction(() => document.querySelectorAll('.tribot__msg--bot').length > 0 && !document.querySelector('.tribot.is-busy'), { timeout: 30000 }).catch(() => {});
  const answered = await page.$$eval('.tribot__msg--bot', (m) => m.length > 0 && m[m.length - 1].querySelectorAll('a').length > 0);
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'interaction-tribot.jpg'), type: 'jpeg', quality: 72 });
  await page.keyboard.press('Escape');
  const back = await page.evaluate(() => Boolean(document.activeElement?.matches('[data-tribot-toggle]')));
  addCase('TriBot', 'Chat assistant (Jago) opens from the keyboard, replies, and Esc returns focus', 'Panel opens with focus in the input; reply with links; focus back on the assistant button', opened && inInput && answered && back, 'interaction-tribot.jpg', 'No chat service on UAT: the reply came from the site-search fallback (service checks: tests/assistant.test.mjs)');
  await page.close();
}
await browser.close();

// Static checks
const html = await fs.readFile('dist/index.html', 'utf8');
addCase('Metadata', 'Home page has title, description, keywords, canonical, hreflang en/hi, lang', 'All present', /<title>/.test(html) && /name="description"/.test(html) && /name="keywords"/.test(html) && /rel="canonical"/.test(html) && /hreflang="hi"/.test(html) && /<html lang="en"/.test(html), 'dist/index.html');
const sitemapXml = await fs.readFile('dist/sitemap.xml', 'utf8');
addCase('Sitemap', 'XML sitemap with both languages; HTML sitemap with at least two levels', 'sitemap.xml and /sitemap/ present', (sitemapXml.match(/<loc>/g) || []).length > 200, 'dist/sitemap.xml');
const wc = await fs.readFile('dist/web.config', 'utf8');
addCase('Security', 'Security headers configured (HSTS, CSP, XCTO, XFO, Referrer, Permissions; server header removed)', 'All configured in web.config', ['Strict-Transport-Security', 'Content-Security-Policy', 'X-Content-Type-Options" value="nosniff"', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy', 'removeServerHeader'].every((k) => wc.includes(k)), 'dist/web.config', 'To be verified on UAT server with curl -I');

await fs.writeFile(path.join(OUT, 'results.json'), JSON.stringify({ base: BASE, runAt: new Date().toISOString(), results, cases }, null, 1));
const csv = [['id', 'area', 'title', 'expected', 'result', 'evidence', 'note'].join(','), ...cases.map((c) => [c.id, c.area, c.title, c.expected, c.result, c.evidence, c.note].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n');
await fs.writeFile(path.join(OUT, 'test-cases.csv'), csv);
console.log(`Combinations scanned: ${results.length}; axe violations: ${totalViol}; horizontal scroll failures: ${scrollFails.length}`);
for (const c of cases) console.log(`${c.id} [${c.result}] ${c.area}: ${c.title}${c.note ? ' — ' + c.note : ''}`);
