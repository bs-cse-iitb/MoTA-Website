# Step 1 output: access and security status

This document covers:
- what was obtained for the work, and what is still missing;
- the security and condition of the current website.

Position on **6 Oct 2026**. Owners and target dates of the follow-up tasks (T-…) are in the
[review package](../6_Submit/Review_Package.md) §3.

## 1. Access

| Item | Status | Where | Next action |
|---|---|---|---|
| Source code of the current site (ASP.NET) | **Received, incomplete:** a 27 GB copy of the application folder. The live site differs from it in both directions: `grievance/` and 1,257 linked documents are missing from the copy; `ContactUsh.aspx` and `results.aspx` are in the copy but not live. On 6 Oct the live menu linked JJGD where the copy has JJGU | `MoTA_Website_Old/App`, outside the project. Its `Web.config` holds plaintext database credentials, so keep it confidential | NIC sends a current copy from the live server (T-33) |
| Source code of the new site | Available | This repository | Publish to GitHub as a private repository once approved |
| UAT access | **Local only.** The IIS stand-in serves the build with the same headers, redirects and 404 page as IIS | [RUN.md](../../../RUN.md) | NIC provides the staging server (T-06) |
| Database backups | **Received, not restored:** two SQL Server backups of 1 Sep 2026, about 6 GB each, probably with personal data | `MoTA_Website_Old/DB/` | Decided 6 Oct 2026: NIC sends a content-only export instead (T-32, [request](../../Migration/nic-content-export.md)) |
| Security audit report of the current site | **Not received** | — | Obtain the latest report and its pending observations (T-09) |
| Safe-to-Host certificate | **None on record** for the current site; the new build has not been audited | — | Audit the new build on staging, then Safe-to-Host (T-11) |
| STQC certificate | **Expired on 12 Feb 2026.** STQC/WQCS/GIGW/2023/Q1/05, issued under GIGW 2018 | `https://tribal.gov.in/DivisionsFiles/STQC13022023.pdf` | New evaluation under GIGW 3.0 after go-live (T-20) |
| Hosting details: data centre, network, backup and disaster recovery | Not received | — | NIC (T-35) |
| Network access to 6 sister portals | Not reachable from the assessment network | [Sister-portal gap matrix](../2_Assess/Gap_Matrix_Sister_Portals.md) | Re-run the assessment from NICNET (T-05) |
| TriBot chat service | Reachable; answers without an API key | `https://tribot.tribal.gov.in/api/v1` | Same-origin proxy on staging (T-30) |

## 2. The current website

Observed from outside on 5 and 6 Oct 2026, without intrusive testing. This project has not
changed the current site. The findings close when NIC hardens it (T-10) or when the old
public site is retired.

**Server and security**

- ASP.NET Web Forms on .NET Framework 4.0 (unsupported since January 2016), on IIS 10.
- **TLS:** the server sends no intermediate certificate ("GlobalSign GCC R6 AlphaSSL CA 2025";
  `openssl` verify return code 21), so some browsers and all scripted clients fail to
  connect. TLS 1.3 was not offered on 5 Oct (row 22).
- **Headers:**
  - `X-Content-Type-Options` is malformed: it contains CSP text;
  - the server sends `ETag: SAMEORIGIN`;
  - the server version is shown.
- **Crawling files:** `robots.txt` returns an error page, and `sitemap.xml` lists only `Home.aspx`.

**Broken pages and links** (crawl and navigation check of 6 Oct 2026)

- **Errors:**
  - `photos.aspx` returns HTTP 500;
  - 285 links from the Hindi sanction-order pages to
    `ResourcesHindi/SanctionOrderDetails_VIEW.aspx` return 404;
  - 45 Hindi sanction reports (`ResourcesHindi/senctionReporth.aspx?…`) and the PFMS search
    pages without parameters return 500;
  - the Hindi menu links to `ResourcesHindi/PFMS_…` addresses that do not exist.
- **Out-of-date or failing links:**
  - the footer still shows the STQC logo, although the certificate expired on 12 Feb 2026;
  - the NVSP logo leads to a certificate warning: the certificate of www.nvsp.in expired on 17 Mar 2025;
  - the Bhuvan link (http) and cmf.gov.in did not respond.
- **Links that go nowhere (`#`), 6 in all:**
  - the Ministers' Facebook and X links (4);
  - the "Policy & Grievances" tile;
  - the Janjatiya Gaurav Varsh logo.
- **Wrong names for screen readers:**
  - the Sanction Orders 2026-27 link is announced as "2025-26";
  - the NCST logo is announced as "bhuvan";
  - the footer Instagram icon is announced as "Facebook1";
  - logo links have names such as "DIndia" and "Tribes".

**Old code.** Review of the source copy on 5 Oct 2026. Secret values are not reproduced
anywhere. "New build" says what the new static site does about each finding.

| ID | Finding | Where | Risk | Production | New build |
|---|---|---|---|---|---|
| A-01 | Database connection strings with user ID and password in plain text (3 active strings, internal SQL servers 10.247.212.x) | `App/web.config` lines 30–33 | High | Open; NIC to rotate the passwords (T-10) | Not applicable: no database |
| A-02 | FCKeditor 2.x with its server-side file manager connector in the web root | `App/fckeditor/editor/filemanager/connectors/aspx/` (and `config.ascx.bak`) | High | Open | Resolved |
| A-03 | Passwords hashed with unsalted SHA-512 | `App_Code03112014/BusinessLogic/Hash.cs`; `AUTH/AdminPanel/Login.aspx.cs` | High | Open | Not applicable: no login on the public site |
| A-04 | Admin uploads saved without server-side type and size checks | 11 handlers call `SaveAs()`, e.g. `AUTH/AdminPanel/PAC/pac_minutesnew.aspx.cs` | High | Open | Not applicable: documents are published through the build |
| A-05 | Debug compilation on | `App/web.config` line 84: `compilation debug="true"` | Medium | Open | Not applicable |
| A-06 | Detailed error messages shown to users | `App/web.config` line 101: `customErrors mode="Off"` | Medium | Open | Resolved |
| A-07 | Backup, copy and old files in the web root | "PnC - Copy.aspx", "ResourcesHindi/Homeh - Copy.aspx", `*.bak`, "old pages/", "old master/", `App_Code03112014/` | Medium | Open | Resolved |
| A-08 | Eleven jQuery versions, several end-of-life (1.2.6, 1.3.2, 2.1.x) | `App/js`, `App/javascript`, `App/js_CMS` … | Medium | Open | Resolved: no jQuery |
| A-09 | Scripts from public CDNs without Subresource Integrity | Home page: cdnjs.cloudflare.com, cdn.jsdelivr.net, code.jquery.com | Medium | Open | Resolved: self-hosted |
| A-10 | Security headers missing or malformed; server version disclosed | Response headers | Medium | Open | Resolved |
| A-11 | Incomplete certificate chain; no TLS 1.3 | `openssl s_client`: verify error 21 | Medium | Open | Verify on staging (T-08) |
| A-12 | 77 code-behind files read query-string parameters; parameterised queries not confirmed | `Request.QueryString[...]` across `App/` | Medium | Pending verification | Not applicable: no database |
| A-13 | Counter cookies without SameSite; temporary (302) HTTPS redirect | `ENGLISHCOUNT` / `HINDICOUNT` cookies | Low | Open | Resolved |
| A-14 | Personal (non-government) e-mail addresses in the directory | Directory page | Low | Open | Partly: to be confirmed by Establishment |
| A-15 | The TriBot page script names the chatbot back end by internal IP over plain HTTP and includes admin calls (start/stop crawler, upload) | `App/api.js` | Medium | Open | Resolved: same-origin `/tribot-api/`, no admin calls |

## 3. Sister portals

Their urgent security points are in the [sister-portal gap matrix](../2_Assess/Gap_Matrix_Sister_Portals.md):
- the expired certificate of forestrights.nic.in (T-21);
- certificates expiring by the end of November (T-22);
- session handling on NESTS and NSTFDC (T-24).

## 4. Handling rules

- Never copy, send or commit the old `Web.config` or the database backups: they hold credentials.
  The copy of the old chat widget, which held an API key, was deleted on 6 Oct 2026.
- Security testing only on the local stand-in or on authorised staging.
