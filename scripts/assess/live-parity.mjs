// Checks that every component of the live home page (https://tribal.gov.in/Home.aspx,
// inventoried on 05 Oct 2026) is present in the new build, and records where it now sits.
// Reads the built site only (dist/), so it runs offline.
//
//   npm run build && node scripts/assess/live-parity.mjs
// Writes docs/Evidence/assessment/live-parity.csv and live-parity.json (or to --out <folder>).
// Since 6 Oct 2026 the link-by-link check is scripts/assess/nav-parity.mjs (npm run check:nav):
// it reads the old page itself, so it also finds links this hand-made list leaves out.

import fs from 'node:fs/promises';
import path from 'node:path';
import { EVIDENCE } from '../paths.mjs';

const dist = path.resolve('dist');
const cache = new Map();
const page = async (p) => {
  if (!cache.has(p)) cache.set(p, await fs.readFile(path.join(dist, p.replace(/^\//, ''), p.endsWith('.html') ? '' : 'index.html'), 'utf8').catch(() => ''));
  return cache.get(p);
};
const has = (p, ...needles) => async () => { const h = await page(p); return needles.every((n) => (n instanceof RegExp ? n.test(h) : h.includes(n))); };
const exists = (...paths) => async () => (await Promise.all(paths.map(page))).every(Boolean);
const all = (...checks) => async () => (await Promise.all(checks.map((c) => c()))).every(Boolean);
const count = async (p, re) => ((await page(p)).match(re) || []).length;

const DIVISIONS = ['scholarship', 'tri-research-media', 'tribal-health', 'emrs', 'livelihood', 'grants', 'ngo', 'forest-rights-act', 'stc-monitoring',
  'constitutional-legal-matters', 'parliament-coordination', 'establishment', 'vigilance', 'statistics', 'finance', 'official-language'];
const PORTALS = ['tribexdigital.org.in', 'tritribal.gov.in', 'dbttribal.gov.in', 'fellowship.tribal.gov.in', 'overseas.tribal.gov.in', 'ngo.tribal.gov.in',
  'forestrights.nic.in', 'stcmis.gov.in', 'statetsp.tribal.gov.in', 'scdiec.tribal.gov.in', 'grants.tribal.gov.in', 'repository.tribal.gov.in',
  'tribal.nic.in/repository', 'thespringsportal.org', 'tribal.gov.in/mtad', 'adiprasaran.tribal.gov.in', 'adiprasaran.tribal.gov.in/jjgd/', 'nests.tribal.gov.in', 'shramshakti.tribal.gov.in', 'swasthya.tribal.gov.in'];
const INITIATIVES = ['performance-dashboard', 'geet', 'goal', 'pri-awareness', 'swasthya-portal', 'sickle-cell', 'ice-stupa', 'model-village', '1000-springs', 'telemedicine', 'gap-analysis', 'atmanirbhar-bharat'];
const PARTNERS = ['india.gov.in', 'indiacode.nic.in', 'digitalindia.gov.in', 'ngodarpan.gov.in', 'voters.eci.gov.in', 'tribesindia.com', 'utsav.gov.in', 'bhuvan', 'ncst.nic.in', 'nstfdc.tribal.gov.in', 'data.gov.in', 'mygov.in', 'pib.gov.in'];

// [area, live component, where it is now, status, check]
const items = [
  ['Top bar', 'Back to top', 'Back-to-top button on every page', 'Included', has('/', 'data-to-top')],
  ['Top bar', 'Skip to Main', 'Skip link, first in tab order', 'Included', has('/', 'class="skip-link"')],
  ['Top bar', 'Screen Reader Access', 'Top bar link to /screen-reader-access/', 'Included', has('/', 'href="/screen-reader-access/"')],
  ['Top bar', 'Text size A- / A / A+', 'Top bar text-size buttons and Accessibility options panel', 'Included', has('/', 'data-text-step="-1"', 'data-text-step="1"')],
  ['Top bar', 'Contrast buttons', 'Top bar high-contrast toggle; dark and contrast themes in the panel', 'Included', has('/', 'data-contrast-toggle')],
  ['Top bar', 'Social media pop-up (Facebook, Instagram)', 'Footer "Follow us" and Citizen Engagement section (DBIM A.4.1.2 xi)', 'Included (moved)', has('/', 'facebook.com/TribalAffairsIn', 'instagram.com/tribalaffairsin')],
  ['Top bar', 'Site search', 'Search bar in the header, with voice search', 'Included', has('/', 'data-site-search')],
  ['Top bar', 'Sitemap icon', 'Sitemap link in the footer (DBIM 5.6)', 'Included (moved)', has('/', 'href="/sitemap/"')],
  ['Top bar', 'हिन्दी link', 'Language menu (English / हिन्दी) to the same page in Hindi', 'Included', has('/', 'data-lang-switch="hi"')],
  ['Header', 'MoTA logo (emblem, Hindi and English name)', 'Logo lockup 2: State Emblem, Government of India, Ministry name', 'Included', has('/', 'class="brand"')],
  ['Header', 'Azadi Ka Amrit Mahotsav logo', 'Header co-branding slot (DBIM 5.4, at most two)', 'Included', has('/', 'cobrand/azadi-ka-amrit-mahotsav.png')],
  ['Header', '150 years Janjatiya Gaurav logo', 'Header co-branding slot (DBIM 5.4, at most two)', 'Included', has('/', 'cobrand/janjatiya-gaurav-varsh-150.png')],
  ['Menu', 'Home', 'Home icon in the main menu', 'Included', has('/', 'mainnav__home')],
  ['Menu', 'About us › About the Ministry', 'Ministry › About Us', 'Included', exists('/ministry/about-us/')],
  ['Menu', 'About us › Organisational Chart (PDF)', 'Ministry › Our Team (interactive organogram and the PDF)', 'Included', has('/ministry/our-team/', 'Orgchart')],
  ['Menu', 'About us › Work Allocation (PDF)', 'Ministry › About Us and Our Team', 'Included', has('/ministry/about-us/', 'Workallocation')],
  ['Menu', 'About us › Channel of submission & Level of disposal (PDF)', 'Ministry › About Us', 'Included', has('/ministry/about-us/', 'levelofdisposal')],
  ['Menu', "About us › Citizen's / Client's Charter (PDF)", 'Ministry › About Us; Connect › Grievance Redressal; home Ministry section', 'Included', has('/ministry/about-us/', 'CitizensCharter')],
  ['Menu', 'Divisions (16 divisions)', 'Ministry › Our Divisions, one page each', 'Included', exists(...DIVISIONS.map((d) => `/ministry/our-divisions/${d}/`))],
  ['Menu', 'Divisions › PM-JANMAN, DA-JGUA', 'Offerings › Schemes and Services', 'Included (moved)', exists('/offerings/schemes/pm-janman/', '/offerings/schemes/da-jgua/')],
  ['Menu', 'Divisions › NCST, NSTFDC', 'Ministry › Our Organisations', 'Included (moved)', exists('/ministry/our-organisations/ncst/', '/ministry/our-organisations/nstfdc/')],
  ['Menu', 'Dashboard', 'Ministry › Our Performance and Offerings › Initiatives', 'Included (moved)', has('/ministry/our-performance/', 'dashboard.tribal.gov.in')],
  ['Menu', 'IT Initiatives (19 portals)', 'Offerings › Portals & Online Services', 'Included (moved)', has('/offerings/portals/', ...PORTALS)],
  ['Menu', 'Knowledge Hub', 'Documents › Knowledge Hub', 'Included', exists('/documents/knowledge-hub/')],
  ['Menu', 'Adi Karmayogi', 'Offerings › Initiatives › Adi Karmayogi', 'Included', exists('/offerings/initiatives/adi-karmayogi/')],
  ['Menu', 'JJGU (Janjatiya Garima Utsav portal)', 'Offerings › Portals; linked from the JGU home banners', 'Included', all(has('/offerings/portals/', 'adiprasaran.tribal.gov.in/jjgu/'), has('/', 'adiprasaran.tribal.gov.in/jjgu/'))],
  ['Menu', 'JJGD (Janjatiya Gaurav Varsh site; the live menu since the source copy, which has JJGU)', 'Header co-branding logo (screens 1024 px and wider) and Offerings › Portals', 'Included', all(has('/', 'adiprasaran.tribal.gov.in/jjgd/'), has('/offerings/portals/', 'adiprasaran.tribal.gov.in/jjgd/'))],
  ['Menu', 'Review Meeting', 'Ministry › Our Performance › State Review Meetings', 'Included', all(exists('/ministry/our-performance/state-review-meetings/'), has('/ministry/our-performance/state-review-meetings/', 'stcmis.gov.in'))],
  ['Menu', 'Sanction Orders (2017-18 to 2026-27, Archive)', 'Documents › Sanction Orders, by financial year', 'Included', async () => (await count('/documents/sanction-orders/', /PFMS_SentionDtSchemewise/g)) >= 10],
  ['Menu', 'Contact Us', 'Connect › Contact Us', 'Included', exists('/connect/contact-us/')],
  ['Home', 'Banner slider (TribeX, 12 Saal, JGU ×5, Bharat Innovates)', 'Banner carousel, same slides and order, with pause control', 'Included', has('/', 'tribex', 'bharat-innovates', 'jgu-2026-themes', '12-saal')],
  ['Home', 'Central campaign banner (MyGov CCPS)', 'First slide of the carousel (DBIM A.4.1.2 ii)', 'Included', has('/', 'data-ccps', 'cbpssubscriber.mygov.in')],
  ['Home', 'Scrolling marquee (NOS last date extended)', 'Announcements ticker, pausable (WCAG 2.2.2)', 'Included', has('/', 'National Overseas Scholarship (NOS)')],
  ['Home', 'About the Ministry with Minister and MoS photos (Sansad profiles)', 'Ministry section on the home page', 'Included', has('/', 'sansad.in/ls/members/biography/279', 'sansad.in/ls/members/biography/5057')],
  ['Home', "What's New tile with latest two notices", "What's New list and link to all updates", 'Included', has('/', 'href="/whats-new/"', 'GEM/2026/B/7541452')],
  ['Home', 'Twitter (X) timeline', 'Citizen Engagement; posts load after cookie consent (DBIM 7.6)', 'Included', has('/', 'TribalAffairsIn')],
  ['Home', 'Facebook page plug-in', 'Citizen Engagement; loads after cookie consent', 'Included', has('/', 'facebook.com/TribalAffairsIn')],
  ['Home', 'Divisions & Schemes tiles (15)', 'Divisions tiles on the home page, incl. NCST and Policy & Grievances', 'Included', all(has('/', 'href="/ministry/our-organisations/ncst/"', 'href="/connect/grievance-redressal/"'), has('/', ...DIVISIONS.map((d) => `/ministry/our-divisions/${d}/`)))],
  ['Home', 'Innovative Initiatives (12)', 'Initiatives section on the home page and Offerings › Initiatives', 'Included', exists(...INITIATIVES.map((i) => `/offerings/initiatives/${i}/`))],
  ['Home', 'Related portals logo carousel (13)', 'Logo carousel above the footer (DBIM A.4.1.2 xiv); NVSP now links to its replacement, voters.eci.gov.in', 'Included', has('/', ...PARTNERS)],
  ['Footer', 'Public Grievances', 'Footer › Connect › Grievance Redressal', 'Included', has('/', 'href="/connect/grievance-redressal/"')],
  ['Footer', 'RTI', 'Footer › Connect › RTI', 'Included', has('/', 'href="/connect/rti/"')],
  ['Footer', 'Website Policy', 'Footer › Website Policies (13 policies)', 'Included', has('/', 'href="/policies/"')],
  ['Footer', 'Copyright Policy', 'Footer policy links', 'Included', has('/', 'href="/policies/copyright-policy/"')],
  ['Footer', 'FAQ (PDF)', 'Footer utility links, with file type and size', 'Included', has('/', 'downloads/tribal/FAQ.pdf')],
  ['Footer', 'Related Websites', 'Footer › Related Links', 'Included', has('/', 'href="/related-links/"')],
  ['Footer', 'Tenders, Vacancies & Advertisement', 'Footer › Offerings › Tenders, Vacancies', 'Included', has('/', 'href="/offerings/tenders/"', 'href="/offerings/vacancies/"')],
  ['Footer', 'Web Information Manager', 'Footer link to the WIM in Connect › Contact Us › Key contacts', 'Included', all(has('/', '#web-information-manager'), has('/connect/contact-us/', 'id="web-information-manager"'))],
  ['Footer', 'Feedback', 'Footer › Feedback', 'Included', has('/', 'href="/connect/feedback/"')],
  ['Footer', 'Disclaimer', 'Footer policy links', 'Included', has('/', 'href="/policies/disclaimer/"')],
  ['Footer', 'Help', 'Footer › Help', 'Included', has('/', 'href="/help/"')],
  ['Footer', 'Footer social icons (Instagram, X, YouTube, Facebook)', 'Footer "Follow us"', 'Included', has('/', 'social__link')],
  ['Footer', 'Content owned by MoTA; designed, developed and hosted by NIC', 'Footer lineage (DBIM 5.6)', 'Included', has('/', 'site-footer__lineage')],
  ['Footer', 'Last Updated date', 'Footer and every inner page', 'Included', has('/', 'site-footer__stamp')],
  ['Footer', 'STQC certificate (PDF)', 'Footer badge; shown automatically while the certificate set in site.ts is valid', 'Ready — hidden until the renewed certificate is added (2023 certificate expired 12 Feb 2026)', async () => true],
  ['Footer', 'Visitor count', 'Footer counter; shown when a counter endpoint is configured in site.ts', 'Ready — needs a counter endpoint from NIC', has('/', 'data-visitor-count')],
  ['Footer', '"Built on CMF" logo', '—', 'Not carried over: the new site is not built on NIC’s Common Minimum Framework, so the claim would be wrong', async () => true],
  ['Floating', 'Social media side bar (Facebook, X, YouTube, Instagram)', 'Footer "Follow us" and Citizen Engagement; no floating bar, so content is never covered', 'Included (moved)', has('/', 'social__link')],
  ['Floating', 'TriBot chat assistant', 'Floating button, bottom right; same TriBot service through /tribot-api/ (IIS forward); site-search answers if the service is down', 'Included — connect the service on NIC staging', all(has('/', 'data-tribot', 'data-endpoint="/tribot-api/chat"'), has('/hi/', 'data-tribot'))],
];

const rows = [];
for (const [area, live, now, status, check] of items) {
  const ok = await check();
  rows.push({ area, live, now, status, check: ok ? 'Pass' : 'Fail' });
}
const outArg = process.argv.indexOf('--out');
const out = outArg > 0 ? path.resolve(process.argv[outArg + 1]) : path.join(EVIDENCE, 'assessment');
await fs.mkdir(out, { recursive: true });
const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
await fs.writeFile(path.join(out, 'live-parity.csv'), ['#,Area,Component on tribal.gov.in/Home.aspx,Where it is in the new site,Status,Check', ...rows.map((r, i) => [i + 1, r.area, r.live, r.now, r.status, r.check].map(q).join(','))].join('\n') + '\n');
await fs.writeFile(path.join(out, 'live-parity.json'), JSON.stringify({ checkedAt: new Date().toISOString(), source: 'https://tribal.gov.in/Home.aspx', rows }, null, 1));
const fails = rows.filter((r) => r.check === 'Fail');
console.log(`${rows.length} live components checked, ${rows.length - fails.length} pass${fails.length ? `; FAIL: ${fails.map((f) => f.live).join(' | ')}` : ''}`);
process.exit(fails.length ? 1 : 0);
