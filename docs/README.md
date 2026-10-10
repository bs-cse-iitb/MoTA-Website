# Documentation: the new tribal.gov.in

Project documents and test evidence for the new website of the Ministry of Tribal Affairs.
New readers should start with the [project overview](PROJECT_OVERVIEW.md).

Instructions for working with the code are in the repository root:
[RUN.md](../RUN.md) (run and test) and [MAINTENANCE.md](../MAINTENANCE.md) (update content,
change the code).

The status in these documents is as recorded on **6 Oct 2026**. All tests were run again on
the final version on **10 Oct 2026** ([test report](GIGW_DBIM_Standardisation/5_Verify/Test_Report.md)).

| Folder or file | What it holds | Mainly for |
|---|---|---|
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | What the project is: purpose, scope, the new website at a glance, who is involved, status | Everyone |
| [TECHNOLOGY.md](TECHNOLOGY.md) | How the site works and the technology used: versions, licences, what each environment needs, outside services | Developers, NIC, auditors |
| [GIGW_DBIM_Standardisation/](GIGW_DBIM_Standardisation/README.md) | The GIGW 3.0 and DBIM task in six steps, with each step's output. **Reviewers start with [6_Submit/Review_Package.md](GIGW_DBIM_Standardisation/6_Submit/Review_Package.md)** | Ministry, reviewers |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Server set-up, copying the documents and the site, staging checks, release and rollback | NIC hosting, web team |
| [MIGRATION.md](MIGRATION.md), [Migration/](Migration/) | How each old page, document and function is carried over; the inventory data; the [content export requested from NIC](Migration/nic-content-export.md) | Web team, divisions, NIC |
| [Component-Kit/](Component-Kit/README.md) | Using the common components on another MoTA portal: guide, [component list and approvals](Component-Kit/COMPONENTS.md), [integration](Component-Kit/INTEGRATION.md), [changelog](Component-Kit/CHANGELOG.md) | Teams of other portals |
| [GIGW_DBIM_Guidelines/](GIGW_DBIM_Guidelines/README.md) | The official GIGW and DBIM documents used, with editions and checksums. The PDFs are not for the repository | Everyone |
| [Evidence/](Evidence/) | Test results, screenshots and assessment data (below) | Reviewers, auditors |

## Evidence

Paths in the documents are relative to `Evidence/` unless they say otherwise.

| Folder or file | Contents |
|---|---|
| `runs/2026-10-10-final/` | The final run of every test and check on this version, including the navigation check and the audit of the new build. New runs go in `runs/<date>-<subject>/` |
| `assessment/` | Audit of tribal.gov.in and the sister portals (`raw/`) and Hindi coverage, 5 Oct 2026 |
| `broken-links-report.csv` | Documents linked from the old pages that are missing on the live server (written by `npm run check:links`) |
