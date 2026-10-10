# Technology and architecture

For developers, NIC hosting staff and security auditors. Versions are those installed from
`package-lock.json`, checked on 6 Oct 2026. How to run the site:
[RUN.md](../RUN.md).

## 1. How it works

The new tribal.gov.in is a **static website**:
- Every page, in English and Hindi, is generated in advance on a build computer.
- IIS on the NIC server serves the pages as plain HTML, CSS and JavaScript.
- There is no database, content-management system or server-side code on the public server.

| Part | Where | Role |
|---|---|---|
| Public site | IIS on the tribal.gov.in server | The built pages, the search index and `web.config`, next to the old document folders, which keep their addresses |
| Back-office | The old ASP.NET application, on an internal-only host | Divisions keep publishing through its admin panel; it is the source of the content export to the site (planned) and of the feedback handler (planned) |
| TriBot service | `tribot.tribal.gov.in/api/v1` | Answers for the chat assistant, reached through the `/tribot-api/` path on the public site, which IIS forwards |

Set-up and switch-over: [DEPLOYMENT.md](DEPLOYMENT.md). Migration of content and old
addresses: [MIGRATION.md](MIGRATION.md).

**How a release is made:**
1. Astro reads the content in `src/data/` and the components.
2. It writes every page in both languages, the sitemap and `web.config` into `dist/`,
   and converts the images to WebP.
3. Pagefind indexes the finished pages for site search.
4. `dist/` is copied to IIS, next to the old document folders.

**Visitor data.** The site sets no cookies of its own. The visitor's browser storage keeps:
- the accessibility settings (`mota-prefs`);
- the consent choice (`mota-consent`);
- the chat assistant's answer language (`mota-assistant-lang`);
- the conversation, for the open tab only (`mota-assistant-chat`).

## 2. Site and build

| Area | Technology | Version | Licence | Used for |
|---|---|---|---|---|
| Site generator | Astro (static output) | 5.18.2 | MIT | All pages in both languages, the sitemap and the generated IIS `web.config` |
| Bundler | Vite (inside Astro) | 6.4.3 | MIT | Building and bundling scripts and styles |
| Languages | TypeScript, HTML5, CSS | TypeScript 5.9.3 | Apache-2.0 | Components and scripts; styles use CSS custom properties (DBIM design tokens), no CSS framework |
| Site search | Pagefind | 1.5.2 | MIT | Search index made at build time; searching runs in the browser (WebAssembly) |
| Fonts | Noto Sans, Noto Sans Devanagari (`@fontsource-variable`) | 5.3.0 | OFL-1.1 | DBIM typeface, self-hosted |
| Icons | Lucide (`lucide-static`); Simple Icons | 1.52.0; 16.34.0 | ISC; CC0-1.0 | Line icons (DBIM 3); social media logos (the brands belong to their owners) |
| Images | sharp, through the Astro image pipeline | 0.34.5 | Apache-2.0 | Banners and photographs converted to WebP in the sizes each screen needs |
| Component kit | esbuild; parse5 | 0.27.7; 7.3.0 | MIT | One CSS file, one JS file and HTML templates for other MoTA portals |

## 3. Tests and checks

| Tool | Version | Licence | Used for |
|---|---|---|---|
| Puppeteer (`puppeteer-core`) with Google Chrome | 22.15.0 | Apache-2.0 | Browser tests and screenshots (site, kit, chat assistant) |
| axe-core | 4.13.0 | MPL-2.0 | Automated WCAG 2.1 A and AA checks |
| Lighthouse | 12.8.2 | Apache-2.0 | Audits of the live portals and the new build (`npm run assess`) |
| Node.js test runner (`node:test`) | built in | — | Redirect, document and chat-assistant tests (`tests/`) |
| Project scripts | — | — | Link, navigation and release checks; migration crawl and inventory (`scripts/`) |

## 4. One-time tools

| Tool | Version | Used for |
|---|---|---|
| Python (standard library) | 3.12 | One-time import of text and document links from the old site (`scripts/harvest/`) |

## 5. What each environment needs

| Where | Needs |
|---|---|
| Build computer or CI | Node.js 24 LTS (`.nvmrc`) and npm. The build and all tests were verified on Node 24.21.0 and 20.12.1 on 10 Oct 2026. Google Chrome for the tests |
| Web server (NIC) | IIS 10 with the URL Rewrite module; Application Request Routing for the `/tribot-api/` proxy; TLS 1.2 and 1.3 with the full certificate chain. No ASP.NET, Node.js or database |
| Visitor's browser | Current Chrome, Edge, Firefox or Safari, on desktop, Android or iOS. Uses ES modules, native `<dialog>`, CSS custom properties, `color-mix()`, WebAssembly (search), and optionally speech recognition (voice input) and the clipboard. Automated tests have run in Chrome only so far |

## 6. Outside services

| Service | Purpose | How the site reaches it |
|---|---|---|
| TriBot service, `tribot.tribal.gov.in/api/v1` | Answers for the chat assistant "Jago" | Same-origin path `/tribot-api/`, which IIS forwards; NIC switches it on ([DEPLOYMENT.md](DEPLOYMENT.md) §2). `npm run dev` forwards it too (`astro.config.mjs`) |
| MyGov Central Content Publishing System, `cbpssubscriber.mygov.in` | Central campaign banner (DBIM 7.4) | Image in the home page banner |
| X and Facebook | Social media posts | Loaded only after the visitor accepts them in the cookie notice |
| YouTube | Videos | Links open the Ministry's YouTube channel |
| The browser's speech service | Voice input in search and in the chat assistant | Only when the visitor presses the microphone button |

## 7. Deliberately not used

- No CMS, database or server-side code on the public server.
- No jQuery, Bootstrap or other UI framework.
- No Google Fonts or public CDNs.
- No trackers or analytics.
- No inline scripts or event handlers, so the Content-Security-Policy allows scripts from the
  site only.

## 8. Known issues to fix

- **Dependency advisories.** `npm audit` (6 Oct 2026) reports advisories in:
  - Astro 5.18.2: one critical, for image optimisation at build time, plus several high and
    moderate. Fixed in Astro 7;
  - sharp 0.34.5: high;
  - the test tools puppeteer-core and Lighthouse: high.

  The plan is to upgrade to Astro 7 on Node 24 and re-run all test suites
  ([gap matrix](GIGW_DBIM_Standardisation/2_Assess/Gap_Matrix_Main_Website.md), row 11).
- **Node.js 20** has been out of support since 30 Apr 2026. Use Node 24 LTS.

## 9. Where things are configured

| File or folder (in the repository root) | What |
|---|---|
| `astro.config.mjs` | Static output, site address, no inline scripts or styles |
| `src/data/` | Content and settings: Ministry details, menus, schemes, chat assistant, old-address map ([MAINTENANCE.md](../MAINTENANCE.md)) |
| `src/pages/web.config.ts` | IIS security headers, caching, custom 404 page, redirects, chat proxy rule |
| `packages/dbim-kit/src/` | Shared styles and scripts, used by the site and the kit |
| `scripts/`, `tests/` | Tools and tests ([RUN.md](../RUN.md)) |
