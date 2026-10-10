# Step 6 output: review package

For the review of the GIGW 3.0 and DBIM standardisation of tribal.gov.in, due on
**20 Oct 2026** (T-18). Position on **6 Oct 2026**.

The outputs of steps 1–5 are listed in the [task README](../README.md). This package adds:
- the demonstration;
- a summary of the work;
- the plan, with its owners and dependencies;
- the decisions needed.

## 1. Demonstration (about 20 minutes)

Before the meeting, in the repository root:
1. Run `npm run build`.
2. Run `node scripts/serve-uat.mjs --docs ../MoTA_Website_Old/App`.
3. Open http://127.0.0.1:4322/.

Then show:

1. **Home page:** in English at desktop width (DBIM header, main menu, banners, footer), then
   at phone width (the browser's responsive mode).
2. **Language:** an inner page, then the language menu, which opens the same page in Hindi.
3. **Accessibility:** press Tab from the top (the skip link comes first); open the
   accessibility panel; switch to high contrast.
4. **Search:** "scholarship" in English and in Hindi.
5. **Chat assistant:** open it and ask a suggested question. On UAT the answer comes from the
   site search, because the TriBot service needs the IIS proxy on staging.
6. **Old addresses:**
   - http://127.0.0.1:4322/Home.aspx goes to the new home page;
   - http://127.0.0.1:4322/ResourcesHindi/Homeh.aspx goes to the Hindi home page;
   - a PDF from the Documents menu opens at its old address.
7. **Component kit for other portals:** run `npx http-server packages/dbim-kit -p 8080`, then
   open http://localhost:8080/examples/ (the gallery in every DBIM colour group).
8. **Evidence:** `docs/Evidence/runs/2026-10-10-final/`, the final test run.

## 2. Completed

- **The new tribal.gov.in, built to DBIM v3:** 114 pages in English and 114 in Hindi, for
  desktop and phone, with 34 reusable components for other MoTA portals (not yet approved).
- **The live home page carried over:** the 59 components on the checklist, and all 150 links
  and controls of its navigation. JJGD was added on 6 Oct. The chat assistant was rebuilt in
  the site design.
- **Old addresses:** every old page address is mapped (186). The 649 documents linked from
  the new pages keep their old addresses.
- **Assessment:** the main website and 21 sister portals were assessed separately. No sister
  portal was changed.
- **Automated tests pass** ([test report](../5_Verify/Test_Report.md)):
  - site 21 of 21, with 0 accessibility violations in 104 combinations;
  - kit 13 of 13;
  - redirects 309 of 309;
  - documents 649 of 649;
  - chat assistant 8 of 8.
- **Claims:** unsupported public claims removed (conformance badges and wording).
- **Deployment:** nothing deployed to staging or production.

## 3. Plan, owners and dependencies

The plan of 5 Oct 2026, with its status on 6 Oct. Items T-32 to T-37 were added on 6 Oct.
P1 = blocks go-live or is a live risk; P2 = before certification; P3 = after go-live.

**Done:**
- T-01: DBIM layout;
- T-02: bilingual site;
- T-03: component kit;
- T-04: assessment of tribal.gov.in;
- T-29: live home page carried over.

| ID | Task | P | Owner | Target | Status, 6 Oct 2026 |
|---|---|---|---|---|---|
| T-05 | Assess the 21 sister portals | P1 | Web team | 12 Oct 2026 | In progress: 14 assessed; 6 to re-check from NICNET, and forestrights.nic.in once its certificate is renewed |
| T-06 | Staging server for the new site; deploy the build with its `web.config` | P1 | NIC hosting | 12 Oct 2026 | Not started |
| T-07 | Re-run the test suites, audit and Lighthouse on staging | P1 | Web team | 14 Oct 2026 | Blocked until T-06 |
| T-08 | TLS on staging and production: full certificate chain, TLS 1.2 and 1.3 only (row 22) | P1 | NIC hosting | 15 Oct 2026 | Not started |
| T-09 | Latest security audit report and Safe-to-Host status of the current site, with pending observations (S-01) | P1 | MoTA IT Cell, NIC | 10 Oct 2026 | In progress |
| T-10 | Interim hardening of the current site: remove FCKeditor and backup files, debug off, custom errors, fix X-Content-Type-Options, encrypt connection strings, rotate the database passwords (A-01) | P1 | NIC, application team | 15 Oct 2026 | Not started |
| T-11 | Security audit of the staging build by a CERT-In empanelled auditor, then Safe-to-Host (S-02, S-03) | P1 | MoTA IT Cell | 16 Oct 2026 (request) | Not started; needs T-06 |
| T-12 | OL Division vets the Hindi text and chooses the spelling of month names (rows 18, 20) | P1 | OL Division | 17 Oct 2026 | Not started |
| T-13 | Divisions re-upload 21 missing documents and a compressed copy of the 135.6 MB PDF; give Hindi document titles; check the 638 documents to add; review 147 outside links and 434 pictures | P1 | Divisions | 17 Oct 2026 | Not started |
| T-14 | State Emblem artwork from the DBIM toolkit; approve the co-branding logos (row 17) | P1 | Ministry, web team | 12 Oct 2026 | Not started |
| T-15 | Approve the components, and the website policies after checking them against practice (row 24); nominate the Web Information Manager (S-07, S-08) | P1 | Competent authority | 17 Oct 2026 (WIM: 12 Oct) | Not started |
| T-16 | Manual accessibility tests: NVDA, JAWS, TalkBack, VoiceOver, 200 % zoom, text spacing; Safari, Edge and real phones (row 9, S-10) | P1 | Testers | 16 Oct 2026 | Not started. Safari automation needs an administrator and Edge is not installed, so use real devices |
| T-17 | W3C HTML and CSS validation of all page templates (row 15) | P2 | Web team | 14 Oct 2026 | Not started |
| T-18 | Submit the gap matrix, prototype, component kit and this package for review | P1 | Web team | 20 Oct 2026 | Package ready on 6 Oct |
| T-19 | Production deployment after the approvals and Safe-to-Host | P2 | MoTA, NIC | — | Not started |
| T-20 | STQC evaluation under GIGW 3.0 (S-04, S-11) | P2 | Web Information Manager | After go-live | Blocked: needs the production address, the Website Quality Manual, approved policies and a WIM |
| T-21 | Renew the forestrights.nic.in certificate (expired 26 Jul 2026); switch off TLS 1.0 and 1.1 | P1 | Portal owner, NIC | 9 Oct 2026 | Not started |
| T-22 | Renew the certificates expiring before the end of November 2026: tritribal, dbttribal, stcmis, TribeX | P2 | Portal owners | 15 Nov 2026 | Not started |
| T-23 | Adopt the kit on the P1 portals, staging first | P2 | Portal owners | After T-15 | Not started |
| T-24 | NESTS session cookie (Secure, HttpOnly); NSTFDC session ID in the URL | P1 | Portal owners | 20 Oct 2026 | Not started |
| T-25 | Feedback form back end: a handler in the internal back-office, reached through an IIS proxy (row 6) | P1 (P2 on 5 Oct) | Web team, NIC | With staging | Approach decided on 6 Oct |
| T-30 | Connect the chat assistant to the TriBot service through the IIS proxy at `/tribot-api/` | P2 | NIC, TriBot team | With staging | Not started; the proxy rule points at `https://tribot.tribal.gov.in/api/v1` |
| T-32 | NIC content-only database export ([request](../../Migration/nic-content-export.md)), for 10,036 documents and 2,195 pages in database lists and 13 of the 17 held pages (row 2) | P1 | NIC | Not set | Not started. Checking content against the database is blocked until it arrives |
| T-33 | Current copy of the document folders from the live server; 1,257 documents are missing from the copy (rows 5, 23) | P1 | NIC | At switch-over | Not started |
| T-34 | Official Hindi version of the Prime Minister's quote (row 26) | P2 | Ministry, OL Division | Before go-live | Not started |
| T-35 | Hosting details: data centre, network, backup and disaster recovery (S-09) | P2 | NIC | 14 Oct 2026 | Not received |
| T-36 | Website Quality Manual in the STQC format (S-06) | P2 | Web team | 17 Oct 2026 | Not started |
| T-37 | Status of each of the 88 GIGW checkpoints and 77 DBIM Annexure F items, with evidence (S-05, row 14) | P2 | Web team | 20 Oct 2026 | Not started |

**Later (P3):**
- T-26: web analytics with consent;
- T-27: BHASHINI pilot on staging (decision 6);
- T-28: campaign banners without text in the image, and captions on all YouTube videos (Media cell);
- T-31: visitor-counter feed, if the counter is kept (decision 5).

## 4. Decisions requested

1. Approve the components for production use, or list the changes wanted (T-15).
2. Approve the website policies once they are checked against practice, and nominate the Web
   Information Manager (T-15).
3. Name of the chat assistant: "Jago" (as in the new widget) or "TriBot" (as on the live site).
4. `grievance/schreport.aspx`, the scholarship grievance report with data last updated in
   2019: retire it, or keep it in the back-office.
5. Keep or drop the visitor counter (it needs a counter feed, T-31).
6. BHASHINI: approve a pilot after go-live (T-27), and choose option A or B
   ([BHASHINI feasibility](../5_Verify/BHASHINI_Feasibility.md)).
7. Confirm that go-live waits for staging tests, the security audit, Safe-to-Host and
   production approval.
8. Navigation of the old home page ([test report](../5_Verify/Test_Report.md) §3):
   - **Footer items left out.** Confirm leaving out:
     - the STQC logo: its certificate expired on 12 Feb 2026. The footer shows a new
       certificate on its own once it is set in `src/data/site.ts`;
     - "Built on CMF": the new site is not built on NIC's Common Minimum Framework.
   - **JJGD link.** Confirm the JJGD link on the Janjatiya Gaurav Varsh logo in the header.
   - **Old sub-menu items.** Name any that must sit directly in the menu. 46 of them are now
     one level down, on section pages, as the DBIM menu shows them.

## 5. Deployment rule

No change goes to production until the UAT review is complete and production approval is
given. The order is staging, security audit, Safe-to-Host, then production, following
[DEPLOYMENT.md](../../DEPLOYMENT.md). The current site at https://tribal.gov.in stays
unchanged until then.
