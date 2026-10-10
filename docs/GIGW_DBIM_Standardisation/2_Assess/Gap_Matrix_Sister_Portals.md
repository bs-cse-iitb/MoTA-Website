# Step 2 output: gap matrix, sister and subordinate portals

The 21 portals of the Ministry and its organisations. They were assessed **separately** from the
[main website](Gap_Matrix_Main_Website.md) and **before any change** to them. No sister
portal has been changed.

## Method and limits

- **Check:** an automated, passive check of each home page on 5 Oct 2026 (`npm run assess`).
  It covered Lighthouse, axe-core (WCAG 2.1 A and AA), the page language, skip link, Hindi
  option, text-size and contrast controls, font, DBIM colour group, cookie consent, security
  headers and TLS.
- **Scope:** one page per portal, with no forms, logins, inner pages or manual review. Read
  the results as a first screen, not a full audit.
- **Coverage:** 14 portals were assessed. forestrights.nic.in could not be, because its
  certificate had expired. 6 were not reachable from the assessment network and must be
  re-checked from NICNET (T-05).

**Summary.** 8 portals are P1 (urgent) and 13 are P2. The common gaps are:
- a missing page language, skip link and Hindi option;
- no text-size and contrast controls, and no cookie consent;
- fonts other than Noto Sans;
- missing security headers.

The common next step for every assessed portal is to adopt the common components
([Component-Kit](../../Component-Kit/README.md)), then fix accessibility and security
headers. This happens only after the components are approved, and on staging first (T-23).
The owner is each portal's owner.

## Findings and priorities

| Portal | P | Lighthouse accessibility | axe rules failing | Page language | Skip link | Hindi | Text size, contrast | Font | Cookie consent | Security headers | Page weight (MB) | Other findings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [Performance Dashboard](https://dashboard.tribal.gov.in/) | P1 | 45 | 3 | missing | No | No | No | Noto Sans | No | 6/6 | 28.2 | — |
| [National Tribal Research Portal](https://tritribal.gov.in/) | P2 | 63 | 5 | missing | No | No | No | Noto Sans | No | 4/6 | 4.0 | Certificate expires in 55 days (T-22) |
| [DBT Tribal (Pre/Post Matric)](https://dbttribal.gov.in/) | P1 | 53 | 5 | missing | No | No | No | Helvetica Neue | No | 6/6 | 4.6 | Certificate expires in 55 days (T-22) |
| [National Fellowship](https://fellowship.tribal.gov.in/) | P1 | 39 | 8 | missing | No | No | No | Helvetica Neue | No | 3/6 | 4.5 | — |
| [National Overseas Scholarship](https://overseas.tribal.gov.in/) | P1 | 48 | 6 | missing | No | No | No | Helvetica Neue | No | 3/6 | 6.0 | — |
| [STCMIS](https://stcmis.gov.in/) | P2 | 78 | 4 | missing | No | No | No | Inter | No | 4/6 | 0.2 | Home page answered HTTP 404 to the check but rendered: verify by hand. Certificate expires in 56 days (T-22) |
| [State TSP](https://statetsp.tribal.gov.in/) | P2 | 67 | 5 | missing | No | No | No | Nunito | No | 6/6 | 1.9 | — |
| [ADIGRAMS (grants)](https://grants.tribal.gov.in/) | P2 | 78 | 4 | en | No | No | No | Inter | No | 6/6 | 12.2 | — |
| [Adi Prasaran](https://adiprasaran.tribal.gov.in/) | P1 | 61 | 7 | missing | No | No | No | Noto Sans | No | 2/6 | 117.3 | — |
| [Adi Karmayogi](https://adiprasaran.tribal.gov.in/adikarmayogi/) | P2 | 76 | 5 | missing | No | No | No | Noto Sans | No | 2/6 | 38.4 | — |
| [NESTS (EMRS)](https://nests.tribal.gov.in/), subordinate | P1 | 72 | 6 | en | Yes | Yes | No | Roboto | No | 5/6 | 16.6 | Session cookie without `Secure` and `HttpOnly` (T-24). Home page answered HTTP 405 to the check but rendered: verify by hand |
| [NSTFDC](https://nstfdc.tribal.gov.in/), subordinate | P1 | 69 | 8 | missing | Yes | Yes | No | Arial | No | 1/6 | 6.2 | Session ID carried in the URL (T-24) |
| [TRIFED](https://trifed.tribal.gov.in/), subordinate | P2 | 72 | 6 | hi | Yes | Yes | No | Lato | No | 6/6 | 17.6 | — |
| [TribeX](https://tribexdigital.org.in/) | P2 | 85 | 4 | en | No | No | No | IBM Plex Sans | No | 5/6 | 15.3 | Certificate expires in 56 days (T-22) |
| [Forest Rights Act portal](https://forestrights.nic.in/) | P1 | — | — | — | — | — | — | — | — | — | — | **Not assessed:** certificate expired on 26 Jul 2026, so browsers block the site; TLS 1.0 and 1.1 still on. Renew now, then assess (T-21) |
| [NGO Grants](https://ngo.tribal.gov.in/) | P2 | — | — | — | — | — | — | — | — | — | — | Not reachable from the assessment network (T-05) |
| [Swasthya portal](https://swasthya.tribal.gov.in/) | P2 | — | — | — | — | — | — | — | — | — | — | Not reachable (T-05) |
| [Tribal Digital Document Repository](https://repository.tribal.gov.in/) | P2 | — | — | — | — | — | — | — | — | — | — | Not reachable (T-05) |
| [SCD-IEC](https://scdiec.tribal.gov.in/) | P2 | — | — | — | — | — | — | — | — | — | — | Not reachable (T-05) |
| [Shram Shakti (tribal migration)](https://shramshakti.tribal.gov.in/) | P2 | — | — | — | — | — | — | — | — | — | — | Not reachable (T-05) |
| [GOAL](https://goal.tribal.gov.in/) | P2 | — | — | — | — | — | — | — | — | — | — | Not reachable (T-05) |

How to read the table:
- **Lighthouse accessibility** is a score out of 100.
- **axe rules failing** counts the automated WCAG rules with failures.
- **Page language** is the page's `lang` value; "missing" means it is not declared.
- **Security headers** counts which of these six are present: HSTS, CSP,
  X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy.
- **Certificate expiry days** are counted from 5 Oct 2026.

Evidence (paths relative to `docs/Evidence/`):
- `assessment/raw/results.json` and `summary.csv` hold the measurements;
- `assessment/raw/shots/<portal>-desktop.jpg` and `-mobile.jpg` are the screenshots.
