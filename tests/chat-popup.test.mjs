// Chat assistant page (chat_popup/) in the browser, end to end, against the local stand-in
// for the TriBot service (tests/mocks/tribot-service.mjs). Run after `npm run chat:build`:
//
//   npm run test:chat-popup
//
// Serves chat_popup/ the way the chat service does (at /chat_popup/, with /api/v1/chat
// forwarded to the stand-in on port 4398), then checks: the folder is up to date with the
// kit, the address config.js chooses on each kind of host, both pages load every file from
// the folder itself, opening and closing by keyboard, what is sent and how the answer is
// shown, the message and website-search link when the service fails, Hindi, and axe-core
// WCAG 2.1 A/AA with the panel open in each theme and on a phone. Nothing is sent to the
// live service: the last test checks that.
// Screenshots go to CHAT_POPUP_OUT (default docs/Evidence/chat-popup).

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { startMockTribot } from './mocks/tribot-service.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(root, 'chat_popup');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.resolve(process.env.CHAT_POPUP_OUT || path.join(root, 'docs', 'Evidence', 'chat-popup'));
const BASE = 'http://127.0.0.1:4325';
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };
const axeSource = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

let mock, server, browser;
const live = []; // requests that reached the live service: must stay empty

/** Stand-in for the chat service: the folder at /chat_popup/, questions at /api/v1/chat. */
function chatService(mockUrl) {
  const s = http.createServer(async (req, res) => {
    const url = new URL(req.url, BASE);
    if (req.method === 'POST' && url.pathname === '/api/v1/chat') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const r = await fetch(`${mockUrl}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      res.writeHead(r.status, { 'Content-Type': r.headers.get('content-type') || 'application/json' });
      return res.end(await r.text());
    }
    let file = url.pathname.startsWith('/chat_popup/') ? path.join(DIR, decodeURIComponent(url.pathname.slice(12))) : '';
    if (file && !path.extname(file)) file = path.join(file, 'index.html');
    if (!file || !file.startsWith(DIR + path.sep)) { res.writeHead(404); return res.end(); }
    try {
      const data = await fs.readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    } catch { res.writeHead(404); res.end(); }
  });
  return new Promise((resolve) => s.listen(4325, '127.0.0.1', () => resolve(s)));
}

before(async () => {
  await fs.mkdir(OUT, { recursive: true });
  mock = await startMockTribot(4398);
  server = await chatService(mock.url);
  browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
});
after(async () => {
  await browser?.close();
  server?.close();
  mock?.server.close();
});

/** A page in a fresh browser profile; records errors, missing files and outside requests. */
async function open(url, { width = 1366, height = 900 } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width, height, isMobile: width < 768, hasTouch: width < 768 });
  const errors = [], missing = [], outside = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400) missing.push(`${r.status()} ${r.url()}`); });
  page.on('request', (r) => {
    if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) outside.push(r.url());
    if (r.url().startsWith('https://tribot.tribal.gov.in')) live.push(r.url());
  });
  await page.goto(BASE + url, { waitUntil: 'networkidle0' });
  return { page, ctx, errors, missing, outside };
}
/** Points the assistant at this stand-in (config.js chooses the live service for local pages). */
const useStandIn = (page) => page.$eval('[data-tribot]', (el) => { el.dataset.endpoint = '/api/v1/chat'; });
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

test('chat_popup/ is up to date with the kit (otherwise run npm run chat:build)', async () => {
  for (const f of ['dbim.js', 'dbim.min.css', 'icons.svg']) {
    const [mine, kit] = await Promise.all([fs.readFile(path.join(DIR, f)), fs.readFile(path.join(root, 'packages/dbim-kit/dist', f))]);
    assert.ok(mine.equals(kit), `${f} differs from packages/dbim-kit/dist/${f}`);
  }
});

test('config.js chooses the address for each kind of host', async () => {
  const code = await fs.readFile(path.join(DIR, 'config.js'), 'utf8');
  const cases = [
    ['https://tribot.tribal.gov.in/chat_popup/', '/api/v1/chat'],
    ['https://tribal.gov.in/chat_popup/', '/tribot-api/chat'],
    ['https://www.tribal.gov.in/chat_popup/hi/', '/tribot-api/chat'],
    ['http://127.0.0.1:8000/chat_popup/', '/api/v1/chat'],
    ['http://127.0.0.1:5500/', 'https://tribot.tribal.gov.in/api/v1/chat'],
    ['http://localhost:5500/chat_popup/index.html', 'https://tribot.tribal.gov.in/api/v1/chat'],
    ['https://portal.example.gov.in/help/', '/tribot-api/chat'],
  ];
  for (const [href, want] of cases) {
    const u = new URL(href);
    const el = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } };
    vm.runInNewContext(code, { location: { hostname: u.hostname, port: u.port, protocol: u.protocol }, document: { querySelector: () => el } });
    assert.equal(el.attrs['data-endpoint'], want, href);
  }
});

test('both pages load every file from the folder itself, without errors', async () => {
  for (const [url, lang, name, other] of [['/chat_popup/', 'en', 'Jago', 'हिन्दी'], ['/chat_popup/hi/', 'hi', 'जागो', 'English']]) {
    const { page, ctx, errors, missing, outside } = await open(url);
    assert.equal(await page.$eval('html', (h) => h.lang), lang);
    assert.equal(await page.$eval('h1', (h) => h.textContent.trim()), name);
    assert.equal(await page.$eval('.tribot__name', (h) => h.textContent.trim()), name);
    assert.equal(await page.$eval('[data-tribot]', (el) => el.dataset.endpoint), 'https://tribot.tribal.gov.in/api/v1/chat');
    const next = await page.$eval(`a[hreflang="${lang === 'en' ? 'hi' : 'en'}"]`, (a) => ({ text: a.textContent, href: a.href }));
    assert.equal(next.text, other);
    assert.equal((await fetch(next.href)).status, 200, next.href);
    const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family); });
    assert.ok(fonts.some((f) => /Noto Sans/i.test(f)), `fonts in use: ${fonts.join(', ')}`);
    assert.deepEqual(errors, [], url);
    assert.deepEqual(missing, [], url);
    assert.deepEqual(outside, [], url);
    await ctx.close();
  }
});

test('opens from the keyboard, focuses the question box, and Escape closes it', async () => {
  const { page, ctx, errors } = await open('/chat_popup/');
  await page.focus('[data-tribot-toggle]');
  await page.keyboard.press('Enter');
  assert.equal(await page.$eval('[data-tribot-panel]', (p) => p.hidden), false);
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'tribot-input');
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('[data-tribot-panel]', (p) => p.hidden), true);
  assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute('data-tribot-toggle')), true);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('sends the service request format and shows the answer', async () => {
  mock.requests.length = 0;
  const { page, ctx, errors } = await open('/chat_popup/');
  await useStandIn(page);
  await page.click('[data-tribot-toggle]');
  await page.click('[data-tribot-q]');
  await page.waitForFunction(() => document.querySelector('.tribot__msg--bot') && !document.querySelector('.tribot.is-busy'));
  assert.equal(mock.requests[0].query, 'What is PM-JANMAN?');
  assert.equal(mock.requests[0].language, 'eng');
  assert.equal(mock.requests[0].top_k, 10);
  assert.deepEqual(mock.requests[0].messages, [{ role: 'user', content: 'What is PM-JANMAN?' }]);
  const a = await page.$eval('.tribot__msg--bot', (el) => ({ text: el.textContent, bold: el.querySelector('strong')?.textContent, sources: [...el.querySelectorAll('.tribot__src li')].map((li) => li.textContent) }));
  assert.match(a.text, /Test answer to: What is PM-JANMAN\?/);
  assert.equal(a.bold, 'bold text');
  assert.deepEqual(a.sources, ['Test guidelines.pdf (page 3)']);
  const table = await ask(page, 'Show a table');
  assert.equal(mock.requests.at(-1).session_id, 'test-session-1');
  assert.deepEqual(await table.evaluate((el) => [...el.querySelectorAll('th[scope="col"]')].map((th) => th.textContent)), ['Scheme', 'Year']);
  await page.screenshot({ path: path.join(OUT, 'chat-popup-en-desktop.png') });
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('when the service fails: says so and links to the website search, with the leaving notice', async () => {
  const { page, ctx } = await open('/chat_popup/');
  const asked = [];
  page.on('request', (r) => asked.push(r.url()));
  await useStandIn(page);
  await page.click('[data-tribot-toggle]');
  const reply = await ask(page, 'please fail');
  assert.match(await reply.evaluate((el) => el.textContent), /can’t reach the Jago service right now\. Please try again later, or search the Ministry’s website:/);
  assert.equal(await reply.evaluate((el) => el.querySelector('a')?.href), 'https://tribal.gov.in/search/?q=please%20fail');
  assert.ok(!asked.some((u) => u.includes('pagefind')), 'no search index is requested');
  await reply.evaluate((el) => el.querySelector('a').click());
  assert.equal(await page.$eval('#ext-dialog', (d) => d.open), true);
  assert.equal(await page.$eval('[data-ext-host]', (el) => el.textContent), 'tribal.gov.in');
  await ctx.close();
});

test('Hindi page: asks in Hindi and links to the Hindi search when the service fails', async () => {
  mock.requests.length = 0;
  const { page, ctx, errors } = await open('/chat_popup/hi/');
  assert.equal(await page.$eval('[data-tribot-lang]', (s) => s.value), 'hin');
  await useStandIn(page);
  await page.click('[data-tribot-toggle]');
  await page.click('[data-tribot-q]');
  await page.waitForFunction(() => document.querySelector('.tribot__msg--bot') && !document.querySelector('.tribot.is-busy'));
  assert.equal(mock.requests[0].language, 'hin');
  assert.equal(await page.$eval('.tribot__msg--bot strong', (el) => el.textContent), 'परीक्षण');
  await page.screenshot({ path: path.join(OUT, 'chat-popup-hi-desktop.png') });
  const reply = await ask(page, 'please fail');
  assert.match(await reply.evaluate((el) => el.textContent), /अभी जागो सेवा से संपर्क नहीं हो पा रहा है/);
  assert.equal(await reply.evaluate((el) => el.querySelector('a')?.href), 'https://tribal.gov.in/hi/search/?q=please%20fail');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('axe-core WCAG 2.1 A/AA: no violations with the panel open (themes, Hindi, phone)', async () => {
  const cases = [['/chat_popup/', {}, 'en'], ['/chat_popup/?theme=dark', {}, 'dark'], ['/chat_popup/?theme=contrast', {}, 'contrast'], ['/chat_popup/hi/', {}, 'hi'], ['/chat_popup/', { width: 390, height: 844 }, 'phone']];
  const found = [];
  for (const [url, vp, label] of cases) {
    const { page, ctx } = await open(url, vp);
    await useStandIn(page);
    await page.click('[data-tribot-toggle]');
    await ask(page, 'Show me a list');
    const v = await axe(page);
    if (v.length) found.push(`${label}: ${v.join(', ')}`);
    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) found.push(`${label}: horizontal scroll`);
    if (label === 'dark' || label === 'phone') await page.screenshot({ path: path.join(OUT, `chat-popup-en-${label}.png`) });
    await ctx.close();
  }
  assert.deepEqual(found, []);
});

test('nothing was sent to the live service', () => {
  assert.deepEqual(live, []);
});
