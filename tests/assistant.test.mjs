// Chat assistant (Jago) in the browser, end to end, against the local stand-in for the
// TriBot service (tests/mocks/tribot-service.mjs). Run after `npm run build`:
//
//   npm run test:assistant
//
// Starts the stand-in on port 4399 and the IIS stand-in (scripts/serve-uat.mjs) on port
// 4323 with /tribot-api/ forwarded to it, then checks: opening and closing by keyboard,
// the 11 answer languages, what is sent to the service (including the session id), how
// plain-text, list and table answers are shown, that markup in an answer is shown as
// text, the site-search fallback, the conversation surviving a page change, Hindi pages,
// and axe-core WCAG 2.1 A/AA with the panel open in each theme and on a phone.
// Screenshots go to ASSISTANT_OUT (default docs/Evidence/assistant).

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { startMockTribot } from './mocks/tribot-service.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.resolve(process.env.ASSISTANT_OUT || path.join(root, 'docs', 'Evidence', 'assistant'));
const BASE = 'http://127.0.0.1:4323';
const LANGS = ['eng', 'hin', 'gnd', 'sat', 'mun', 'bhili', 'bettakuruba', 'garo', 'kokborok', 'koya', 'kui'];
const axeSource = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

let mock, server, browser;

before(async () => {
  await fs.mkdir(OUT, { recursive: true });
  mock = await startMockTribot(4399);
  server = spawn(process.execPath, ['scripts/serve-uat.mjs', '--port', '4323', '--tribot', mock.url], { cwd: root });
  await new Promise((resolve, reject) => {
    server.stdout.on('data', (b) => { if (String(b).includes('UAT server')) resolve(); });
    server.on('exit', (code) => reject(new Error(`serve-uat exited with ${code}`)));
  });
  browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
});
after(async () => {
  await browser?.close();
  server?.kill();
  mock?.server.close();
});

/** A page in a fresh browser profile (no saved language, consent already given). */
async function open(url, { width = 1366, height = 900 } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width, height, isMobile: width < 768, hasTouch: width < 768 });
  await page.evaluateOnNewDocument(() => localStorage.setItem('mota-consent', JSON.stringify({ analytics: false, social: false, ts: 'test' })));
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { errors.push(`dialog: ${d.message()}`); d.dismiss(); });
  await page.goto(BASE + url, { waitUntil: 'networkidle0' });
  return { page, ctx, errors };
}
const answers = (page) => page.$$eval('.tribot__msg--bot', (els) => els.length);
async function ask(page, text) {
  const before = await answers(page);
  await page.click('[data-tribot-input]', { count: 3 });
  await page.type('[data-tribot-input]', text);
  await page.keyboard.press('Enter');
  await page.waitForFunction((n) => document.querySelectorAll('.tribot__msg--bot').length > n && !document.querySelector('.tribot.is-busy'), { timeout: 15000 }, before);
  return page.evaluateHandle(() => [...document.querySelectorAll('.tribot__msg--bot')].pop());
}
async function axe(page) {
  await page.evaluate(axeSource);
  return page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map((v) => `${v.id} (${v.nodes.length})`));
}

test('opens from the keyboard, focuses the question box, and Escape closes it', async () => {
  const { page, ctx, errors } = await open('/');
  await page.focus('[data-tribot-toggle]');
  await page.keyboard.press('Enter');
  assert.equal(await page.$eval('[data-tribot-panel]', (p) => p.hidden), false);
  assert.equal(await page.$eval('[data-tribot-toggle]', (b) => b.getAttribute('aria-expanded')), 'true');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'tribot-input');
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('[data-tribot-panel]', (p) => p.hidden), true);
  assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute('data-tribot-toggle')), true);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('offers the 11 answer languages of the service; the page language is the default', async () => {
  const en = await open('/');
  assert.deepEqual(await en.page.$$eval('[data-tribot-lang] option', (o) => o.map((x) => x.value)), LANGS);
  assert.equal(await en.page.$eval('[data-tribot-lang]', (s) => s.value), 'eng');
  await en.ctx.close();
  const hi = await open('/hi/');
  assert.equal(await hi.page.$eval('[data-tribot-lang]', (s) => s.value), 'hin');
  await hi.ctx.close();
});

test('sends the service request format and shows plain-text, list and table answers', async () => {
  mock.requests.length = 0;
  const { page, ctx, errors } = await open('/');
  await page.click('[data-tribot-toggle]');
  await page.click('[data-tribot-q]');
  await page.waitForFunction(() => document.querySelector('.tribot__msg--bot') && !document.querySelector('.tribot.is-busy'));
  const first = mock.requests[0];
  assert.equal(first.query, 'What is PM-JANMAN?');
  assert.equal(first.language, 'eng');
  assert.equal(first.top_k, 10);
  assert.deepEqual(first.messages, [{ role: 'user', content: 'What is PM-JANMAN?' }]);
  assert.equal(first.session_id, undefined);
  const a1 = await page.$eval('.tribot__msg--bot', (el) => ({
    bold: el.querySelector('strong')?.textContent,
    link: el.querySelector('a[data-ext]')?.getAttribute('href'),
    list: [...el.querySelectorAll('ul li')].map((li) => li.textContent),
    chip: el.querySelector('.tribot__actions button')?.textContent,
    sources: [...el.querySelectorAll('.tribot__src li')].map((li) => li.textContent),
    copy: Boolean(el.querySelector('.tribot__copy')),
  }));
  assert.equal(a1.bold, 'bold text');
  assert.equal(a1.link, 'https://www.example.gov.in/page');
  assert.ok(a1.list.includes('point one'));
  assert.equal(a1.chip, 'Ask a follow-up');
  assert.deepEqual(a1.sources, ['Test guidelines.pdf (page 3)']); // "Unknown" sources are not shown
  assert.equal(a1.copy, true);

  const list = await ask(page, 'Show me a list');
  const second = mock.requests.at(-1);
  assert.equal(second.session_id, 'test-session-1');
  assert.equal(second.messages.length, 3);
  assert.deepEqual(await list.evaluate((el) => [...el.querySelectorAll('ul li')].map((li) => li.textContent).slice(0, 1)), ['First test item']);
  assert.equal(await list.evaluate((el) => el.querySelector('a[href="https://www.example.gov.in/"]')?.textContent), 'www.example.gov.in');

  const table = await ask(page, 'Show a table');
  assert.deepEqual(await table.evaluate((el) => [...el.querySelectorAll('th[scope="col"]')].map((th) => th.textContent)), ['Scheme', 'Year']);
  assert.equal(await table.evaluate((el) => el.querySelectorAll('tbody tr').length), 2);
  assert.equal(await table.evaluate((el) => el.querySelector('.tribot__table')?.getAttribute('role')), 'region');
  await page.screenshot({ path: path.join(OUT, 'assistant-en-desktop.png') });
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('markup in a question or answer is shown as text, never run', async () => {
  const { page, ctx, errors } = await open('/');
  await page.click('[data-tribot-toggle]');
  const evil = '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>';
  await ask(page, evil);
  assert.equal(await page.$$eval('.tribot__log img, .tribot__log script', (els) => els.length), 0);
  assert.equal(await page.evaluate(() => window.__xss), undefined);
  assert.ok((await page.$eval('.tribot__log', (el) => el.textContent)).includes('<img src=x'));
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('falls back to the site search when the service fails', async () => {
  const { page, ctx } = await open('/');
  await page.click('[data-tribot-toggle]');
  const fallback = await ask(page, 'please fail');
  assert.match(await fallback.evaluate((el) => el.querySelector('a[href*="/search/?q="]')?.getAttribute('href') ?? ''), /\/search\/\?q=please%20fail/);
  await ctx.close();
});

test('keeps the conversation when moving to another page; New chat clears it', async () => {
  const { page, ctx } = await open('/');
  await page.click('[data-tribot-toggle]');
  await ask(page, 'First question');
  await page.goto(`${BASE}/help/`, { waitUntil: 'networkidle0' });
  await page.click('[data-tribot-toggle]');
  assert.ok((await page.$$eval('.tribot__msg', (els) => els.length)) >= 2);
  await page.click('[data-tribot-new]');
  assert.equal(await page.$$eval('.tribot__msg', (els) => els.length), 0);
  assert.equal(await page.evaluate(() => sessionStorage.getItem('mota-assistant-chat')), null);
  await ctx.close();
});

test('Hindi page: asks in Hindi; an answer in another language carries its lang attribute', async () => {
  mock.requests.length = 0;
  const { page, ctx, errors } = await open('/hi/');
  await page.click('[data-tribot-toggle]');
  await page.click('[data-tribot-q]');
  await page.waitForFunction(() => document.querySelector('.tribot__msg--bot') && !document.querySelector('.tribot.is-busy'));
  assert.equal(mock.requests[0].language, 'hin');
  assert.equal(await page.$eval('.tribot__msg--bot strong', (el) => el.textContent), 'परीक्षण');
  await page.screenshot({ path: path.join(OUT, 'assistant-hi-desktop.png') });
  await page.select('[data-tribot-lang]', 'sat');
  const sat = await ask(page, 'ᱥᱠᱤᱢ');
  assert.equal(mock.requests.at(-1).language, 'sat');
  assert.equal(await sat.evaluate((el) => el.lang), 'sat');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('axe-core WCAG 2.1 A/AA: no violations with the panel open (themes, Hindi, phone)', async () => {
  const cases = [['/', {}, ''], ['/?theme=dark', {}, 'dark'], ['/?theme=contrast', {}, 'contrast'], ['/hi/', {}, 'hi'], ['/', { width: 390, height: 844 }, 'mobile']];
  const found = [];
  for (const [url, vp, label] of cases) {
    const { page, ctx } = await open(url, vp);
    await page.click('[data-tribot-toggle]');
    await ask(page, 'Show me a list');
    const v = await axe(page);
    if (v.length) found.push(`${label || 'en'}: ${v.join(', ')}`);
    const sx = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (sx) found.push(`${label}: horizontal scroll`);
    if (label === 'dark' || label === 'mobile') await page.screenshot({ path: path.join(OUT, `assistant-en-${label}.png`) });
    await ctx.close();
  }
  assert.deepEqual(found, []);
});
