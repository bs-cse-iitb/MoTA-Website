// Navigation check: every link and control in the navigation of the old home page, and where
// it is on the new site. Run after `npm run build`:
//
//   npm run check:nav -- [--from <saved Home.aspx.html>] [--out <folder>]
//
// Without --from the script fetches https://tribal.gov.in/Home.aspx once. In Oct 2026 that
// server did not send its intermediate certificate: pass it with NODE_EXTRA_CA_CERTS (see
// scripts/migration/crawl-live.mjs). Output (default docs/Evidence/runs/<date>-navigation/):
// nav-parity.csv and nav-parity.json. Exit code 1 if a navigation item is missing.
//
// What is compared: the site-wide navigation of the old page (top bar, header, main menu with
// its sub-menus, footer links, footer, portal logo band, social media bar, back to top) and
// the home page's own link blocks (Divisions & Schemes, Innovative Initiatives, What's New).
// The other links on the old home page (banners, notices, the Ministers' cards) are listed as
// "Home page content": they change with the news and come over with the content import, so
// they are reported but do not fail the check.
//
// Status of each old item:
//   In menus          the new header or footer has it (same destination or the same control)
//   On a page         a new page links to it; "clicks" says how far it is from the menus
//   Same website      the new site links another page of the same website (see "note")
//   Held              the new site links the old page until its content is migrated
//   Left out          not carried over on purpose (reason in "note")
//   Dead on old site  the old link went nowhere ("#")
//   Missing           nowhere on the new site

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import { DOCS } from '../paths.mjs';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = path.join(ROOT, 'dist');
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const OUT = path.resolve(arg('--out', path.join(DOCS, 'Evidence', 'runs', `${today}-navigation`)));
const OLD_HOME = 'https://tribal.gov.in/Home.aspx';
const map = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/legacy-urls.json'), 'utf8'));
const lower = (o) => new Map(Object.entries(o).map(([k, v]) => [k.toLowerCase(), v]));
const redirects = lower(map.redirects);
const held = lower(map.notRedirectedYet);

// Old links to other websites whose address has changed (checked 6 Oct 2026). `to` is the
// link the new site has; `same` marks a different page of the same website.
const MOVED = new Map([
  ['twitter.com/tribalaffairsin', { to: 'x.com/tribalaffairsin', note: 'twitter.com/TribalAffairsIn now redirects to x.com/TribalAffairsIn' }],
  ['nvsp.in', { to: 'voters.eci.gov.in', note: 'www.nvsp.in now redirects to voters.eci.gov.in, the Voters’ Service Portal; its own certificate expired on 17 Mar 2025' }],
  ['services.india.gov.in', { to: 'india.gov.in', same: true, note: 'services.india.gov.in now redirects to www.india.gov.in/services, a section of the National Portal of India; the new site links the portal’s home page' }],
]);
// Not carried over on purpose (6 Oct 2026); the Ministry is asked to confirm (review package,
// decision 8). Results: docs/GIGW_DBIM_Standardisation/5_Verify/Test_Report.md §3.
const LEFT_OUT = new Map([
  ['own:/divisionsfiles/stqc13022023.pdf', 'STQC Website Quality Certificate STQC/WQCS/GIGW/2023/Q1/05 was issued for the old website and was valid up till 12 Feb 2026. The new footer shows a certificate only while it is valid (site.stqc in src/data/site.ts). The PDF stays at its old address'],
  ['ext:cmf.gov.in', '"Built on Common Minimum Framework" would be untrue: the new site is not built on CMF'],
]);

// ---------------------------------------------------------------- helpers
const attr = (n, name) => n.attrs?.find((a) => a.name === name)?.value ?? '';
const hasClass = (n, c) => attr(n, 'class').split(/\s+/).includes(c);
function text(n) {
  if (n.nodeName === '#text') return n.value;
  if (n.nodeName === 'img') return attr(n, 'alt');
  return (n.childNodes ?? []).map(text).join('');
}
const clean = (s) => s.replace(/\s+/g, ' ').trim();
function* walk(node, ancestors = []) {
  yield { node, ancestors };
  for (const c of node.childNodes ?? []) yield* walk(c, [...ancestors, node]);
  if (node.content) yield* walk(node.content, [...ancestors, node]);
}
const anchors = (doc) => [...walk(doc)].filter(({ node }) => node.nodeName === 'a');
// Visible text (or image text), then the accessible name. Where the old aria-label says
// something else it is shown too: the old 2026-27 sanction orders link, for example, is
// announced as "2025-26".
const names = (a) => [clean(text(a)), clean(attr(a, 'aria-label')), clean(attr(a, 'title'))].filter(Boolean);
function label(a) {
  const [first = '', ...rest] = names(a);
  const aria = clean(attr(a, 'aria-label'));
  return aria && aria !== first && rest.includes(aria) ? `${first} (aria-label "${aria}")` : first;
}
function firstHeading(n, skip) {
  for (const { node } of walk(n)) {
    if (!/^h[1-6]$/.test(node.nodeName)) continue;
    const t = clean(text(node));
    if (t && t !== skip && !/^explore$/i.test(t)) return t;
  }
  return '';
}

/** Canonical form of a destination: own-site paths without host, other sites without www. */
function canon(href, base) {
  let u;
  try { u = new URL(href, base); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  let p;
  try { p = decodeURIComponent(u.pathname); } catch { p = u.pathname; }
  if (/^tribal\.(gov|nic)\.in$/.test(host)) return { own: true, path: p.replace(/\/+$/, '') || '/' };
  return { own: false, key: `${host}${p.replace(/\/+$/, '')}`.toLowerCase(), url: u.href };
}
const linkKey = (c) => (c.own ? `own:${c.path.toLowerCase()}` : `ext:${c.key}`);
const hostOf = (k) => k.slice(4).split('/')[0];

// ---------------------------------------------------------------- old page
const oldHtml = arg('--from')
  ? await fs.readFile(path.resolve(arg('--from')), 'utf8')
  : await (await fetch(OLD_HOME, { headers: { 'User-Agent': 'Mozilla/5.0 (MoTA navigation check)' } })).text();
const oldDoc = parse(oldHtml);

/** Region of an old link or control, and whether it is navigation or home page content. */
function regionOf(node, anc) {
  const has = (pred) => anc.some(pred);
  const id = (...ids) => (a) => ids.includes(attr(a, 'id'));
  const list = (...classes) => (a) => a.nodeName === 'ul' && classes.every((c) => hasClass(a, c));
  if (has(id('nav', 'topbar'))) return 'Top bar';
  if (has(list('main-nav'))) return 'Main menu';
  if (has(id('header'))) return 'Header';
  if (has((a) => a.nodeName === 'footer')) return 'Footer';
  if (has(list('list-inline', 'text-white'))) return 'Footer links';
  if (has((a) => hasClass(a, 'client-inners'))) return 'Portal logo band';
  if (has(list('social-nav'))) return 'Social media bar';
  if (has(id('Accessiblity'))) return 'Back to top';
  if (has(id('featured-services'))) return 'Home: Divisions & Schemes';
  if (has(id('portfolio1'))) return 'Home: Innovative Initiatives';
  if (/^what'?s new/i.test(label(node))) return "Home: What's New";
  return 'Home page content';
}

const oldItems = [];
for (const { node, ancestors } of walk(oldDoc)) {
  const isLink = node.nodeName === 'a';
  // Controls: the text size and contrast buttons of the old top bar.
  const isControl = node.nodeName === 'button' && /^btn-/.test(attr(node, 'id'));
  if (!isLink && !isControl) continue;
  const region = regionOf(node, ancestors);
  if (isControl && region !== 'Top bar') continue;
  let group = '';
  let name = isControl ? `${clean(text(node))} (${attr(node, 'id').replace(/^btn-/, '')})` : label(node);
  if (region === 'Main menu') {
    const top = ancestors[ancestors.findIndex((a) => a.nodeName === 'ul' && hasClass(a, 'main-nav')) + 1];
    const first = top && anchors(top)[0]?.node;
    group = first && first !== node ? names(first)[0] ?? '' : '';
  } else if (region.startsWith('Home: ') && region !== "Home: What's New") {
    // Cards and tiles: the link text is "Explore" or an icon; the card heading names it.
    for (const a of [...ancestors].reverse().slice(0, 6)) { const h = firstHeading(a, name); if (h) { name = h; break; } }
  }
  oldItems.push({
    kind: region === 'Home page content' ? 'content' : 'navigation',
    region, group, label: name, names: isControl ? [] : names(node),
    href: isControl ? '' : attr(node, 'href'), id: attr(node, 'id'),
  });
}

// ---------------------------------------------------------------- new site
async function htmlFiles(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p))); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const pageOf = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/').replace(/index\.html$/, '');
const pageKey = (page) => linkKey(canon(page, 'https://tribal.gov.in/'));
// The header and footer are the same on every page: their links are "the menus".
const inChrome = (node, anc) => hasClass(node, 'skip-link') || anc.some((a) => (a.nodeName === 'header' && hasClass(a, 'site-header')) || (a.nodeName === 'footer' && hasClass(a, 'site-footer')));
const pages = new Map(); // page key -> { page, title, links: Set(link key) }
const linkedFrom = new Map(); // link key -> Set(page key), links in the body of pages
const extUrl = new Map(); // external link key -> an address as the new site writes it
let homeDoc;
for (const f of await htmlFiles(DIST)) {
  const page = pageOf(f);
  if (page.startsWith('/hi/') || /\/google[0-9a-f]+\.html$/.test(page)) continue;
  const doc = parse(await fs.readFile(f, 'utf8'));
  if (page === '/') homeDoc = doc;
  const h1 = [...walk(doc)].find(({ node }) => node.nodeName === 'h1')?.node;
  const pk = pageKey(page);
  const entry = { page, title: page === '/' ? 'Home page' : clean(h1 ? text(h1) : page), links: new Set() };
  pages.set(pk, entry);
  for (const { node, ancestors } of anchors(doc)) {
    const c = canon(attr(node, 'href'), `https://tribal.gov.in${page}`);
    if (!c) continue;
    const k = linkKey(c);
    entry.links.add(k);
    if (!c.own && !extUrl.has(k)) extUrl.set(k, c.url);
    if (inChrome(node, ancestors)) continue;
    if (!linkedFrom.has(k)) linkedFrom.set(k, new Set());
    linkedFrom.get(k).add(pk);
  }
}
const menuLinks = new Set();
// Links whose only place in the header is a co-branding logo, hidden below 1024 px
// (packages/dbim-kit/src/css/layout.css).
const logoOnly = new Map();
for (const { node, ancestors } of anchors(homeDoc)) {
  if (!inChrome(node, ancestors)) continue;
  const c = canon(attr(node, 'href'), 'https://tribal.gov.in/');
  if (!c) continue;
  const k = linkKey(c);
  menuLinks.add(k);
  logoOnly.set(k, (logoOnly.get(k) ?? true) && ancestors.some((a) => a.nodeName === 'ul' && hasClass(a, 'cobrand')));
}
// Clicks from any page: 1 for the menus, then breadth-first through the links of each page.
const depth = new Map();
const via = new Map();
const queue = [...menuLinks].filter((k) => pages.has(k));
for (const k of queue) { depth.set(k, 1); via.set(k, null); }
while (queue.length) {
  const k = queue.shift();
  for (const t of pages.get(k).links) {
    if (pages.has(t) && !depth.has(t)) { depth.set(t, depth.get(k) + 1); via.set(t, k); queue.push(t); }
  }
}
const route = (pk) => { const r = []; for (let k = pk; k; k = via.get(k)) r.unshift(pages.get(k).title); return ['Menu', ...r].join(' › '); };
/** The page closest to the menus among those that link to `k`. */
function nearest(k) {
  let best = null;
  for (const pk of linkedFrom.get(k) ?? []) if (depth.has(pk) && (!best || depth.get(pk) < depth.get(best))) best = pk;
  return best;
}
const exists = async (p) => { try { await fs.access(path.join(DIST, p.replace(/^\//, ''), p.endsWith('/') ? 'index.html' : '')); return true; } catch { return false; } };
const homeHtml = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');

// Old items without a destination of their own: controls and menu headings.
const any = (re) => (i) => i.names.some((n) => re.test(n));
const FUNCTIONAL = [
  [any(/^skip to main/i), 'Skip link', /class="skip-link"/],
  [any(/^accessib/i), 'Accessibility options button and panel', /data-open-a11y/],
  [(i) => i.id === 'btn-decrease', 'Top bar A− button (also in the accessibility panel)', /data-text-step="-1"/],
  [(i) => i.id === 'btn-orig', 'Top bar A button (also in the accessibility panel)', /data-text-step="0"/],
  [(i) => i.id === 'btn-increase', 'Top bar A+ button (also in the accessibility panel)', /data-text-step="1"/],
  [(i) => i.id === 'btn-dark', 'Top bar high-contrast button (Dark and High contrast also in the accessibility panel)', /data-contrast-toggle/],
  [(i) => i.id === 'btn-light', 'The same top bar button switches back (Standard in the accessibility panel)', /data-a11y="theme" value="light"/],
  [any(/^social media$/i), 'Social media links in the footer', /class="social"/],
  [any(/^search box$/i), 'Search box in the header', /data-site-search/],
  [any(/^हिन्दी$/), 'Language menu: the same page in Hindi', /href="\/hi\/"/],
  [any(/^icmenu1?$/i), 'Menu button on small screens', /data-toggle-menu/],
  [any(/^back to top$/i), 'Back to top button', /data-to-top/],
];
const HEADINGS = new Map([
  ['about us', ['Ministry › About Us', '/ministry/about-us/']],
  ['divisions', ['Ministry › Our Divisions', '/ministry/our-divisions/']],
  ['it initiatives', ['Offerings › Portals & Online Services', '/offerings/portals/']],
  ['sanction orders', ['Documents › Sanction Orders', '/documents/sanction-orders/']],
]);
const DEAD = /^(#.*|javascript:.*|)$/i;
// Links of the new home page by their text, to say where an old dead link's label now leads.
const homeByText = new Map();
for (const { node } of anchors(homeDoc)) for (const n of names(node)) if (!homeByText.has(n.toLowerCase())) homeByText.set(n.toLowerCase(), attr(node, 'href'));

// ---------------------------------------------------------------- compare
const rows = [];
for (const it of oldItems) {
  const r = { ...it, status: '', new_destination: '', clicks: '', route: '', hindi: '', note: '' };
  const fn = FUNCTIONAL.find(([test]) => test(it));
  const heading = it.names.map((n) => HEADINGS.get(n.toLowerCase())).find(Boolean);
  if (fn) {
    r.new_destination = fn[1];
    r.status = fn[2].test(homeHtml) ? 'In menus' : 'Missing';
    if (r.status === 'In menus') { r.clicks = 1; r.route = 'Header or footer'; }
  } else if (heading && DEAD.test(it.href.trim())) {
    const [where, p] = heading;
    r.new_destination = p;
    r.status = menuLinks.has(pageKey(p)) ? 'In menus' : 'Missing';
    if (r.status === 'In menus') { r.clicks = 1; r.route = `Menu › ${where}`; }
  } else if (DEAD.test(it.href.trim())) {
    r.status = 'Dead on old site';
    r.note = `The old link went nowhere ("${it.href || 'no href'}")`;
    const now = [it.label, ...it.names].map((n) => homeByText.get(n.toLowerCase())).find(Boolean);
    if (now) { r.new_destination = now; r.note += `; the new home page links "${it.label}" to ${now}`; }
  } else {
    const c = canon(it.href, OLD_HOME);
    let k = c ? linkKey(c) : null;
    // Old .aspx pages go through the map of old addresses; moved external sites to where they went.
    if (c?.own && /\.aspx$/i.test(c.path)) {
      const page = c.path.replace(/^\//, '').toLowerCase();
      if (held.has(page)) { r.status = 'Held'; r.new_destination = 'old page, linked until migrated'; }
      else if (redirects.has(page)) { r.new_destination = redirects.get(page); k = pageKey(r.new_destination.split('#')[0]); }
    } else if (c && !c.own && MOVED.has(c.key)) {
      const m = MOVED.get(c.key);
      k = `ext:${m.to}`;
      r.note = m.note;
      r.new_destination = extUrl.get(k) ?? '';
    } else if (c) r.new_destination = c.own ? c.path : c.url;
    const near = k && nearest(k);
    // Same website: the old link went to a page at the root of another site (such as
    // pib.gov.in/indexd.aspx) and the new site links that site's home page. Sub-sites such as
    // adiprasaran.tribal.gov.in/jjgd/ need their own link.
    const rootPage = k?.startsWith('ext:') && /^[^/]+\/[^/]+\.[a-z]+$/i.test(k.slice(4));
    const sameHost = rootPage && linkedFrom.has(`ext:${hostOf(k)}`) ? `ext:${hostOf(k)}` : null;
    if (!k) { r.status = 'Missing'; r.note = 'Destination not recognised'; }
    else if (LEFT_OUT.has(k)) { r.status = 'Left out'; r.note = LEFT_OUT.get(k); }
    else if (r.status === 'Held') { if (near) { r.clicks = depth.get(near) + 1; r.route = route(near); } }
    else if (menuLinks.has(k)) {
      r.status = MOVED.get(c.key)?.same ? 'Same website' : 'In menus'; r.clicks = 1; r.route = 'Header or footer';
      if (logoOnly.get(k)) {
        r.route = 'Header co-branding logo';
        r.note = [r.note, `The logo shows on screens 1024 px and wider${near ? `; on smaller screens ${depth.get(near) + 1} clicks: ${route(near)}` : '; not linked elsewhere'}`].filter(Boolean).join('. ');
      }
    }
    else if (near) { r.status = MOVED.get(c.key)?.same ? 'Same website' : 'On a page'; r.clicks = depth.get(near) + 1; r.route = route(near); }
    else if (sameHost && nearest(sameHost)) {
      r.status = 'Same website';
      r.new_destination = extUrl.get(sameHost);
      r.note = `The new site links ${extUrl.get(sameHost)}; the old link went to ${c.url}`;
      r.clicks = menuLinks.has(sameHost) ? 1 : depth.get(nearest(sameHost)) + 1;
      r.route = menuLinks.has(sameHost) ? 'Header or footer' : route(nearest(sameHost));
    } else {
      r.status = 'Missing';
      if (k.startsWith('own:') && /\/$/.test(r.new_destination) && await exists(r.new_destination)) r.note = `Page ${r.new_destination} exists but nothing links to it`;
    }
    // Pages have a Hindi twin at /hi/…; documents and other websites do not.
    const pagePath = r.new_destination.split('#')[0];
    if (pagePath.startsWith('/') && pagePath.endsWith('/')) r.hindi = (await exists(`/hi${pagePath}`)) ? 'Yes' : 'No';
  }
  rows.push(r);
}

// ---------------------------------------------------------------- output
await fs.mkdir(OUT, { recursive: true });
const csv = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const head = ['kind', 'region', 'group', 'label', 'href', 'status', 'new_destination', 'clicks', 'route', 'hindi', 'note'];
for (const r of rows) delete r.names;
await fs.writeFile(path.join(OUT, 'nav-parity.csv'), [head.join(','), ...rows.map((r) => head.map((h) => csv(r[h])).join(','))].join('\n') + '\n');
const STATUSES = ['In menus', 'On a page', 'Same website', 'Held', 'Left out', 'Dead on old site', 'Missing'];
const tally = (kind) => {
  const of = rows.filter((r) => r.kind === kind);
  const t = { items: of.length };
  for (const s of STATUSES) t[s] = of.filter((r) => r.status === s).length;
  t.maxClicks = Math.max(0, ...of.map((r) => Number(r.clicks) || 0));
  return t;
};
const summary = { generated: new Date().toISOString(), oldPage: arg('--from') ? path.basename(arg('--from')) : OLD_HOME, newPages: pages.size, navigation: tally('navigation'), content: tally('content') };
await fs.writeFile(path.join(OUT, 'nav-parity.json'), JSON.stringify({ summary, rows }, null, 1) + '\n');
console.log(JSON.stringify(summary));
for (const r of rows.filter((x) => x.status !== 'In menus')) {
  console.log(`${r.kind === 'content' ? '(content) ' : ''}${r.status.padEnd(16)} | ${r.region} | ${r.group ? `${r.group} › ` : ''}${r.label} | ${r.clicks ? `${r.clicks} clicks: ${r.route}` : ''}${r.note ? ` | ${r.note}` : ''}`);
}
process.exitCode = summary.navigation.Missing ? 1 : 0;
