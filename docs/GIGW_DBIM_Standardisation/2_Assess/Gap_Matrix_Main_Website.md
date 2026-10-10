# Step 2 output: gap matrix, main website (tribal.gov.in)

The issues of the new tribal.gov.in against GIGW 3.0 and DBIM v3, each with its priority,
owner and evidence. Sister portals are assessed separately in the
[sister-portal gap matrix](Gap_Matrix_Sister_Portals.md). The problems of the current live
site are listed in [1_Collect](../1_Collect/Access_and_Security_Status.md) §2.

Last reviewed **6 Oct 2026**. Commands (`npm run …`) run in the repository root, and code paths
are relative to it.

> **No conformance claim.** The site is not certified: STQC has not assessed it, and the
> manual accessibility audit has not been done. Do not describe it as "GIGW compliant",
> "DBIM compliant" or "WCAG 2.1 AA" until the evidence says *Verified* and STQC has issued a
> certificate ([checklist](../5_Verify/Compliance_Readiness_Checklist.md)).

## 1. Sources and how they are read

The official documents, their editions and checksums are listed in
[GIGW_DBIM_Guidelines/README.md](../../GIGW_DBIM_Guidelines/README.md). The MeitY website was a
visual reference only.

Points where the sources conflict or say nothing:

- **Two GIGW 3.0 editions.** The PDF exists in two editions with the same number. The edition
  of 27 Jul 2026 adds a checkpoint (Lifecycle S/N 10, PDF p. 115; guideline 5.4, p. 96): a
  choice of language, e.g. a pop-up, before the visitor enters the site. This matrix follows
  that edition.
- **Mandatory or advisory.** GIGW 3.0 does not mark checkpoints as mandatory or advisory. Each
  of the 88 Annexure II checkpoints is treated as a certification checkpoint, because STQC
  assesses against them (Handbook §3).
- **Status of the DBIM rules.** The DBIM certification rules are Issue 01, but the PDF's title
  still says "Draft". The DBIM toolkit website shows no version or date.
- **More languages.** DBIM v3 §7.5 asks for content in all official languages through
  translation technology, but no checkpoint in GIGW or DBIM Annexure F tests for it, and
  neither names BHASHINI ([BHASHINI feasibility](../5_Verify/BHASHINI_Feasibility.md)).
- **Language URLs.** DBIM §7.5.2 asks both for a separate URL per language (c) and for
  switching language "without … navigating to a different URL" (f). The site uses separate
  URLs (`/hi/…`).

Requirements fall into three classes:

| Class | Meaning |
|---|---|
| Certification checkpoint | A GIGW 3.0 Annexure II or DBIM Annexure F item |
| Recommendation | Guideline text worded "should", or a DBIM best-practice section |
| Project choice | Not required by either guideline (e.g. static site, Pagefind search, Warli artwork) |

## 2. Priority gaps

P1 = blocks go-live or is a live risk · P2 = before certification · P3 = after go-live.
Statuses follow the [conventions](../README.md#conventions). T-… are plan items in the
[review package](../6_Submit/Review_Package.md) §3.

| # | P | Issue | Evidence | Impact | Fix | Verification | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | P1 | Public conformance claims without evidence (before 6 Oct 2026): footer badges "GIGW 3.0 / DBIM 3.0 / WCAG 2.1 AA" on every page; accessibility statement ("designed to conform", Hindi "built in conformance", screen readers named as if tested); screen-reader page ("follows GIGW 3.0 and WCAG 2.1 AA"); videos page ("captions … shown on YouTube") | `Footer.astro`, `policies.ts`, `policies-hi.ts`, `ScreenReaderView.astro`, `VideosView.astro`; no certificate; no manual audit; not every video is captioned | Misleading public claims | Badges removed; statement rewritten with "Conformance status: not yet assessed"; page texts corrected (Hindi to be vetted) | No conformance claim left in the built text; UAT 21/21 | Developer; Ministry approves the statement | **Fixed** |
| 2 | P1 | Content not fully migrated | Inventory of 6 Oct 2026 (`docs/Migration/`): 638 documents and 10 video or audio files linked from old static pages are not on the new pages; 10,036 documents, 356 media files and 2,195 query pages exist only in database lists; 1,257 documents linked on the live site are missing from the local copy | Content lost at switch-over | Add the static-page documents; build the database lists from the NIC export (T-32); copy documents from the live server (T-33) | `npm run check:release` reports Ready | Developer; NIC; divisions check | Open; database part **blocked** until the export |
| 3 | P1 | Old addresses not redirected: 51 of 106 English pages, 0 of 70 Hindi, 0 of 5 others | `App/*.aspx` compared with the old `generated/redirects.json` | Bookmarks, search results and links inside PDFs return 404 | Map of 186 old addresses in `src/data/legacy-urls.json`: 169 redirect, 17 are held until their content is migrated (row 2); 5 more are retired with a reason and 1 awaits a decision; old search keeps `?q=`; Search Console files kept | `npm run test:redirects`: 309 checks passed on the local IIS stand-in, 6 and 10 Oct 2026 | Developer | Partly done; staging pending |
| 4 | P1 | Redirect loop: `SanctionOrder.aspx` was redirected while the sanction-orders page links to it | `dist/web.config`; `SanctionView.astro` | Earlier sanction orders unreachable | Pages the new site still links to are held back in `legacy-urls.json`; `check:links` fails on any loop | 1 loop on the old build, 0 after the fix | Developer | **Fixed** |
| 5 | P1 | The new site depends on old documents and pages, but the deployment guide did not say so | 649 document addresses linked from the new pages; PFMS reports linked as live `.aspx` pages; the old guide said "copy dist to the site root" | Documents and reports break if the old folders are not carried over | Decided 6 Oct 2026: the old public site is retired, the back-office stays internal, documents keep their addresses as static files. [DEPLOYMENT.md](../../DEPLOYMENT.md) §4 gives the copy rules (about 19,200 files, 28 GB) | `npm run test:documents`: 649 of 649 open at their old addresses on the local stand-in; staging pending | NIC (copy, sync); Developer | Partly done |
| 6 | P1 | The feedback form validates but never submits (`data-endpoint=""`) | `FeedbackView.astro`; the old `Feedback.aspx` saved submissions | GIGW Quality S/N 11 not met | Decided 6 Oct 2026: a handler in the internal back-office, reached through an IIS proxy path, as for TriBot (T-25) | End-to-end test on staging | Developer; NIC | Open |
| 7 | P1 | "Last updated" and "page last reviewed" dates are the build time; the `datetime` attribute is a UTC date while the text shows the IST date | `site.ts` `lastUpdated: new Date()`; a build at 05:20 IST showed `datetime="2026-10-05"` with the text "06 Oct 2026" | Review dates are invented; GIGW Quality S/N 5 | Content-based dates in IST; "reviewed" only when a review is recorded | Unit test and page check | Developer; content owners record reviews | Open |
| 8 | P1 | No choice of language before entering the site (added in the 27 Jul 2026 edition) | Lifecycle S/N 10, PDF p. 115 | Checkpoint of the current edition not met | Accessible first-visit language chooser in the kit | UAT test and screen-reader check | Developer | Open |
| 9 | P1 | Accessibility tested only with axe-core in headless Chrome | 0 violations in 104 combinations of 16 pages (5, 6 and 10 Oct 2026); no screen-reader, 200 % zoom, text-spacing or other-browser tests | WCAG 2.1 AA cannot be claimed | Manual tests (T-16); axe over all 229 pages; a Firefox run | Recorded manual results | Tester; independent auditor | Pending manual review |
| 10 | P1 | Credentials and personal data sit beside the code | Old `App/Web.config` has plaintext SQL credentials; `DB/` holds two backups of about 6 GB; a copy of the old chat widget (`chat_popup/`) held a TriBot API key | Leak if the folders are shared or pushed | Repository root `MoTA-Website/` leaves the old source and backups outside; `.gitignore` safety net; chat widget copy deleted on 6 Oct 2026 (`chat_popup/` now holds the website's assistant, which uses no API key); secret scan in CI (planned); NIC to rotate the database passwords (T-10) | CI secret scan | Developer; NIC | Partly done |
| 11 | P1 | Known-vulnerable build dependencies; Node 20 is past end-of-life | `npm audit`, 6 Oct 2026: 1 critical, 9 high, 19 moderate, 1 low. Astro 5.18.2 is critical (AVIF image RCE at build time, several XSS advisories); sharp and the test tools are high. Node 20 reached end-of-life on 30 Apr 2026 | Audit finding; build-machine risk | Node 24 LTS (build verified 6 Oct 2026) and Astro 7, with all test suites re-run | `npm audit` shows no high or critical | Developer | Open |
| 12 | P2 | The cookie notice offers "Analytics", but the site has no analytics; it says "cookies" but uses browser storage | `SiteDialogs.astro`, `dialogs.ts` | Inaccurate privacy notice | Show only the categories in use; correct the wording | UAT | Developer; Ministry approves the text | Open |
| 13 | P2 | The STQC badge's expiry was checked only at build time, while the content guide said it disappears by itself | `Footer.astro` | An expired certificate could stay on show | Also hidden in the browser after `validTill` (`expiry.ts`) | Kit build; UAT | Developer | **Fixed** |
| 14 | P2 | No status is recorded for each GIGW and DBIM checkpoint. The workbook of 5 Oct 2026, since removed as superseded, used its own IDs without clause or page references and marked automated-only results "Compliant" | This matrix lists known gaps only | Cannot support an STQC submission | Clause-by-clause traceability to GIGW Annexure II (88) and DBIM F.1/F.2 (77) (T-37) | Review | Developer | Open |
| 15 | P2 | HTML validity not checked (WCAG 4.1.1; GIGW Accessibility S/N 48) | No validator has been run | Unknown | W3C Nu checker in CI (T-17) | Report | Developer | Open |
| 16 | P2 | Search covers HTML pages only; DBIM F.1 #42 asks for HTML, PDF and image metadata | Pagefind indexes built pages | Partly met | Index document titles and metadata; record the limit | Search test | Developer | Open |
| 17 | P2 | State Emblem artwork taken from Wikimedia Commons | DBIM F.1 #19 requires an authorised source | Checkpoint not met | Artwork from the DBIM toolkit (T-14) | Visual check | Ministry | Open |
| 18 | P2 | Hindi month names depend on the Node/ICU version ("अक्तू॰" on Node 20, "अक्टू॰" on Node 24) | Build comparison of 6 Oct 2026 | Inconsistent Hindi | Fixed month table once the OL Division chooses the spelling (T-12) | Unit test | OL Division; Developer | Open |
| 19 | P2 | Accessibility of the old PDFs unknown: 16,288 PDFs in the old source, many apparently scanned | DBIM F.2 #26 | Cannot be claimed | Flag tagged or untagged and text or scanned in the inventory; divisions fix them | Inventory report | Divisions | Open |
| 20 | P3 | Hindi text not vetted | Median Hindi share 87 %; lowest pages 19–24 % (English document titles) | Quality | OL Division review (T-12) | Sign-off | OL Division | Open |
| 21 | P3 | The footer says "Designed, developed and hosted by NIC" | Same wording as the live site | May not describe the new build | Ministry confirms the wording | — | Ministry | Open |
| 22 | P1 | The live server does not send its intermediate TLS certificate | `openssl s_client`: verify return code 21; Node: UNABLE_TO_VERIFY_LEAF_SIGNATURE; missing "GlobalSign GCC R6 AlphaSSL CA 2025" | Some browsers, apps and all scripted clients cannot connect | Install the full chain on production and staging (T-08) | `openssl s_client` returns 0 | NIC hosting | Open |
| 23 | P1 | The local copy of the old site is incomplete and out of date | `grievance/schreport.aspx` answers on the live site but is not in the copy; the live menu links JJGD, the copy JJGU | Content could be lost if copied from this copy | Copy the documents from the live server at switch-over (T-33; [DEPLOYMENT.md](../../DEPLOYMENT.md) §4) | Inventory re-run on a fresh copy | NIC | Open |
| 24 | P2 | The draft website policies describe practice that is not yet in place: the security policy says the site "carries a safe to host certificate"; the archival policy says archived items show the archiving date (not implemented); the cookie policy asserts conformity with the DPDP Act, 2023 | `src/data/policies.ts`, `policies-hi.ts` (drafts; GIGW Lifecycle S/N 3 requires approval) | STQC compares the policies with practice | Ministry checks each policy against practice before approval (T-15); developer implements what is approved | Review record | Ministry (WIM); Developer | Open |
| 25 | P2 | Chat assistant "Jago" (TriBot service): answers are written by AI and can be wrong; questions go to the TriBot service and voice input to the browser's speech service; the service rejects cross-origin calls from tribal.gov.in, so the live site's own popup may not work today | 3 questions sent to the live service on 6 Oct 2026, as a visitor would: the PM-JANMAN answer was incomplete, the Hindi answer read as machine translation, sources came back "Unknown"; CORS preflight from `https://tribal.gov.in` returned HTTP 400 | Misleading answers; privacy expectations | Widget rebuilt with an AI notice and a personal-data warning; answers shown as text only; same-origin proxy rule prepared (T-30). The privacy policy should name the TriBot service and the browser speech service | `npm run test:assistant`: 8 checks passed with a stand-in service; live service on staging pending | Developer (done); NIC (proxy); Ministry and TriBot team (answer quality, privacy text) | Partly done |
| 26 | P2 | The Prime Minister's quote on the Hindi home page is in English | `PMQuote.astro`, marked `lang="en"`; DBIM F.2 #9; [screenshot](../3_Build/Screenshots/04_Home_Hindi_phone.jpg) | The Hindi home page is not fully in Hindi | Official Hindi version from an authorised source (T-34) | Visual check | Ministry; OL Division | Open |
