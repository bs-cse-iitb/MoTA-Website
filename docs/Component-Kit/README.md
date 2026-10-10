# MoTA DBIM Kit: guide

For teams of other MoTA portals: ASP.NET, PHP, Java or plain HTML.

The kit holds reusable DBIM 3.0 / GIGW 3.0 front-end components for Ministry of Tribal
Affairs portals. It comes from the **tribal.gov.in pilot**: its markup is generated from the
pilot build, so it is the same markup that passed the pilot's tests.

**Status: v1.1.0 plus unreleased changes, in UAT.** The components are ready for review. Use
them in production only after the competent authority approves them; approvals are recorded
in [COMPONENTS.md](COMPONENTS.md).

The documents in this folder:
- [COMPONENTS.md](COMPONENTS.md): the component list, with references and approvals;
- [INTEGRATION.md](INTEGRATION.md): ASP.NET, PHP and CMS, static sites, security headers, Hindi and BHASHINI;
- [CHANGELOG.md](CHANGELOG.md): what changed in each release.

The kit's files are in `packages/dbim-kit/`, and the paths below are inside that folder.
How to build and test it: [packages/dbim-kit/README.md](../../packages/dbim-kit/README.md).

## What is in it

| Path | Contents |
|---|---|
| `dist/dbim.min.css` | All styles: DBIM colour groups 1–10 and neutral, Noto Sans type scale, layout, components, accessibility modes, print. 56 KB |
| `dist/dbim.js` | Behaviour of every component (mega menu, mobile drawer, accessibility panel, language menu, cookie consent, external-link notice, carousel, tabs, print and share, visitor counter, chat assistant). No dependencies |
| `dist/dbim-early.js` | Applies saved accessibility settings before the page is drawn. Load it in `<head>` |
| `dist/dbim-search.js` | Optional site search over a [Pagefind](https://pagefind.app) index |
| `dist/icons.svg` | DBIM line-icon sprite (Lucide, ISC licence): `<svg class="icon" aria-hidden="true"><use href="/dbim-kit/icons.svg#i-search"></use></svg>` |
| `dist/fonts/` | Self-hosted Noto Sans and Noto Sans Devanagari (variable weight, woff2) |
| `dist/assets/` | State Emblem (black and white), favicon, Warli band, large cursor, chat assistant mascot |
| `templates/en/`, `templates/hi/` | `header.html`, `footer.html`, `dialogs.html` and the optional `tribot.html`, in English and Hindi |
| `templates/page.html`, `page.hi.html` | Inner page shell: title, breadcrumb, section menu, content, page tools |
| `examples/` | `index.html`: the component gallery with a colour-group switcher; `page-en.html` and `page-hi.html`: complete sample pages |

## Quick start (any server technology)

1. Copy `dist/` to the portal, for example as `/dbim-kit/`.
2. In `<head>`:
   ```html
   <link rel="stylesheet" href="/dbim-kit/dbim.min.css">
   <script src="/dbim-kit/dbim-early.js"></script>
   ```
3. Set the language and the portal's DBIM colour group on `<html>`:
   ```html
   <html lang="en" data-dbim-group="9" data-theme="light" data-text="0" id="top">
   ```
4. Add the templates and placeholders:
   1. Put `templates/en/header.html` at the start of `<body>`.
   2. Put the page content in `<main id="main" tabindex="-1">`.
   3. Put `footer.html` and `dialogs.html` after it.
   4. Replace `{{KIT}}` with `/dbim-kit`.
   5. In the footer, replace `{{UPDATED}}` and `{{UPDATED_ISO}}` with the date the content
      was last updated, for example `6 Oct 2026` and `2026-10-06`.
5. Before `</body>`: `<script src="/dbim-kit/dbim.js"></script>`.
6. Replace the pilot's organisation name, menus and footer links with the portal's own. Keep
   the structure, classes and `data-*` attributes, because the script depends on them.

To see the result, open `examples/` over HTTP, not `file://`. For example, from the repository root run
`npx http-server packages/dbim-kit -p 8080`, then open http://localhost:8080/examples/.

## Identity within DBIM

DBIM fixes the structure: header, footer, navigation, type scale, icon style and
accessibility controls. Each portal keeps its identity through the parts DBIM leaves open:

- **Colour group:** `data-dbim-group="1"` to `"10"`, or `"neutral"`. Choose the group that
  matches the portal's logo, as DBIM 2.1 prescribes. The key colour drives the top bar,
  footer, icons, links and buttons. MoTA uses group 9 (terracotta, `#3E170E` / `#8C2F26`).
- **Logo lockup:** the State Emblem, then "Government of India", then the organisation name.
  An organisation with its own logo, such as NSTFDC or TRIFED, uses the lockup with its logo.
- **Co-branding:** at most two approved flagship-programme logos in the header (`.cobrand`).
- **Imagery and content:** banners, photographs and, optionally, the Warli band.

## Accessibility, language and browsers

- **WCAG 2.1 AA features:**
  - skip link and landmarks;
  - visible focus;
  - 4.5:1 contrast in every colour group;
  - menus and dialogs that work by keyboard;
  - reflow at 320 px.
- **Accessibility panel (DBIM 8):**
  - text size, in 4 steps;
  - standard, dark and high-contrast themes;
  - invert colours and low saturation;
  - highlight links, text spacing and a readable font;
  - stop animations, hide images and a big cursor.

  Settings are saved in the browser (`localStorage`, `mota-prefs`).
- **Hindi:** templates come in Hindi and English; see [INTEGRATION.md](INTEGRATION.md) §5.
- **Browsers:** written for current Chrome, Edge, Firefox and Safari, including Android and
  iOS. The kit uses native `<dialog>`, CSS custom properties and `color-mix()`. The automated
  tests have run in Chrome only so far.
