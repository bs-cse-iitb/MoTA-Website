# MoTA-Website: the new tribal.gov.in

The new website of the **Ministry of Tribal Affairs, Government of India**: a static site in
English and Hindi, built to the DBIM v3 structure for Central Ministries, with GIGW 3.0
standardisation in progress. The repository also holds the DBIM component kit for the
Ministry's other portals.

> **Status, Oct 2026: under review, not deployed.** The site runs on a local UAT stand-in.
> It is not certified: no GIGW, DBIM or WCAG conformance is claimed until STQC assesses it.

## Quick start

Needs Node.js 24 LTS (see `.nvmrc`) and Google Chrome for the tests.

```bash
npm ci               # install the exact versions in package-lock.json
npm run build        # the site in dist/, with the search index
npm run serve:uat    # http://127.0.0.1:4322, served like IIS
```

## Documents

| Read | For |
|---|---|
| [RUN.md](RUN.md) | Running and testing the site |
| [MAINTENANCE.md](MAINTENANCE.md) | Updating content (which data file to edit) and changing the code |
| [docs/README.md](docs/README.md) | All project documents, starting with the [project overview](docs/PROJECT_OVERVIEW.md) and the [technology used](docs/TECHNOLOGY.md) |

## Folders

| Path | Contents |
|---|---|
| `src/` | Pages, components and content data (`src/data/`: settings, menus, schemes, old-address map, chat assistant) |
| `public/` | Files copied as they are: emblem, logos, mascot, `robots.txt`, Search Console files, early accessibility script |
| `packages/dbim-kit/` | Component kit for other portals: sources, build and generated templates |
| `scripts/` | IIS stand-in server; link, navigation and release checks; migration inventory; assessments |
| `tests/` | Redirect, document and chat-assistant tests |
| `docs/` | Project documents and test evidence |
| `vendor/` | Third-party artwork kept with its source (State Emblem SVG) |


## Free Deploy
- https://mota-website.bs-veer-868.workers.dev/

Not in the repository: `node_modules/` and `dist/` (rebuilt by `npm ci && npm run build`),
`.env` (local settings; see `.env.example`), the official guideline PDFs (download links in
[docs/GIGW_DBIM_Guidelines/](docs/GIGW_DBIM_Guidelines/README.md)), and the old ASP.NET site,
which holds credentials and is never to be added.
