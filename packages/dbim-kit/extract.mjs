// Generates the kit's HTML templates and the component gallery from the built pilot
// (tribal.gov.in prototype, ../../dist). The markup is therefore exactly what passed the
// UAT suite (axe-core, keyboard, contrast, CSP). Inline Lucide icons are swapped for
// references to the kit sprite (icons.svg) so the snippets stay small.
//
// Called by build.mjs; returns the set of icon names the templates need in the sprite.

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';

const norm = (s) => s.replace(/\s+/g, ' ').replace(/>\s+</g, '><').replace(/\s*\/>/g, '/>').replace(/<(\w+)([^>]*)><\/\1>/g, '<$1$2/>').trim();
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Za-z])([0-9])/g, '$1-$2').toLowerCase();

function walk(node, fn) {
  fn(node);
  for (const c of node.childNodes ?? []) walk(c, fn);
  if (node.content) walk(node.content, fn);
}
const attr = (n, name) => n.attrs?.find((a) => a.name === name)?.value;
const hasClass = (n, c) => (attr(n, 'class') ?? '').split(/\s+/).includes(c);

/** Source slice for the first element matching `test`. */
function find(html, doc, test) {
  let hit;
  walk(doc, (n) => { if (!hit && n.tagName && test(n)) hit = n; });
  if (!hit) return null;
  const { startOffset, endOffset } = hit.sourceCodeLocation;
  return html.slice(startOffset, endOffset);
}
const byClass = (tag, c) => (n) => n.tagName === tag && hasClass(n, c);
/** Everything between </footer> and </body> without scripts, split into dialogs and TriBot. */
function tail(html, doc) {
  const rest = html.slice(html.indexOf('</footer>') + 9, html.lastIndexOf('</body>')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  const tribot = find(html, doc, byClass('div', 'tribot')) || '';
  return { dialogs: (tribot ? rest.replace(tribot, '') : rest).trim(), tribot };
}

export async function extract({ root, kit, lucide, preferred }) {
  const site = path.join(root, 'dist');
  const read = async (p) => {
    const html = await fs.readFile(path.join(site, p), 'utf8');
    return { html, doc: parse(html, { sourceCodeLocationInfo: true }) };
  };

  // Lucide inner markup -> export name (preferring the names already in the sprite list)
  const iconByInner = new Map();
  for (const [name, raw] of Object.entries(lucide)) {
    if (typeof raw !== 'string' || !raw.includes('<svg')) continue;
    const inner = norm(raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''));
    if (!iconByInner.has(inner) || preferred.includes(name)) iconByInner.set(inner, name);
  }
  const used = new Set();
  const toSprite = (html, kitPath) => html.replace(/<svg\s([^>]*)>([\s\S]*?)<\/svg>/g, (whole, attrs, inner) => {
    const name = iconByInner.get(norm(inner));
    if (!name) return whole;
    used.add(name);
    const keep = (attrs.match(/\s?(class|role|aria-[a-z]+|focusable)="[^"]*"/g) ?? []).map((a) => a.trim()).join(' ');
    return `<svg ${keep}><use href="${kitPath}/icons.svg#i-${kebab(name)}"></use></svg>`;
  });
  const assets = (html, kitPath) => html
    .replaceAll('/images/emblem/emblem-black.png', `${kitPath}/assets/emblem-black.png`)
    .replaceAll('/images/emblem/emblem-white.png', `${kitPath}/assets/emblem-white.png`)
    .replaceAll('/images/assistant/', `${kitPath}/assets/`);

  // 1. Templates: header, footer, dialogs — English and Hindi
  const banner = (what, lang) => `<!-- MoTA DBIM Kit — ${what} (${lang === 'hi' ? 'Hindi' : 'English'}).
     Generated from the tribal.gov.in pilot by packages/dbim-kit/build.mjs; do not edit by hand.
     {{KIT}} = URL of the kit's dist folder (for example /dbim-kit). Links and names are the
     pilot's: replace the organisation name, menus and footer links with your portal's own. -->\n`;
  const tdir = path.join(kit, 'templates');
  await fs.rm(tdir, { recursive: true, force: true });
  for (const lang of ['en', 'hi']) {
    const { html, doc } = await read(lang === 'en' ? 'index.html' : 'hi/index.html');
    const skip = find(html, doc, byClass('a', 'skip-link'));
    const header = find(html, doc, byClass('header', 'site-header'))
      .replace(/ aria-current="page"/g, '').replace(/ is-active/g, '');
    // A portal shows its own last-updated date (GIGW 3.0 Annexure II, Quality S/N 5),
    // never the pilot's build date, so the date becomes a placeholder as in page.html.
    const footer = find(html, doc, byClass('footer', 'site-footer'))
      .replace(/<time datetime="[^"]*">[^<]*<\/time>/, '<time datetime="{{UPDATED_ISO}}">{{UPDATED}}</time>');
    // Everything between </footer> and the bundled scripts: dialogs, cookie bar, back-to-top, toast
    const { dialogs: after, tribot } = tail(html, doc);
    const out = path.join(tdir, lang);
    await fs.mkdir(out, { recursive: true });
    const fix = (s) => assets(toSprite(s, '{{KIT}}'), '{{KIT}}');
    await fs.writeFile(path.join(out, 'header.html'), banner('header: skip link, Government of India strip, accessibility and language controls, logo lockup, search, mega menu', lang) + fix(`${skip}\n${header}`) + '\n');
    await fs.writeFile(path.join(out, 'footer.html'), banner('footer in the key colour', lang) + fix(footer) + '\n');
    await fs.writeFile(path.join(out, 'dialogs.html'), banner('accessibility panel, external-link notice, cookie consent, back to top, status toast', lang) + fix(after) + '\n');
    await fs.writeFile(path.join(out, 'tribot.html'), banner('TriBot chat assistant (optional; needs the TriBot service behind a same-origin path, see data-endpoint)', lang) + fix(tribot) + '\n');
  }

  // 2. Inner page shell (DBIM 5.5), English and Hindi, from the About Us page of the pilot.
  //    templates/page.html and page.hi.html carry {{…}} placeholders; examples/page-en.html and
  //    page-hi.html are the same shells with the includes resolved, used to test the templates.
  const samples = [];
  for (const lang of ['en', 'hi']) {
    const src = lang === 'en' ? 'ministry/about-us/index.html' : 'hi/ministry/about-us/index.html';
    const { html, doc } = await read(src);
    const title = find(html, doc, (n) => n.tagName === 'h1').replace(/<[^>]+>/g, '').trim();
    const lead = find(html, doc, byClass('p', 'page-hero__lead')).replace(/<[^>]+>/g, '').trim();
    const content = find(html, doc, byClass('div', 'page-content__body')).replace(/^<div[^>]*>/, '').replace(/<\/div>$/, '').trim();
    const hero = find(html, doc, byClass('div', 'page-hero'))
      .replace(`<h1>${title}</h1>`, '<h1>{{PAGE_TITLE}}</h1>')
      .replace(/(<p class="page-hero__lead">)[\s\S]*?(<\/p>)/, '$1{{DESCRIPTION}}$2')
      .replace(/(<span aria-current="page">)[^<]*(<\/span>)/, '$1{{PAGE_TITLE}}$2');
    const side = find(html, doc, byClass('nav', 'side-nav'));
    const tools = find(html, doc, byClass('div', 'page-tools'))
      .replace(/<time datetime="[^"]*">[^<]*<\/time>/, '<time datetime="{{UPDATED_ISO}}">{{UPDATED}}</time>')
      .replace(/data-share="[^"]*"/, 'data-share="{{CANONICAL_URL}}"');
    const gov = lang === 'hi' ? 'भारत सरकार' : 'Government of India';
    const shell = `<!doctype html>
<!-- MoTA DBIM Kit — inner page shell (DBIM 5.5), ${lang === 'hi' ? 'Hindi' : 'English'}. Generated from the tribal.gov.in pilot.
     Replace {{…}} placeholders; put templates/${lang}/header.html, footer.html, dialogs.html (and tribot.html if used)
     where the @include comments are (MasterPage, PHP include or server-side include). -->
<html lang="${lang}" dir="ltr" data-dbim-group="9" data-theme="light" data-text="0" id="top">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{PAGE_TITLE}} | {{ORG_NAME}}, ${gov}</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <meta name="keywords" content="{{KEYWORDS}}">
  <link rel="canonical" href="{{CANONICAL_URL}}">
  <link rel="alternate" hreflang="en" href="{{EN_URL}}">
  <link rel="alternate" hreflang="hi" href="{{HI_URL}}">
  <link rel="alternate" hreflang="x-default" href="{{EN_URL}}">
  <meta name="theme-color" content="#3E170E">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="{{ORG_NAME}}">
  <meta property="og:title" content="{{PAGE_TITLE}} | {{ORG_NAME}}">
  <meta property="og:description" content="{{DESCRIPTION}}">
  <meta property="og:locale" content="${lang}_IN">
  <link rel="icon" href="{{KIT}}/assets/favicon.png" type="image/png">
  <link rel="stylesheet" href="{{KIT}}/dbim.min.css">
  <script src="{{KIT}}/dbim-early.js"></script>
</head>
<body>
  <!-- @include templates/${lang}/header.html -->
  <main id="main" tabindex="-1">
    ${toSprite(hero, '{{KIT}}')}
    <div class="container page-body">
      ${toSprite(side, '{{KIT}}')}
      <div class="page-content">
        <div class="page-content__body">
          {{CONTENT}}
        </div>
        ${toSprite(tools, '{{KIT}}')}
      </div>
    </div>
  </main>
  <!-- @include templates/${lang}/footer.html -->
  <!-- @include templates/${lang}/dialogs.html -->
  <!-- @include templates/${lang}/tribot.html -->
  <script src="{{KIT}}/dbim.js"></script>
</body>
</html>
`;
    await fs.writeFile(path.join(tdir, lang === 'en' ? 'page.html' : 'page.hi.html'), shell);
    // Resolved sample
    let page = shell.replace(/<!-- @include templates\/(\w+)\/(\w+)\.html -->/g, (_, l, part) => `@@${l}/${part}@@`);
    for (const part of ['header', 'footer', 'dialogs', 'tribot']) {
      const t = (await fs.readFile(path.join(tdir, lang, `${part}.html`), 'utf8')).replace(/^<!--[\s\S]*?-->\n/, '');
      page = page.replace(`@@${lang}/${part}@@`, () => t);
    }
    const fill = { PAGE_TITLE: title, DESCRIPTION: lead, ORG_NAME: lang === 'hi' ? 'जनजातीय कार्य मंत्रालय' : 'Ministry of Tribal Affairs', KEYWORDS: title,
      CANONICAL_URL: '#top', EN_URL: 'page-en.html', HI_URL: 'page-hi.html', UPDATED_ISO: '2026-10-05', UPDATED: lang === 'hi' ? '05 अक्टूबर 2026' : '05 October 2026', KIT: '../dist' };
    page = page.replace('{{CONTENT}}', () => content).replace(/\{\{(\w+)\}\}/g, (m, k) => fill[k] ?? m)
      .replace(/<!-- MoTA DBIM Kit — inner page shell[\s\S]*?-->\n/, `<!-- Sample: templates/${lang === 'en' ? 'page.html' : 'page.hi.html'} with the ${lang} templates included. Generated; do not edit. -->\n`);
    samples.push([`page-${lang}.html`, page]);
  }

  // 3. Component gallery (examples/index.html): real fragments from pilot pages
  const sections = [
    { id: 'hero', title: 'Banner carousel with CCPS slot', ref: 'DBIM A.4.1.2 (ii) — central campaign banner (CCPS) first; pause control, keyboard, reduced motion', page: 'index.html', test: byClass('section', 'hero') },
    { id: 'ticker', title: 'News ticker', ref: 'DBIM A.4.1.2 (iii); WCAG 2.2.2 — moving content can be paused', page: 'index.html', test: byClass('section', 'ticker') },
    { id: 'quick', title: 'Quick actions', ref: 'DBIM A.4.1.2 (x) — most-used services', page: 'index.html', test: byClass('section', 'quick') },
    { id: 'pmq', title: 'Prime Minister’s quote', ref: 'DBIM A.4.1.2 (iv)', page: 'index.html', test: byClass('section', 'pmq') },
    { id: 'stats', title: 'Statistics band', ref: 'DBIM A.4.1.2 (xiii) — infographics', page: 'index.html', test: byClass('section', 'stats') },
    { id: 'offerings', title: 'Tabs: key offerings', ref: 'DBIM A.4.1.2 (vi); WAI-ARIA tabs pattern', page: 'index.html', test: byClass('section', 'offerings') },
    { id: 'personas', title: 'Persona tiles', ref: 'DBIM A.2, A.4.1.2 (ix) — audience-based navigation', page: 'index.html', test: byClass('section', 'personas') },
    { id: 'page-hero', title: 'Inner page title with breadcrumb', ref: 'DBIM 5.5 — L2/L3 page; GIGW breadcrumb', page: 'ministry/about-us/index.html', test: byClass('div', 'page-hero') },
    { id: 'people', title: 'Leadership cards (1:1 headshots)', ref: 'DBIM 6.1.4, A.4.1.2 (v), A.5.1.2', page: 'ministry/our-team/index.html', test: byClass('ul', 'people'), wrap: true },
    { id: 'orgchart', title: 'Interactive organogram', ref: 'DBIM A.5.1.2 — Our Team', page: 'ministry/our-team/index.html', test: byClass('ol', 'orgchart'), wrap: true },
    { id: 'schemes', title: 'Filter chips and scheme cards', ref: 'DBIM A.5.2.1 — Schemes and Services', page: 'offerings/schemes/index.html', test: byClass('ul', 'scheme-list'), wrap: true, before: byClass('div', 'scheme-filter') },
    { id: 'facts', title: 'Scheme summary and key facts', ref: 'DBIM A.5.2.1 — scheme detail page', page: 'offerings/schemes/pm-janman/index.html', test: byClass('div', 'scheme-summary'), wrap: true, before2: byClass('div', 'facts-wrap') },
    { id: 'documents', title: 'Document list with filter, file type and size', ref: 'DBIM A.5.3; GIGW 3.0 — file format and size shown; dates day-month (A.5.6 viii)', page: 'documents/reports/index.html', test: byClass('div', 'doc-block'), wrap: true },
    { id: 'gallery', title: 'Photo albums', ref: 'DBIM A.5.4.1 — Media', page: 'media/photos/index.html', test: byClass('ul', 'gallery'), wrap: true },
    { id: 'form', title: 'Accessible form with validation', ref: 'GIGW 3.0 / WCAG 3.3 — labels, hints, error messages', page: 'connect/feedback/index.html', test: byClass('form', 'feedback'), wrap: true },
  ];
  const exdir = path.join(kit, 'examples');
  const media = path.join(exdir, 'media');
  await fs.rm(exdir, { recursive: true, force: true });
  await fs.mkdir(media, { recursive: true });
  const copied = new Map();
  const localise = async (frag) => {
    // Copy images the fragment needs and point to them; neutralise internal links.
    const refs = new Set([...frag.matchAll(/(?:src|srcset)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])).filter((u) => u.startsWith('/')));
    for (const u of refs) {
      if (!copied.has(u)) {
        const name = path.basename(u.split('?')[0]);
        await fs.copyFile(path.join(site, decodeURIComponent(u.split('?')[0])), path.join(media, name)).catch(() => {});
        copied.set(u, `media/${name}`);
      }
      frag = frag.replaceAll(u, copied.get(u));
    }
    return frag.replace(/href="\/[^"]*"/g, 'href="#top"');
  };
  const { html: homeHtml, doc: homeDoc } = await read('index.html');
  const skip = find(homeHtml, homeDoc, byClass('a', 'skip-link'));
  const header = find(homeHtml, homeDoc, byClass('header', 'site-header'));
  const footer = find(homeHtml, homeDoc, byClass('footer', 'site-footer'));
  const { dialogs: after, tribot: homeTribot } = tail(homeHtml, homeDoc);
  const fix = async (s) => toSprite(await localise(assets(s, '../dist')), '../dist');

  let body = '';
  const nav = [];
  for (const s of sections) {
    const { html, doc } = await read(s.page);
    let frag = find(html, doc, s.test);
    if (!frag) { console.warn('gallery: not found', s.id); continue; }
    if (s.before) frag = find(html, doc, s.before) + '\n' + frag;
    if (s.before2) frag = frag + '\n' + find(html, doc, s.before2);
    frag = await fix(frag);
    if (s.wrap) frag = `<div class="container"><div class="page-content__body">${frag}</div></div>`;
    nav.push(`<li><a href="#c-${s.id}">${s.title}</a></li>`);
    body += `
<section class="kit-demo" aria-labelledby="c-${s.id}">
  <div class="container kit-demo__head"><h2 id="c-${s.id}" class="kit-demo__title" tabindex="-1">${s.title}</h2><p class="kit-demo__ref">${s.ref} · source: <code>/${s.page.replace(/index\.html$/, '')}</code></p></div>
  ${frag}
</section>`;
  }
  const groups = [['9', 'Group 9 — Terracotta (MoTA pilot)'], ['1', 'Group 1'], ['2', 'Group 2'], ['3', 'Group 3'], ['4', 'Group 4'], ['5', 'Group 5'], ['6', 'Group 6'], ['7', 'Group 7'], ['8', 'Group 8'], ['10', 'Group 10'], ['neutral', 'Neutral']];
  const gallery = `<!doctype html>
<html lang="en" dir="ltr" data-dbim-group="9" data-theme="light" data-text="0" id="top">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Component gallery | MoTA DBIM Kit</title>
  <meta name="description" content="Reusable DBIM 3.0 / GIGW 3.0 components for Ministry of Tribal Affairs portals, generated from the tribal.gov.in pilot.">
  <meta name="robots" content="noindex">
  <link rel="icon" href="../dist/assets/favicon.png" type="image/png">
  <link rel="stylesheet" href="../dist/dbim.min.css">
  <link rel="stylesheet" href="demo.css">
  <script src="../dist/dbim-early.js"></script>
</head>
<body>
${await fix(skip)}
${await fix(header)}
<main id="main" tabindex="-1">
  <div class="page-hero"><div class="container page-hero__inner"><div>
    <p class="kit-demo__eyebrow">MoTA DBIM Kit · v1.0.0 (UAT)</p>
    <h1>Component gallery</h1>
    <p class="page-hero__lead">Approved-for-review DBIM 3.0 / GIGW 3.0 components from the tribal.gov.in pilot. Change the colour group to see how a sister portal keeps its own identity within DBIM.</p>
  </div></div></div>
  <div class="container kit-demo__bar">
    <form class="kit-demo__switch" data-group-switch>
      <label for="group-select">DBIM colour group</label>
      <select id="group-select" class="select">${groups.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
    </form>
    <p class="small muted">Header, footer and dialogs on this page are the templates in <code>templates/en/</code>. Internal links are disabled in the gallery.</p>
  </div>
  <nav class="container kit-demo__toc" aria-label="Components"><ul role="list">${nav.join('')}</ul></nav>
  ${body}
</main>
${await fix(footer)}
${await fix(after)}
${await fix(homeTribot)}
<script src="../dist/dbim.js"></script>
<script src="demo.js"></script>
</body>
</html>
`;
  await fs.writeFile(path.join(exdir, 'index.html'), gallery);
  for (const [name, page] of samples) {
    let html = toSprite(await localise(assets(page, '../dist')), '../dist');
    html = html.replace(/href="#top"([^>]*hreflang="(en|hi)")/g, (_, rest, l) => `href="page-${l}.html"${rest}`);
    await fs.writeFile(path.join(exdir, name), html);
  }
  await fs.writeFile(path.join(exdir, 'demo.css'), `/* Gallery-only chrome. Not part of the kit. */
.kit-demo { padding-block: var(--sp-6, 2rem) 0; border-top: 1px dashed var(--border, #d9d9d9); }
.kit-demo__head { margin-bottom: 1rem; }
.kit-demo__title { font-size: var(--fs-h3, 1.25rem); margin: 0 0 .25rem; }
.kit-demo__ref, .kit-demo__eyebrow { margin: 0; font-size: var(--fs-small, .875rem); color: var(--text-muted); }
.kit-demo__eyebrow { text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
.kit-demo__bar { display: flex; flex-wrap: wrap; gap: 1rem 2rem; align-items: center; padding-block: 1.25rem; }
.kit-demo__switch { display: flex; gap: .75rem; align-items: center; }
.kit-demo__switch label { font-weight: 600; }
.kit-demo__toc ul { display: flex; flex-wrap: wrap; gap: .5rem 1.25rem; padding: 0 0 1.5rem; margin: 0; }
.kit-demo__toc a { font-size: var(--fs-small, .875rem); }
.kit-demo > .page-hero { margin-top: 0; }
`);
  await fs.writeFile(path.join(exdir, 'demo.js'), `// Gallery only: switch the DBIM colour group (html[data-dbim-group]).
(function () {
  var sel = document.getElementById('group-select');
  if (!sel) return;
  var q = new URLSearchParams(location.search).get('group');
  if (q) { sel.value = q; document.documentElement.setAttribute('data-dbim-group', q); }
  sel.addEventListener('change', function () {
    document.documentElement.setAttribute('data-dbim-group', sel.value);
    history.replaceState(null, '', '?group=' + sel.value);
  });
})();
`);
  return { used, images: copied.size };
}
