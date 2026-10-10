// GIGW 3.0 / DBIM 3.0 technical assessment of one or more websites.
//
// Non-intrusive: it only loads public pages like a browser, reads response
// headers and performs a TLS handshake. No forms are submitted, nothing is fuzzed.
//
//   node scripts/assess/audit.mjs [--targets scripts/assess/targets.json] [--out DIR] [--lighthouse] [--only id1,id2]
//   (default --out: docs/Evidence/assessment/raw)
//
// Writes <out>/results.json, <out>/summary.csv and screenshots in <out>/shots/.

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer-core';
import { EVIDENCE } from '../paths.mjs';

const run = promisify(execFile);
const require = createRequire(import.meta.url);
const axeSource = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const targetsFile = arg('--targets', 'scripts/assess/targets.json');
const outDir = arg('--out', path.join(EVIDENCE, 'assessment', 'raw'));
const withLighthouse = args.includes('--lighthouse');
const only = arg('--only', '')?.split(',').filter(Boolean);
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

// DBIM primary palette: key (darkest) colour of each colour group.
const DBIM_GROUPS = {
  'Group 1 (magenta)': '#6C1340', 'Group 2 (teal)': '#0F5757', 'Group 3 (mustard)': '#5D3E00', 'Group 4 (red)': '#771D1D',
  'Group 5 (blue)': '#162F6A', 'Group 6 (violet)': '#29136C', 'Group 7 (green)': '#1E3F0D', 'Group 8 (brown)': '#412B0B',
  'Group 9 (terracotta)': '#3E170E', 'Group 10 (cyan)': '#006B7A', 'Neutral (grey)': '#22242A',
};

let targets = JSON.parse(await fs.readFile(targetsFile, 'utf8'));
if (only?.length) targets = targets.filter((t) => only.includes(t.id));
await fs.mkdir(path.join(outDir, 'shots'), { recursive: true });

// ------------------------------------------------------------------ helpers
async function sh(cmd, a, timeout = 30000) {
  try { const { stdout, stderr } = await run(cmd, a, { timeout, maxBuffer: 8 * 1024 * 1024 }); return stdout + stderr; }
  catch (e) { return (e.stdout || '') + (e.stderr || '') + String(e.message || ''); }
}

async function headersOf(url) {
  const out = await sh('curl', ['-s', '-I', '-L', '-m', '25', '-A', UA, '-H', 'Accept: text/html', url]);
  const blocks = out.trim().split(/\r?\n\r?\n/).filter((b) => /^HTTP\//.test(b.trim()));
  const last = blocks.at(-1) || '';
  const headers = {};
  const cookies = [];
  for (const line of last.split(/\r?\n/).slice(1)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim().toLowerCase();
    const v = line.slice(i + 1).trim();
    if (k === 'set-cookie') cookies.push(v); else headers[k] = headers[k] ? `${headers[k]}, ${v}` : v;
  }
  return { status: Number((last.match(/^HTTP\/[\d.]+\s+(\d+)/) || [])[1] || 0), redirects: blocks.length - 1, headers, cookies };
}

async function httpRedirect(host) {
  const out = await sh('curl', ['-s', '-o', '/dev/null', '-m', '20', '-A', UA, '-w', '%{http_code} %{redirect_url}', `http://${host}/`]);
  const [code, loc = ''] = out.trim().split(' ');
  return { code: Number(code) || 0, toHttps: loc.startsWith('https://') };
}

async function tls(host) {
  const res = { protocol: '', chainComplete: null, verify: '', subject: '', issuer: '', notAfter: '', daysLeft: null, tls13: false, tls10: false, tls11: false };
  const s = await sh('sh', ['-c', `echo | openssl s_client -connect ${host}:443 -servername ${host} 2>&1`], 30000);
  res.protocol = (s.match(/Protocol\s*:\s*(\S+)/) || [])[1] || '';
  res.verify = (s.match(/Verify return code: (\d+ \([^)]*\))/) || [])[1] || '';
  res.chainComplete = /Verify return code: 0 /.test(s) ? true : /Verify return code: (20|21) /.test(s) ? false : null;
  const cert = await sh('sh', ['-c', `echo | openssl s_client -connect ${host}:443 -servername ${host} 2>/dev/null | openssl x509 -noout -subject -issuer -enddate`], 30000);
  res.subject = ((cert.match(/subject=(.*)/) || [])[1] || '').trim();
  res.issuer = ((cert.match(/issuer=(.*)/) || [])[1] || '').trim();
  res.notAfter = ((cert.match(/notAfter=(.*)/) || [])[1] || '').trim();
  if (res.notAfter) res.daysLeft = Math.round((new Date(res.notAfter) - Date.now()) / 86400000);
  const probe = async (flag) => /Cipher is (?!\(NONE\))/.test(await sh('sh', ['-c', `echo | openssl s_client -connect ${host}:443 -servername ${host} ${flag} -cipher 'DEFAULT@SECLEVEL=0' 2>&1`], 20000));
  res.tls13 = /Cipher is (?!\(NONE\))/.test(await sh('sh', ['-c', `echo | openssl s_client -connect ${host}:443 -servername ${host} -tls1_3 2>&1`], 20000));
  res.tls10 = await probe('-tls1');
  res.tls11 = await probe('-tls1_1');
  return res;
}

function securityHeaders(h) {
  const xcto = (h['x-content-type-options'] || '').trim();
  return {
    hsts: h['strict-transport-security'] || '',
    csp: h['content-security-policy'] || '',
    xfo: h['x-frame-options'] || '',
    xcto,
    xctoValid: /^nosniff$/i.test(xcto),
    referrer: h['referrer-policy'] || '',
    permissions: h['permissions-policy'] || '',
    server: h['server'] || '',
    poweredBy: [h['x-powered-by'], h['x-aspnet-version'], h['x-aspnetmvc-version']].filter(Boolean).join(' / '),
  };
}

function hexToRgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function nearestGroup(rgb) {
  if (!rgb) return '';
  let best = '', bd = Infinity;
  for (const [name, hex] of Object.entries(DBIM_GROUPS)) {
    const [r, g, b] = hexToRgb(hex);
    const d = Math.hypot(rgb[0] - r, rgb[1] - g, rgb[2] - b);
    if (d < bd) { bd = d; best = name; }
  }
  return bd < 60 ? best : `none (closest ${best}, distance ${Math.round(bd)})`;
}

// In-page checks (runs in the browser)
function pageChecks() {
  const q = (s) => document.querySelector(s);
  const qa = (s) => Array.from(document.querySelectorAll(s));
  const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
  const links = qa('a[href]').map((a) => ({ t: (a.innerText || a.getAttribute('aria-label') || a.title || '').trim().toLowerCase(), h: a.getAttribute('href') || '' }));
  const hasLink = (re) => links.some((l) => re.test(l.t) || re.test(l.h));
  const meta = (n) => q(`meta[name="${n}" i]`)?.getAttribute('content') || '';
  const cs = (el, p) => (el ? getComputedStyle(el)[p] : '');
  const parseRgb = (c) => { const m = (c || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/); return m && (m[4] === undefined || Number(m[4]) > 0.5) ? [Number(m[1]), Number(m[2]), Number(m[3])] : null; };
  const firstBg = (els) => { for (const el of els) { let e = el; while (e) { const c = parseRgb(cs(e, 'backgroundColor')); if (c && !(c[0] > 245 && c[1] > 245 && c[2] > 245)) return c; e = e.firstElementChild; } } return null; };
  const header = q('header, [role="banner"], #header, .header, .top-header, nav');
  const footer = q('footer, [role="contentinfo"], #footer, .footer');
  const heading = q('h1') || q('h2');
  const navLink = q('nav a, header a, .navbar a');
  const imgs = qa('img');
  const iconFonts = qa('i[class*="fa-"], span[class*="fa-"], .material-icons, .material-symbols-outlined, [class*="icofont"], [class*="ri-"]').length;
  return {
    lang: document.documentElement.getAttribute('lang') || '',
    title: document.title,
    description: meta('description'),
    keywords: meta('keywords'),
    viewport: meta('viewport'),
    canonical: q('link[rel="canonical"]')?.getAttribute('href') || '',
    hreflang: qa('link[rel="alternate"][hreflang]').length,
    ogTitle: q('meta[property="og:title"]')?.getAttribute('content') || '',
    h1Count: qa('h1').length,
    skipLink: hasLink(/skip to (main )?content|मुख्य सामग्री/),
    emblem: imgs.some((i) => /emblem|ashoka|satyamev|राजचिह्न|national emblem|logo/i.test(`${i.alt} ${i.src}`)) || /satyamev/i.test(document.body.innerHTML.slice(0, 20000)),
    govOfIndia: /government of india|भारत सरकार/i.test(text.slice(0, 3000)),
    hindiSwitch: hasLink(/हिन्दी|हिंदी|hindi/) || qa('select option, button').some((o) => /हिन्दी|हिंदी|hindi/i.test(o.textContent || '')),
    textResize: qa('a, button, input').some((e) => /^a[\s+−-]*$|^a\+$|^a-$|^a$|font|text size|बढ़ाएं|increase/i.test((e.textContent || e.value || e.getAttribute('aria-label') || '').trim())),
    contrastToggle: qa('a, button').some((e) => /contrast|dark|कंट्रास्ट/i.test(`${e.textContent} ${e.title} ${e.getAttribute('aria-label') || ''} ${e.className}`)),
    screenReaderPage: hasLink(/screen ?reader/),
    search: Boolean(q('input[type="search"], input[name*="search" i], input[id*="search" i], input[placeholder*="search" i], [role="search"]')),
    sitemapLink: hasLink(/sitemap|site map|साइटमैप/),
    feedbackLink: hasLink(/feedback|प्रतिक्रिया/),
    helpLink: hasLink(/^help$|\/help|सहायता/),
    contactLink: hasLink(/contact|संपर्क/),
    policyLinks: ['privacy', 'copyright', 'hyperlink', 'terms', 'disclaimer'].filter((p) => hasLink(new RegExp(p))).length,
    lastUpdated: /last (updated|reviewed|modified)|अंतिम अद्यतन|last update/i.test(text),
    nationalPortalLink: links.some((l) => /india\.gov\.in/.test(l.h)),
    socialLinks: ['twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'youtube.com'].filter((d) => links.some((l) => l.h.includes(d))).length,
    cookieBanner: /cookie/i.test(text) && qa('button').some((b) => /accept|reject|cookie/i.test(b.textContent || '')),
    lineage: /(website|site) (belongs to|is (owned|maintained))|content (owned|provided) by|this is the official/i.test(text),
    fontBody: cs(document.body, 'fontFamily'),
    fontHeading: cs(heading, 'fontFamily'),
    fontNav: cs(navLink, 'fontFamily'),
    headerRgb: firstBg([header].filter(Boolean)),
    footerRgb: firstBg([footer].filter(Boolean)),
    linkRgb: parseRgb(cs(q('main a, #main a, .content a, a'), 'color')),
    iconFonts,
    svgIcons: qa('svg').length,
    imagesWithoutAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
    brokenImages: imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.src).length,
    httpResources: [...qa('[src]'), ...qa('link[href]')].map((e) => e.getAttribute('src') || e.getAttribute('href')).filter((u) => /^http:\/\//i.test(u || '')).length,
    externalLinksNewTab: qa('a[target="_blank"]').length,
    generator: meta('generator'),
  };
}

async function auditTarget(browser, t) {
  const r = { id: t.id, name: t.name, url: t.url, category: t.category, checkedAt: new Date().toISOString() };
  const host = new URL(t.url).hostname;
  const isLocal = /^(localhost|127\.)/.test(host);
  // Server side
  const hdr = await headersOf(t.url);
  r.status = hdr.status;
  r.security = securityHeaders(t.securityHeadersFrom ? JSON.parse(await fs.readFile(t.securityHeadersFrom, 'utf8')) : hdr.headers);
  r.cookies = hdr.cookies.map((c) => ({ name: c.split('=')[0], secure: /;\s*secure/i.test(c), httpOnly: /;\s*httponly/i.test(c), sameSite: (c.match(/samesite=(\w+)/i) || [])[1] || '' }));
  if (!isLocal) {
    r.httpToHttps = await httpRedirect(host);
    r.tls = await tls(host);
  }
  // Browser checks: desktop
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({ width: 1366, height: 900 });
  const consoleErrors = [];
  const failed = [];
  let bytes = 0; let requests = 0; const thirdParty = new Set();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
  page.on('requestfailed', (q) => failed.push(`${q.failure()?.errorText} ${q.url().slice(0, 120)}`));
  page.on('response', async (res) => {
    requests++;
    try {
      const u = new URL(res.url());
      if (!u.hostname.endsWith(host.split('.').slice(-3).join('.')) && !isLocal) thirdParty.add(u.hostname);
      if (res.status() >= 400) failed.push(`${res.status()} ${res.url().slice(0, 120)}`);
      const len = Number(res.headers()['content-length']);
      if (len) bytes += len; else { const b = await res.buffer().catch(() => null); if (b) bytes += b.length; }
    } catch { /* ignore */ }
  });
  const t0 = Date.now();
  try {
    await page.goto(t.url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) {
    r.loadError = String(e.message).slice(0, 160);
  }
  r.loadMs = Date.now() - t0;
  await new Promise((res) => setTimeout(res, 1200));
  try {
    r.page = await page.evaluate(pageChecks);
    r.page.headerGroup = nearestGroup(r.page.headerRgb);
    r.page.footerGroup = nearestGroup(r.page.footerRgb);
    r.page.notoSans = /noto sans/i.test(`${r.page.fontBody} ${r.page.fontHeading}`);
    await page.evaluate(axeSource);
    const axe = await page.evaluate(async () => {
      const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] });
      return res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
    });
    r.axe = { violations: axe.length, nodes: axe.reduce((n, v) => n + v.nodes, 0), critical: axe.filter((v) => v.impact === 'critical').length, serious: axe.filter((v) => v.impact === 'serious').length, rules: axe };
    await page.screenshot({ path: path.join(outDir, 'shots', `${t.id}-desktop.jpg`), type: 'jpeg', quality: 70 });
  } catch (e) {
    r.evalError = String(e.message).slice(0, 160);
  }
  r.transferKB = Math.round(bytes / 1024);
  r.requests = requests;
  r.consoleErrors = consoleErrors.slice(0, 8);
  r.failedRequests = failed.slice(0, 12);
  r.failedCount = failed.length;
  r.thirdParty = [...thirdParty].slice(0, 15);
  await page.close();

  // Mobile
  const m = await browser.newPage();
  await m.setUserAgent(UA.replace('Macintosh; Intel Mac OS X 10_15_7', 'Linux; Android 13; Pixel 7') + ' Mobile');
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  try {
    await m.goto(t.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((res) => setTimeout(res, 800));
    r.mobile = await m.evaluate(() => {
      const before = window.scrollX;
      window.scrollTo(400, 0);
      const canScrollX = window.scrollX > before;
      window.scrollTo(0, 0);
      const vp = document.querySelector('meta[name="viewport"]')?.content || '';
      const tiny = Array.from(document.querySelectorAll('p, li, a, span, td')).slice(0, 400).filter((e) => e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 11).length;
      return { horizontalScroll: canScrollX, docWidth: document.documentElement.scrollWidth, viewportMeta: vp, tinyText: tiny };
    });
    await m.screenshot({ path: path.join(outDir, 'shots', `${t.id}-mobile.jpg`), type: 'jpeg', quality: 70 });
  } catch (e) {
    r.mobile = { error: String(e.message).slice(0, 120) };
  }
  await m.close();

  // Lighthouse (mobile preset)
  if (withLighthouse && !r.loadError) {
    try {
      const { default: lighthouse } = await import('lighthouse');
      const port = Number(new URL(browser.wsEndpoint()).port);
      const lh = await lighthouse(t.url, { port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
      const c = lh.lhr.categories;
      const a = lh.lhr.audits;
      r.lighthouse = {
        performance: Math.round(c.performance.score * 100), accessibility: Math.round(c.accessibility.score * 100),
        bestPractices: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100),
        lcp: a['largest-contentful-paint']?.displayValue, cls: a['cumulative-layout-shift']?.displayValue,
        tbt: a['total-blocking-time']?.displayValue, fcp: a['first-contentful-paint']?.displayValue,
      };
    } catch (e) {
      r.lighthouse = { error: String(e.message).slice(0, 160) };
    }
  }
  return r;
}

// ------------------------------------------------------------------ main
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const results = [];
for (const t of targets) {
  process.stdout.write(`• ${t.id} … `);
  if (t.unreachable) { results.push({ ...t, status: 0, note: t.unreachable }); console.log('skipped (unreachable)'); continue; }
  try {
    const r = await auditTarget(browser, t);
    results.push(r);
    console.log(`status ${r.status}, axe ${r.axe?.violations ?? '?'} rules, ${r.transferKB} KB${r.lighthouse ? `, LH perf ${r.lighthouse.performance}` : ''}`);
  } catch (e) {
    results.push({ ...t, error: String(e.message).slice(0, 200) });
    console.log('error', e.message);
  }
  await fs.writeFile(path.join(outDir, 'results.json'), JSON.stringify(results, null, 1));
}
await browser.close();
await fs.writeFile(path.join(outDir, 'results.json'), JSON.stringify(results, null, 1));

// Summary CSV
const cols = [
  ['id', (r) => r.id], ['name', (r) => r.name], ['url', (r) => r.url], ['status', (r) => r.status],
  ['tls_chain_complete', (r) => r.tls?.chainComplete], ['tls13', (r) => r.tls?.tls13], ['tls10_or_11', (r) => r.tls ? r.tls.tls10 || r.tls.tls11 : ''],
  ['cert_days_left', (r) => r.tls?.daysLeft], ['http_to_https', (r) => r.httpToHttps?.toHttps],
  ['hsts', (r) => Boolean(r.security?.hsts)], ['csp', (r) => Boolean(r.security?.csp)], ['xfo', (r) => Boolean(r.security?.xfo)],
  ['xcto_valid', (r) => r.security?.xctoValid], ['referrer_policy', (r) => Boolean(r.security?.referrer)], ['permissions_policy', (r) => Boolean(r.security?.permissions)],
  ['server_banner', (r) => r.security?.server], ['powered_by', (r) => r.security?.poweredBy],
  ['lang', (r) => r.page?.lang], ['title', (r) => r.page?.title], ['meta_description', (r) => Boolean(r.page?.description)], ['viewport', (r) => Boolean(r.page?.viewport)],
  ['h1_count', (r) => r.page?.h1Count], ['skip_link', (r) => r.page?.skipLink], ['emblem', (r) => r.page?.emblem], ['gov_of_india', (r) => r.page?.govOfIndia],
  ['hindi_switch', (r) => r.page?.hindiSwitch], ['text_resize', (r) => r.page?.textResize], ['contrast', (r) => r.page?.contrastToggle], ['screen_reader_page', (r) => r.page?.screenReaderPage],
  ['search', (r) => r.page?.search], ['sitemap', (r) => r.page?.sitemapLink], ['feedback', (r) => r.page?.feedbackLink], ['help', (r) => r.page?.helpLink], ['contact', (r) => r.page?.contactLink],
  ['policy_links_of5', (r) => r.page?.policyLinks], ['last_updated', (r) => r.page?.lastUpdated], ['national_portal_link', (r) => r.page?.nationalPortalLink], ['social_links_of4', (r) => r.page?.socialLinks],
  ['cookie_banner', (r) => r.page?.cookieBanner], ['noto_sans', (r) => r.page?.notoSans], ['font_body', (r) => r.page?.fontBody], ['header_colour_group', (r) => r.page?.headerGroup], ['footer_colour_group', (r) => r.page?.footerGroup],
  ['icon_fonts', (r) => r.page?.iconFonts], ['images_without_alt', (r) => r.page?.imagesWithoutAlt], ['broken_images', (r) => r.page?.brokenImages], ['http_resources', (r) => r.page?.httpResources],
  ['mobile_horizontal_scroll', (r) => r.mobile?.horizontalScroll], ['axe_rules_violated', (r) => r.axe?.violations], ['axe_nodes', (r) => r.axe?.nodes], ['axe_critical', (r) => r.axe?.critical], ['axe_serious', (r) => r.axe?.serious],
  ['transfer_kb', (r) => r.transferKB], ['requests', (r) => r.requests], ['failed_requests', (r) => r.failedCount], ['load_ms', (r) => r.loadMs],
  ['lh_performance', (r) => r.lighthouse?.performance], ['lh_accessibility', (r) => r.lighthouse?.accessibility], ['lh_best_practices', (r) => r.lighthouse?.bestPractices], ['lh_seo', (r) => r.lighthouse?.seo], ['lcp', (r) => r.lighthouse?.lcp], ['cls', (r) => r.lighthouse?.cls],
  ['note', (r) => r.note || r.loadError || r.error || ''],
];
const csv = [cols.map((c) => c[0]).join(','), ...results.map((r) => cols.map(([, f]) => `"${String(f(r) ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
await fs.writeFile(path.join(outDir, 'summary.csv'), csv);
console.log(`\nWrote ${path.join(outDir, 'results.json')} and summary.csv`);
