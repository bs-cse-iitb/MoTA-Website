# Content export needed from NIC

**For:** the NIC database team for tribal.gov.in.
**Why:** the new tribal.gov.in is a static site. Lists that the old site reads from its
databases at request time are built into the new pages from an export instead. Until
the export arrives, this content cannot be checked or migrated, and go-live stays blocked
(`npm run check:release` in the repository root).

## What to send

One CSV file per item, UTF-8 with a header row. Hindi text must stay in Unicode.
Include only rows that are approved or published, in every language.

**Database `tribal`** (connection `SSBConnectionString` in the old `Web.config`)

| File | Source | Used for |
|---|---|---|
| `highlights.csv` | result of `selectHighlights` | What's New |
| `highlights_archive.csv` | result of `selectHighlightsArchive` | Archives (the live archive page lists 391 documents) |
| `news.csv` | results of `display_latest_news` and `ASP_Get_News` | Tenders, vacancies, advertisements |
| `news_archive.csv` | result of `display_latest_newsArchive` | Tender archive |
| `pac_minutes.csv` | table `PACminutes` | Minutes of meetings |
| `pac_minutes_dajagua.csv` | table `PACminutes_DAJAGUA` | Minutes of meetings (DAJGUA) |
| `apex_minutes.csv` | table `apexminutes` | Minutes of meetings (TRI Apex Committee) |
| `scholarship_results.csv` | table `scholarshipresults` | Scholarship results |
| `monthly_summary.csv` | table `monthlySummaryPC` | Monthly summary for Cabinet |
| `photo_categories.csv`, `photos.csv` | tables `PHOTO_CATEGORY_WEB`, `PHOTOGALLERY_WEB` (also `PHOTO_CATEGORY`, `PHOTOGALLERY` if those are the live ones) | Photo albums |
| `cms_pages.csv` | approved rows of the content-management tables used by `usp_MoveApproveContentToFinal` | Page text entered through the admin panel |

**Database `tspTribal`** (setting `OFcon` in the old `Web.config`)

| File | Source | Used for |
|---|---|---|
| `sanction_orders_<year>.csv` | results of `proc_select_SchemeWisesentionOrder`, `…1819` to `…2627`, and `proc_select_SchemeWisesentionupload`, `proc_select_19…` to `proc_select_27SchemeWisesentionupload`, run with no filter | Sanction orders by financial year, with search by order number, State and amount |

## What not to send

No user accounts, passwords or password hashes, feedback, help-desk or grievance
records, log tables, or anything else holding personal data. The new site does not
need them, and they must not leave the NIC network.

## Also needed

- A copy of the **current** document folders from the live server. The copy used so far
  is incomplete: for example, `grievance/schreport.aspx` answers on the live site but is
  not in it.
- For every table: the column that marks an item approved or archived, and the language
  column's values.
- How often the admin panel data can be exported again, so the site can be rebuilt on a
  schedule after go-live (see [`../DEPLOYMENT.md`](../DEPLOYMENT.md)).
