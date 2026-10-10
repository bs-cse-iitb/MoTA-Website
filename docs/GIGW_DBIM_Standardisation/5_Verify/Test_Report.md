# Step 5 output: test report

The final test run of the updated UAT website, on **10 Oct 2026**, on the version in this
repository. All reports are in `docs/Evidence/runs/2026-10-10-final/`; the results match the
earlier runs of 5 and 6 Oct.

## 1. Environment

| Item | Used |
|---|---|
| Server | Local IIS stand-in (`scripts/serve-uat.mjs`). It serves the build with the headers, redirects and 404 page of the generated `web.config`; the old site's document folders were mounted for the document test |
| Browser | Google Chrome 155, headless, driven by Puppeteer 22.15.0 |
| Screen widths | 320, 390, 768, 1366 and 1920 px; standard, dark and high-contrast themes |
| Computer | macOS 26.6.2; Node.js 20.12.1. Every suite was repeated with Node.js 24.21.0, the version GitHub's checks use, on a clean copy of the repository (`npm ci` from scratch), with the same results |
| **Not covered** | NIC staging; Firefox, Safari and Edge; real phones; screen readers |

## 2. Results

| Suite | What it checks | Result | Report |
|---|---|---|---|
| Build | The site builds in both languages | Pass: 229 pages | `build.txt` |
| Link check | Broken internal links, missing anchors, pages without a heading, redirect loops | 0, 0, 0, 0 | `check-links.txt` |
| Type check | TypeScript | 0 errors | `typecheck.txt` |
| Site UAT, 21 cases | axe-core WCAG 2.1 A and AA over 104 page, width and theme combinations (16 pages, both languages); no sideways scrolling; keyboard; menus; dialogs; language switch; cookie consent; search; forms; chat assistant; metadata; sitemap; security headers | **21 of 21 passed**; 0 axe violations; 0 sideways-scroll failures | `uat-suite.txt`, `uat/` |
| Component kit, 13 cases | Gallery and templates in 11 colour groups and 3 themes; keyboard; phones; consent; language; strict Content-Security-Policy | **13 of 13 passed**; the rebuilt kit matches the one in the repository except for the date in the gallery footer | `kit-build.txt`, `kit-suite.txt`, `uat-kit/` |
| Old addresses | 186 old page addresses: redirect target, letter case, query string, held and retired pages | **309 of 309 passed** | `redirects-test.txt` |
| Documents at old addresses | The 649 documents linked from the new pages | **649 of 649 passed** | `documents-test.txt` |
| Chat assistant, 8 tests | Keyboard, the 11 languages, the request format, list and table answers, markup shown as text, search fallback, conversation kept between pages, Hindi pages, axe with the chat open (3 themes, Hindi, phone) | **8 of 8 passed**, against a stand-in for the TriBot service | `assistant-test.txt`, `assistant/` |
| Home-page checklist | The 59 listed components of the live home page | **59 of 59 passed** | `check-parity.txt`, `live-parity.csv` |
| Navigation of the live home page | Every link and control in its navigation (150), traced to the new site (§3) | **0 missing** | `check-nav.txt`, `nav-parity.csv` |
| Audit of the new build | Lighthouse, axe, headers and page weight of the English and Hindi home pages and a scheme page | axe 0 rules failing; Lighthouse accessibility 97; home page 1,374 KB (Hindi 1,397 KB) against 17,671 KB for the live home page on 5 Oct | `prototype-audit.txt`, `prototype/` |
| Dependency audit | Known vulnerabilities in npm packages | **Failed**: 1 critical, 9 high, 19 moderate, 1 low (gap matrix row 11) | `npm-audit.json` |
| Go-live readiness | Migration blockers | **Not ready**: 5 open areas | `check-release.txt` |

## 3. Navigation check of the old home page

**Question.** Is every link and control in the navigation of https://tribal.gov.in/Home.aspx
on the new site?

**Method.** `npm run check:nav` compared the two automatically, using a copy of the live page
saved on 6 Oct 2026 at 10:49 IST (`old-Home.aspx.html`).
- **Coverage:** the top bar, header, main menu with its sub-menus, footer links strip,
  footer, portal logo band, social media bar and back-to-top button. Also the home page's
  Divisions & Schemes, Innovative Initiatives and What's New blocks.
- **Old addresses** are followed through the redirect map.
- **Changed addresses:** where another website changed its address, the new address is
  matched; the CSV notes each case, for example NVSP, now the Voters' Service Portal, and
  Twitter, now X.

**Result: nothing from the old navigation is missing.** This was not checked by hand.

| Status | Items | What it means |
|---|---|---|
| In menus | 50 | The same link or control is in the header or footer of every page (1 click) |
| On a page | 82 | Linked from the home page (63) or from a page in the menus (19): 2 clicks. Most are third-level items of the old drop-down menus, which the DBIM menu shows on section pages |
| Same website | 3 | The new site links the home page of the same website: India.gov.in, PIB and Bhuvan |
| Held | 11 | Sanction Orders by year: the new page links the old pages until the NIC export (T-32) |
| Left out | 2 | The STQC logo (its certificate expired on 12 Feb 2026) and "Built on CMF" (not true of the new site): decision 8 in the review package |
| Dead on old site | 2 | The old link went nowhere (`#`) |
| **Total** | **150** | All 70 new pages reached also exist in Hindi |

- **Fixed:** JJGD, the Janjatiya Gaurav Varsh site, was missing. It was added on 6 Oct
  ([changes](../4_Implement/Changes_on_UAT.md) §2).
- **Not counted:** the other 13 links on the old home page are content, not navigation:
  banners, the notice, the Ministers' cards and highlights. 9 are on the new home or What's
  New page, and 4 went nowhere.
- **Defects found:** the check found defects in the live site. They are listed in
  [1_Collect](../1_Collect/Access_and_Security_Status.md) §2.
- **Limits:**
  - only the English home page was compared item by item; the Hindi pages share its menus;
  - the check reads the page code, not what each screen width shows. The header logos are
    hidden below 1024 px, so JJGD is also listed on the Portals page;
  - other websites were checked once, on 6 Oct.

## 4. What these results do not show

- **Accessibility.** Automated tools find only part of the WCAG 2.1 problems. Not done yet:
  - a full keyboard walk-through;
  - screen readers (NVDA, JAWS, TalkBack, VoiceOver);
  - 200 % zoom;
  - text spacing (T-16).
- **HTML and CSS validity.** The W3C validators have not been run (T-17).
- **Staging.** Headers, TLS, redirects, documents and speed on the NIC server (T-07, T-08).
- **Chat assistant against the real service.** This needs the IIS proxy on staging (T-30).
- **Other browsers and devices.** Firefox, Safari and Edge; Android and iOS phones.

## 5. How to repeat

The commands are in [RUN.md](../../../RUN.md): *Checks* and *Keeping test evidence*. Also run
`npm audit`, `npm run check:release`, and the audit of the local build under *Other commands*.
