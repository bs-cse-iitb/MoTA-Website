# Step 4 output: the updated UAT website

What has changed on the UAT website, by area, with evidence. **Nothing has been deployed to
staging or production.** Open issues are not repeated here: they are the rows marked *Open*
in the [main-website gap matrix](../2_Assess/Gap_Matrix_Main_Website.md).

Changes made on 5 Oct 2026 are marked "(5 Oct)"; the rest were made on 6 Oct. Evidence
paths are relative to `docs/Evidence/`. The reports of 6 Oct are in
`runs/2026-10-10-final/`, the final test run.

## 1. Accessibility

| Change | Evidence | Status |
|---|---|---|
| Skip link, landmarks, one heading 1 per page; menus, dialogs, tabs and carousels work by keyboard; pausable banner and ticker; accessibility panel (5 Oct) | `uat-suite.txt`, cases TC-001 to TC-013 | Done; automated tests only |
| Automated WCAG 2.1 A and AA checks: 0 violations in 104 page, width and theme combinations | `uat-suite.txt`, `uat/results.json` | Done; automated only |
| Chat assistant rebuilt: labelled controls, a live log of the conversation, focus returns to the button, answers marked with their language, works in all themes and on phones. A dark-theme contrast fault of the old version is fixed | `assistant-test.txt` (8 of 8) | Done |
| Accessibility statement rewritten to give its real status, "not yet assessed" | `src/data/policies.ts`, `policies-hi.ts` | Done; Ministry approval and Hindi vetting pending |
| Hindi persona pages: portal descriptions were marked as English (`lang="en"`), so screen readers would read the Hindi with English rules. They are now marked as English only where English text is shown | `src/components/page/views/PersonaView.astro`, `PortalsView.astro` | Done |

## 2. Content

| Change | Evidence | Status |
|---|---|---|
| The live home page carried over: 58 items (5 Oct). The navigation check found one more, JJGD: the live menu links it, while the source copy has JJGU. JJGD is now linked from the Janjatiya Gaurav Varsh header logo and listed in Portals, in both languages; Hindi descriptions were added for the JJGD and JJGU portals | `runs/2026-10-10-final/`: `live-parity.csv` (the checklist) and `nav-parity.csv` ([test report](../5_Verify/Test_Report.md) §3) | Done; Hindi text to be vetted (T-12) |
| 114 pages in English and 114 in Hindi; interface text and policies in both languages | `assessment/hindi-coverage.json` (median 87 % Hindi) | Done; Hindi to be vetted by the OL Division (T-12) |
| Unsupported public claims removed: the footer badges "GIGW 3.0 / DBIM 3.0 / WCAG 2.1 AA", and conformance wording on the screen-reader and videos pages | Gap matrix row 1 | Done |
| FAQ document linked from the Help page; the old `FAQ.aspx` redirects there | `check-links.txt` | Done |

## 3. Broken links and old addresses

| Change | Evidence | Status |
|---|---|---|
| 21 documents missing on the live server left out of the new pages and listed for the divisions | `broken-links-report.csv` | Done; divisions to re-upload (T-13) |
| No broken internal links or anchors; a check for redirect loops added | `check-links.txt` | Done |
| 186 old page addresses mapped, including every Hindi page: 169 redirect permanently and 17 are held until their content moves. 5 more are retired and 1 awaits a decision. `/Home.aspx` redirects to `/` | `redirects-test.txt` (309 checks) | Done on UAT; staging pending |
| The 649 documents linked from the new pages open at their old addresses | `documents-test.txt` | Done on UAT with the old folders; staging pending |
| Google Search Console ownership files kept at their addresses | `public/` | Done |

## 4. Performance

| Change | Evidence | Status |
|---|---|---|
| Home page 1.3 MB instead of 17.3 MB on the live site (1,374 KB on 10 Oct; 1,201 KB on 5 Oct); images converted to WebP for each screen size; fonts self-hosted; no public CDNs (5 Oct) | `runs/2026-10-10-final/prototype/summary.csv`; live site: `assessment/raw/summary.csv` | Done; re-measure on staging |
| Chat mascot 3 KB and 6 KB instead of 1.9 MB | `public/images/assistant/` | Done |

## 5. Security

| Change | Evidence | Status |
|---|---|---|
| Static public site: no server code, database, login or uploads on the public server (5 Oct) | [TECHNOLOGY.md](../../TECHNOLOGY.md) | Done |
| All of the following are set in the generated `web.config`: security headers (Content-Security-Policy without inline scripts, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy); only GET, HEAD and POST allowed; HTTPS by 301; custom 404 page; no server banner | `uat-suite.txt` (TC-021); `dist/web.config` | Done on the local stand-in; verify on staging |
| Chat assistant: answers shown as text only, so markup in an answer cannot run (tested); no API key in the browser or the code; same-origin proxy | `assistant-test.txt` | Done |
| Credentials and the API-key folder kept out of any repository (`.gitignore`); secrets not reproduced in documents | `.gitignore` | Done |
