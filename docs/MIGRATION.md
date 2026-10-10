# Migration from the old tribal.gov.in

How every page, document and function of the old ASP.NET site is carried over, how
that is checked, and what is still open. Last updated **6 Oct 2026**.

> **Completeness is not verified.** The inventory reconciles the old source files, a
> bounded crawl of the live site and the new build. The database has not been
> reconciled: content that exists only in the database and was not reached by the crawl
> cannot appear yet. The NIC content export ([`Migration/nic-content-export.md`](Migration/nic-content-export.md)) unblocks it.

## 1. Decisions (6 Oct 2026)

- The old public site is retired at go-live; its admin panel and a feedback handler stay
  on an internal back-office host ([`DEPLOYMENT.md`](DEPLOYMENT.md) §1).
- Every old page address redirects (301) to its new page: `src/data/legacy-urls.json`.
- Every document and media file keeps its exact address as a static file
  ([`DEPLOYMENT.md`](DEPLOYMENT.md) §4).
- Lists kept in the old database (What's New, tenders, archives, minutes, photo albums,
  sanction orders) are built into the new pages from the NIC export.
- Nothing is removed silently. Items that are not carried over are listed in the
  inventory with the reason.

## 2. The inventory

[`Migration/inventory.csv`](Migration/inventory.csv) has one row per item, with these columns: type, old address,
language, title, where it was found, whether it is in the old source copy, live HTTP
status, size, old pages linking to it, action, new location, new pages linking to it,
status, notes. [`Migration/summary.json`](Migration/summary.json) holds the counts, the inputs used and the crawl
limits.

Regenerate it after any content or URL change, and refresh the crawl when the live site
changes: the commands are in [RUN.md](../RUN.md) (*Migration and go-live checks*).

### Sources and limits

| Source | What it covers | Limits |
|---|---|---|
| Old source copy (`MoTA_Website_Old/App`) | Every file; links written in pages, master pages (menus) and user controls | Incomplete: `grievance/` exists on the live server but not in the copy. Links built in server code are not seen |
| Live crawl (`Migration/live-crawl.json`) | Pages as served, including database lists and query-string pages | GET only, 1 request/second, own site only, link depth 2, at most 900 requests; postback-only items (tender archive) are not followed |
| New build (`dist/`) | Every link on the 229 new pages | — |
| Decisions | `src/data/legacy-urls.json`; earlier link probes (`src/data/generated/link-meta.json`) | — |
| Database | — | **Not reconciled** (export pending) |

## 3. Old page addresses

The map of old addresses (`src/data/legacy-urls.json`) gives each old page its new
page: 186 addresses, of which 169 redirect and 17 are held. 5 more are retired and 1 awaits
a decision.

| Outcome | Count | Detail |
|---|---|---|
| Redirect (301) | 169 | English pages to their new page; `ResourcesHindi/…h.aspx` to the matching `/hi/…` page; test and "-old" copies to the current page. `Search.aspx?q=` keeps its query |
| Held, not redirected yet | 17 | The new site still links to them because their content is not migrated: 11 PFMS sanction-order pages and 2 minutes pages (need the export); ICC, FRA archive, statistics archive and the Sickle Cell awareness campaign (static pages, next content batch) |
| Retired (404) | 5 | `captcha.aspx`, two TriBot test pages, two old error pages |
| Decision needed | 1 | `grievance/schreport.aspx` (§5) |

Verified on the local IIS stand-in with `npm run test:redirects` (309 checks passed on
6 Oct 2026). This includes `/Home.aspx` (301 to `/`, in any letter case and with a query
string) and every Hindi page. Staging is not verified yet.

## 4. Functions

| Function on the old site | New site | Status |
|---|---|---|
| Site search (Google Custom Search, `Search.aspx?q=`) | Search over all pages in both languages (Pagefind, no third party); old address redirects with the query | Done; UAT TC-016 |
| Language switch (Hindi section for part of the site) | Every page in English and Hindi | Done; Hindi text needs OL vetting; first-visit language choice (GIGW, Jul 2026) not yet |
| Text size and contrast themes | Accessibility panel | Done (automated tests only) |
| Visitor counter | Hidden until an endpoint exists | **Open**: Ministry to decide whether to keep it |
| Feedback form with CAPTCHA, saved to the database | Form validates; submission planned through the back-office | **Open** (P1) |
| TriBot chat widget ("Jago" popup, 11 answer languages) | The same widget rebuilt in the site design (`src/components/TriBot.astro`): 11 languages, list and table answers, voice input, conversation kept while the tab is open; falls back to site search | Done and tested with a stand-in service (`npm run test:assistant`); the real service needs the NIC proxy |
| What's New, tenders, archives (admin panel) | Hand-copied lists | **Open** (P1): import from the export |
| Sanction orders with search by order, State and amount | Links to the old pages (held) | **Open** (P1): export |
| Minutes (PAC, DAJGUA PAC, TRI Apex) | Links to the old pages (held) | **Open**: export |
| Photo gallery (`photos.aspx?cat_id=…`) | Curated albums | **Open**: export |
| Video (JW Player promo video, webcast links) | Videos page (YouTube) | Review the webcast links |
| MoU documents (`MOUS.aspx`) | Harvested but not shown on any page | **Open**: content batch |
| News ticker (`<marquee>`) | Pausable ticker | Done |
| Print and share | Page tools | Done |
| Admin panel | Internal back-office | Planned (NIC) |
| Google Search Console ownership files | Kept at the same address (`public/`) | Done |

## 5. Results and open items (inventory of 6 Oct 2026)

26,004 items: 292 page addresses, 2,196 query-string pages, 17,712 documents, 2,800 media
files, 236 outside links, and 2,766 old design, server and system files that are not
carried over. About 19,200 documents and media files (27.8 GB) keep their addresses.

| Open item | Count | Next step | Owner |
|---|---|---|---|
| Documents linked from old **static** pages but not from the new pages. Top sources: FRA (238 links on the live page), the Hindi pages (FRA, Establishment, CLM, Vigilance, NGO, Scholarship) and Livelihood | 638 | Add them to the matching new pages, in English and Hindi | Developer, then divisions check |
| Video or audio files linked from old pages but not from the new pages | 10 | Same | Developer |
| Documents and media in **database lists** (sanction orders, archives, tenders, minutes, photo albums) | 10,036 + 356 | Build the lists from the NIC export | NIC (export), Developer |
| Query-string pages with database items (sanction-order details, photo albums) | 2,195 | Same | NIC, Developer |
| Documents linked on the live site but **missing from the local copy** | 1,257 (16 also 404 on the live site) | Copy from the live server at switch-over; re-run the inventory on a fresh copy | NIC |
| Old pages held back until their content is migrated | 17 | See §3 | Developer, NIC |
| Old address needing a decision: `grievance/schreport.aspx` (scholarship grievance report; data last updated 2019) | 1 | Retire, or keep in the back-office | Ministry |
| Outside links on old pages that are not on the new pages | 147 | Editor review: keep, replace or drop (many are single social-media posts) | Divisions, WIM |
| Pictures shown on old pages but not on the new pages (files kept) | 434 | Editor review | Divisions, WIM |

`npm run check:release` prints these. Go-live needs it to report "Ready". Defects of the
live site found by the crawl (not migrated) are listed in
[1_Collect](GIGW_DBIM_Standardisation/1_Collect/Access_and_Security_Status.md) §2.
