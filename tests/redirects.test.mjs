// Every old tribal.gov.in address in src/data/legacy-urls.json must behave as recorded
// there (GIGW 3.0: existing URLs keep working). Runs against a running server:
//
//   npm run serve:uat                      # in another terminal (or staging)
//   BASE_URL=http://127.0.0.1:4322 npm run test:redirects
//
// Checks, for each old page: a 301 to the recorded new address, also with different
// letter case and with a query string (passed on only where keepQueryString says so);
// the new address answers 200. Retired addresses answer 404. Pages held back in
// notRedirectedYet must not redirect (the new site still links to them).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:4322').replace(/\/$/, '');
const map = JSON.parse(await fs.readFile(new URL('../src/data/legacy-urls.json', import.meta.url), 'utf8'));
const held = new Set(Object.keys(map.notRedirectedYet).map((p) => p.toLowerCase()));
const keepQuery = new Set(map.keepQueryString.map((p) => p.toLowerCase()));

const url = (legacyPath) => `${BASE}/${legacyPath.split('/').map(encodeURIComponent).join('/')}`;
const get = (u) => fetch(u, { redirect: 'manual' });
const location = (res) => {
  const loc = res.headers.get('location') ?? '';
  return loc.startsWith(BASE) ? loc.slice(BASE.length) : loc;
};

test('every old page redirects permanently to its recorded new page', async (t) => {
  const targets = new Set();
  for (const [from, to] of Object.entries(map.redirects)) {
    if (held.has(from.toLowerCase())) continue;
    await t.test(from, async () => {
      const res = await get(url(from));
      assert.equal(res.status, 301, `${from}: expected 301, got ${res.status}`);
      assert.equal(location(res), to);
      const upper = await get(url(from.toUpperCase()));
      assert.equal(upper.status, 301, `${from.toUpperCase()}: case must not matter`);
      const withQuery = await get(`${url(from)}?id=1`);
      assert.equal(location(withQuery), keepQuery.has(from.toLowerCase()) ? `${to}?id=1` : to);
    });
    targets.add(to.split('#')[0]);
  }
  for (const target of targets) {
    await t.test(`target ${target} answers 200`, async () => {
      assert.equal((await get(`${BASE}${target}`)).status, 200);
    });
  }
});

test('pages held back until their content is migrated are not redirected', async (t) => {
  for (const from of Object.keys(map.notRedirectedYet)) {
    await t.test(from, async () => {
      assert.notEqual((await get(url(from))).status, 301);
    });
  }
});

test('retired old addresses answer 404 (not a redirect)', async (t) => {
  for (const from of Object.keys(map.retired)) {
    // index.html is now the new home page itself.
    if (from === 'index.html') continue;
    await t.test(from, async () => {
      assert.equal((await get(url(from))).status, 404);
    });
  }
});
