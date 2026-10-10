# Maintain the site

For the web team and developers: how to update content and how to change the code. Run
commands in this folder. How to run and test: [RUN.md](RUN.md).

## 1. Update content

Content is kept in data files in `src/data/`. Each entry has its English text and, next to
it, its Hindi text. A rebuild updates the pages, menus, sitemap and search together.

Lists that the old site kept in its database (What's New, tenders, archives) are also edited
here for now. They will be built from the NIC export once it arrives
([MIGRATION.md](docs/MIGRATION.md)).

| To change | Edit, in `src/data/` |
|---|---|
| Ministry name, addresses, phone numbers, social media accounts | `site.ts` → `site` |
| Ministers: name, role, photo, Sansad profile | `site.ts` → `ministers`; square photos in `src/assets/people/` |
| Campaign logos in the header (at most two) | `site.ts` → `cobrand`; images in `public/images/cobrand/` |
| STQC certificate in the footer | `site.ts` → `stqc`: shown only until `validTill` |
| FAQ file and visitor counter in the footer | `site.ts` → `faq`, `visitorCounter` |
| Chat assistant: name, service address, languages, suggested questions | `assistant.ts` |
| Menus | `nav.ts` |
| Scrolling announcements, What's New, tenders, archives, sanction-order years | `updates.ts` |
| Home page banners, photo albums, videos | `media.ts`; images in `src/assets/banners/` and `src/assets/gallery/` |
| Schemes | `schemes.ts` |
| Divisions, initiatives, organisations, persona pages | `divisions.ts`, `initiatives.ts`, `organisations.ts`, `personas.ts` |
| Portals and the logos of related portals | `portals.ts`; logos in `public/images/partners/` |
| Website policies | `policies.ts`; Hindi in `policies-hi.ts` |
| Buttons, labels and other interface text | `i18n.ts` |
| Hindi text of schemes, divisions, portals and other content | `hi-content.ts` |
| Old addresses and their new pages | `legacy-urls.json` ([MIGRATION.md](docs/MIGRATION.md) §3) |

### Examples

**Add a What's New item:** add a line at the top of `whatsNew` in `updates.ts`.

```ts
{ title: { en: 'Guidelines for EMRS admissions 2027-28', hi: 'ईएमआरएस प्रवेश 2027-28 के दिशानिर्देश' },
  url: 'https://tribal.gov.in/downloads/EMRS/Guidelines2728.pdf',
  date: '2026-10-10', category: 'Guideline', format: 'PDF', size: '420 KB', isNew: true },
```

**Add a scrolling announcement:** add an entry to `announcements` in `updates.ts`.

```ts
{ text: { en: 'Last date for NOS applications extended to 31 Oct 2026',
          hi: 'एनओएस आवेदन की अंतिम तिथि 31 अक्टूबर 2026 तक बढ़ाई गई' },
  url: 'https://overseas.tribal.gov.in/' },
```

**Add a home page banner:**
1. Save the image, 1440 × 386 px JPG, in `src/assets/banners/`.
2. In `media.ts`, import it at the top.
3. Add `{ image, alt, altHi, href }` to `banners`, with `href` only if the banner should open
   a page.

The build converts the image to WebP.

**Put up a renewed STQC certificate:**
1. Upload the PDF to the server.
2. In `site.ts`, set `stqc` to its address, size and expiry date.

The footer shows the link after the next build. It disappears on its own after the expiry
date, even without a rebuild.

### Rules

- **Hindi:** always give the Hindi text with the English. If a Hindi version is not ready,
  ask the OL Division; do not leave it out.
- **Dates:** write dates in data files as `yyyy-mm-dd`. The site shows them as day month year.
- **Document links:** give the format and size for every document link.
- **Image sizes:**
  - banners under 500 KB;
  - logos and thumbnails under 100 KB;
  - headshots square, on a white background.
- **No text only in images:** put important text in the `alt` text and, where possible, on
  the page.
- **Links:** use `https://` links. Links to other websites get the "you are leaving" notice
  automatically.
- **Documents:** link only to documents that are on the server. `npm run check:links` reports
  broken links.

## 2. Change the code

The top-level folders are described in [README.md](README.md). Inside `src/`:

| Path | Contents |
|---|---|
| `pages/` | Routes: `index.astro` and `hi/index.astro` (home pages), `[...slug].astro` and `hi/[...slug].astro` (every inner page), `404.astro`, `sitemap.xml.ts`, `web.config.ts` |
| `lib/routes.ts` | Page registry: the path, titles, kind and parent of every inner page. Pages, breadcrumbs and the sitemap come from it and from the menus in `data/nav.ts` |
| `layouts/BaseLayout.astro` | HTML shell: metadata, `hreflang`, fonts, early accessibility script, header, footer, dialogs, chat assistant |
| `components/` | Header, Footer, A11yPanel, SiteDialogs, TriBot, SmartLink, Icon and others |
| `components/home/` | Home page sections in DBIM order; `HomePage.astro` lists them |
| `components/page/` | `InnerLayout`, `PageView` (chooses the view for a page kind) and `views/` (one view per kind) |
| `data/`, `assets/`, `styles/home.css` | Content and settings (section 1), images, home page styles |

### How a page is made

1. `lib/routes.ts` lists the page with its path, title in both languages, kind and parent.
2. `[...slug].astro` and `hi/[...slug].astro` create one page per entry, in each language.
3. `PageView` picks the view for the kind (for example `SchemeView`) inside `InnerLayout`.
   That adds the title, breadcrumb, section menu and page tools.
4. `BaseLayout` adds the header, footer, dialogs and chat assistant.

### Add a new kind of page

1. Add the kind to `PageKind` in `lib/routes.ts`.
2. Register its pages: an entry in `KIND_BY_PATH` for a page in the menus, or a loop in
   `allPages()` for a list such as schemes.
3. Write `components/page/views/YourView.astro`. It takes `locale` as a prop and gives every
   text in English and Hindi.
4. Add the view to `PageView.astro`.
5. Build, then run the checks (section 3).

### Styles and scripts

- **Where they are:** shared styles and scripts are in `packages/dbim-kit/src/`. The site
  imports them directly, so a change reaches both the site and the kit, and both test suites
  cover it.
- **Styles:** `css/tokens.css` (DBIM colour groups, type scale, themes), `base.css`,
  `layout.css`, `components.css`, `a11y.css` and `print.css`. The home page also uses
  `src/styles/home.css`.
- **Design tokens:** use the tokens (`var(--g-key)`, `var(--fs-p1)`, `var(--icon-24)` …).
  Do not hard-code colours or font sizes.
- **Scripts:** one module per component in `js/` (`header`, `dialogs`, `carousel`, `tabs`,
  `tribot`, `visitors` …). A component loads its module in a `<script>` tag, for example
  `import '@kit/js/header'`. The kit bundles them all into `dbim.js`.
- **Early settings:** `public/js/prefs-early.js` applies saved accessibility settings before
  the page is drawn.

### Language

- **Helpers** in `data/i18n.ts`:
  - `t(key, locale)` for interface text;
  - `tx(locale, en, hi)` for one-off text;
  - `localePath(path, locale)` for links;
  - `formatDate` for dates.
- **Mixed text:** mark English words on a Hindi page with `lang="en"`, and the reverse, so
  screen readers switch voice.
- **Links:** use `SmartLink` for every link. It handles Hindi paths, new tabs for documents
  and other websites, the "you are leaving" notice and screen-reader hints.

### Rules

- **No inline scripts or event handlers:** the Content-Security-Policy blocks them, so put
  code in a module.
- **Controls:** every control needs a visible label or an accessible name, must work with the
  keyboard, and must keep 4.5:1 contrast in every theme.
- **Language:** every text the visitor sees must be in English and Hindi.
- **Icons:** use only `Icon.astro` (Lucide), at DBIM sizes.

### Generated files

- `pages/web.config.ts` writes `dist/web.config`, which sets:
  - security headers and MIME types;
  - compression and caching: one hour, or one year for hashed files in `/_assets/`;
  - the custom 404 page;
  - the HTTPS redirect;
  - the permanent redirects from `data/legacy-urls.json`;
  - the chat-assistant proxy rule, commented out until NIC enables it.
- `pages/sitemap.xml.ts` writes the XML sitemap for both languages.

### Importing from the old site (one time)

The site does not read the old ASP.NET code. To import text, document links or images from it
again, point `LEGACY_DIR` at the old `App` folder:

```bash
LEGACY_DIR=../MoTA_Website_Old/App python3 scripts/harvest/harvest.py
LEGACY_DIR=../MoTA_Website_Old/App npm run assets
```

## 3. After every change

1. Run `npm run build`.
2. Run the checks in [RUN.md](RUN.md): at least `check:links` and `test:uat`. Add `kit:build`
   and `kit:test` if anything in `packages/dbim-kit/src/` changed.
3. Look at the change on `npm run serve:uat`.
4. Deploy as in [DEPLOYMENT.md](docs/DEPLOYMENT.md): staging first, production only after
   approval.
