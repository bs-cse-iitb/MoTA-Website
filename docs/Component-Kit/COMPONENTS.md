# Component catalogue

Every component below is in the tribal.gov.in pilot. Paths such as `templates/` are inside
`packages/dbim-kit/`. DBIM references are to DBIM v3 (January 2025), with printed page
numbers. Typography (Noto Sans and Noto Sans Devanagari on the DBIM type scale, DBIM 4.1–4.3,
pp. 19–20) is part of every component (`src/css/tokens.css`, `base.css`).

**Approval status.** "UAT passed" means the component passed the automated test suites on
the local UAT stand-in (latest run 6 Oct 2026). Manual checks and tests on NIC staging are
still to be done. A component may go to production only after the Web Information Manager or
competent authority has approved it. Record approvals in the last column.

| # | Component | Where | DBIM 3.0 | GIGW 3.0 / WCAG 2.1 | Script hook | Status | Approved (date / by) |
|---|---|---|---|---|---|---|---|
| 1 | Government of India strip with accessibility tools | `templates/*/header.html` `.topbar` | 5.4.1 Header 1 (p. 31); 8 (p. 67) | 2.4.1 skip link; 1.4.4 text resize | `data-text-step`, `data-contrast-toggle`, `data-open-a11y` | UAT passed | |
| 2 | Language selector (English / हिन्दी) | `.lang-menu` | 5.4.1 user controls | GIGW bilingual; 3.1.1, 3.1.2 | `data-lang-menu`, `data-lang-switch` | UAT passed | |
| 3 | Logo lockup 2 (Emblem + GoI + organisation) | `.brand` | 5.2.2 (p. 27) | 1.1.1 text alternatives | — | UAT passed | |
| 4 | Site search with voice input | `.site-search` | 5.4.1 search | 3.3.2 labels | `data-site-search`, `data-voice-search` | UAT passed | |
| 5 | Mega menu (Ministry, Offerings, Documents, Media, Connect) | `.mainnav`, `.mega` | A.1 Global Information Architecture (p. 82); A.4.1.2 (i) | 2.1.1 keyboard; 4.1.2 name/role/value | `data-mainnav`, `data-menu-item` | UAT passed | |
| 6 | Mobile drawer | `.mainnav` (< 1024 px) | A.4.1.2 (i); responsive | 1.4.10 reflow | `data-toggle-menu`, `data-toggle-search` | UAT passed | |
| 7 | Footer in key colour (archives, policies, sitemap, help, feedback, last updated) | `templates/*/footer.html` | 5.6 (p. 34) | GIGW mandatory footer links | — | UAT passed | |
| 8 | Accessibility panel (text size, themes, invert, saturation, links, spacing, font, motion, images, cursor) | `templates/*/dialogs.html` `#a11y-panel` | 8 (p. 67) | 1.4.3, 1.4.8, 1.4.12, 2.2.2 | `data-a11y`, `data-a11y-reset` | UAT passed | |
| 9 | Cookie consent bar and preferences | `.cookie-bar`, `#cookie-dialog` | 7.6 (p. 61) | DPDP Act 2023 | `data-cookie-bar`, `data-consent` | UAT passed | |
| 10 | External link notice | `#ext-dialog` | A.5.6 (x) | GIGW hyperlinking policy | `data-ext` | UAT passed | |
| 11 | Back to top, status toast | `.to-top`, `.toast` | — | 4.1.3 status messages | `data-to-top`, `data-toast` | UAT passed | |
| 12 | Banner carousel with CCPS slot first | gallery #hero | A.4.1.2 (ii) | 2.2.2 pause; 2.1.1 | `data-carousel`, `data-ccps` | UAT passed | |
| 13 | News ticker (pausable) | gallery #ticker | A.4.1.2 (iii) | 2.2.2 | — | UAT passed | |
| 14 | Quick actions | gallery #quick | A.4.1.2 (x) | 2.4.4 link purpose | — | UAT passed | |
| 15 | Prime Minister's quote | gallery #pmq | A.4.1.2 (iv) | 1.1.1 | — | UAT passed | |
| 16 | Statistics band | gallery #stats | A.4.1.2 (xiii) | 1.4.3 | — | UAT passed | |
| 17 | Tabs (key offerings) | gallery #offerings | A.4.1.2 (vi) | ARIA tabs pattern | `data-tabs` | UAT passed | |
| 18 | Persona tiles | gallery #personas | A.2; A.4.1.2 (ix) | 2.4.4 | — | UAT passed | |
| 19 | Inner page title, breadcrumb, section menu, page tools | `templates/page*.html` | 4.5 (ii) (p. 24); A.5 (p. 95) | 2.4.8 location; print | `data-print`, `data-share` | UAT passed | |
| 20 | Leadership cards with 1:1 headshots | gallery #people | 6.1.4; A.4.1.2 (v); A.5.1.2 | 1.1.1 | — | UAT passed | |
| 21 | Interactive organogram | gallery #orgchart | A.5.1.2 | native `<details>` | — | UAT passed | |
| 22 | Filter chips and scheme cards | gallery #schemes | A.5.2.1 | 4.1.2 (`aria-pressed`) | — | UAT passed | |
| 23 | Scheme summary and key facts | gallery #facts | A.5.2.1 | 1.3.1 (`<dl>`) | — | UAT passed | |
| 24 | Document list with filter, type and size | gallery #documents | A.5.3 | GIGW: file format and size shown | — | UAT passed | |
| 25 | Photo albums | gallery #gallery | A.5.4.1 | 1.1.1 | — | UAT passed | |
| 26 | Form with labels, hints and error messages | gallery #form | 4.5 (buttons) | 3.3.1, 3.3.2, 3.3.3 | — | UAT passed | |
| 27 | Data table (scrollable, keyboard focusable) | pilot `/connect/directory/` | 4.1.1 (alignment) | 1.3.1; 2.1.1 | — | UAT passed | |
| 28 | Site search results with filters | pilot `/search/` (`dbim-search.js`) | 9 | 4.1.3 | `data-search-form` | UAT passed | |
| 29 | Colour groups 1–10 and neutral | `data-dbim-group` | 2.1, 2.2 (pp. 5–6) | 1.4.3 in every group (KIT-01) | — | UAT passed | |
| 30 | Icon sprite (line icons, 24/32/48/64 px) | `dist/icons.svg` | 3.3, 3.4, 3.7 (iii) (pp. 12–14) | 1.1.1 (decorative icons hidden) | — | UAT passed | |
| 31 | Chat assistant "Jago" on the TriBot service (floating; 11 answer languages; list and table answers; site-search fallback; mascot in `assets/jago-*.webp`) | `templates/*/tribot.html` | — | 2.1.1; 4.1.3 (`role="log"`); 3.1.2 | `data-tribot`, `data-endpoint` | UAT passed (service to be connected on staging) | |
| 32 | Co-branding logos in the header (at most two) | `.cobrand` in `templates/*/header.html` | 5.4 (p. 31) | 1.1.1 | — | UAT passed | |
| 33 | Footer visitor counter (shown only when the endpoint answers) | `[data-visitor-count]` in footer | — | 4.1.3 | `data-endpoint` | Ready (needs counter feed) | |
| 34 | Footer STQC certificate badge (shown only while valid) | footer | GIGW 3.0 | — | — | Ready (needs renewed certificate) | |

Evidence: the test cases and screenshots of the site (`uat/`) and the kit (`uat-kit/`) in
`docs/Evidence/runs/2026-10-10-final/`. Release notes: [CHANGELOG.md](CHANGELOG.md).
