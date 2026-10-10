# Run and test the site

For developers and testers. Run every command in the repository root. The technology used is
described in [docs/TECHNOLOGY.md](docs/TECHNOLOGY.md).

## Install and run

Needs Node.js 24 LTS (`node -v`; see `.nvmrc`). The build also works on Node 20.3 or newer,
but Node 20 has been out of support since 30 Apr 2026. Get Node.js from https://nodejs.org.

```bash
npm ci               # first time, and after package-lock.json changes
npm run build        # after every change: site in dist/ and the search index
npm run serve:uat    # open http://127.0.0.1:4322 (served like IIS: same headers and redirects)
```

Press **Ctrl + C** to stop. For live reload while editing, use `npm run dev`
(http://localhost:4321); site search works only on a built site.

## Checks

In a second terminal, while `serve:uat` is running:

```bash
npm run check:links                   # broken links, missing anchors, redirect loops
npx tsc --noEmit                      # type check
npm run test:uat                      # accessibility (axe), layout, keyboard, menus, forms, headers
npm run test:redirects                # every old page address redirects as recorded
npm run test:assistant                # chat assistant end to end, with a stand-in for its service
npm run kit:build && npm run kit:test # the component kit for other portals
npm run check:parity                  # the 59 listed components of the live home page are present
npm run check:nav -- --from docs/Evidence/runs/2026-10-10-final/old-Home.aspx.html
```

- **`check:nav`** checks every navigation link of the live home page. Without `--from`, it
  fetches the live page; the script explains the certificate setting this needs.
- **Documents at their old addresses:** start the server with the old site's folders,
  `node scripts/serve-uat.mjs --docs ../MoTA_Website_Old/App`, then run `npm run test:documents`.

## Keeping test evidence

Keep each run in its own folder, `docs/Evidence/runs/<date>-<subject>/`:

- **Site tests and navigation check:** pass `--out <folder>`, for example
  `node scripts/assess/prototype-suite.mjs --base http://127.0.0.1:4322 --out docs/Evidence/runs/<date>-<subject>/uat`.
- **Chat-assistant test:** set `ASSISTANT_OUT=<folder>`.
- **Kit test:** set `MOTA_DOCS_DIR=<folder>`; it writes to `<folder>/Evidence/uat-kit/`.

Without these settings, the tests write to `docs/Evidence/uat/`, `uat-kit/` and `assistant/`.
Move such output into a dated run folder. Screenshots are not committed (`.gitignore`).

## Migration and go-live checks

```bash
npm run inventory        # docs/Migration/inventory.csv and summary.json (after a build)
npm run check:release    # everything that still blocks go-live
NODE_EXTRA_CA_CERTS=<intermediate.pem> npm run crawl:live
```

About the crawl:
- **When:** run it only when the live site has changed. It takes about 15 minutes, at one
  request per second.
- **Certificate:** the live server does not send its intermediate certificate, so supply it
  with `NODE_EXTRA_CA_CERTS`. `scripts/migration/crawl-live.mjs` explains how.

Background: [docs/MIGRATION.md](docs/MIGRATION.md).

## Other commands

| Command | Does |
|---|---|
| `npm run assess` | Passive GIGW audit of the live portals: Lighthouse, headers, TLS. With `-- --targets scripts/assess/targets-prototype.json --out <folder>` it audits the local build instead |
| `node scripts/fetch-link-meta.mjs` | Records the format and size of every linked document in `src/data/generated/link-meta.json`; `--refresh` checks them all again |
| `npm run assets` | Imports images from the old site again (one time; see [MAINTENANCE.md](MAINTENANCE.md)) |
| `npm audit` | Known vulnerabilities in the dependencies |

## Related instructions

- **Content and settings:** what to edit for each kind of content is in
  [MAINTENANCE.md](MAINTENANCE.md). Environment variables are listed in `.env.example`.
- **Deploying:** never copy a build straight to production. Follow
  [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): staging first, then production only after the
  UAT review and approval.
