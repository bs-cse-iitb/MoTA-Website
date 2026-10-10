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

**Chat assistant.** `npm run dev` forwards its questions to the live chat service, as IIS will
in production (`astro.config.mjs`), so it answers there. `serve:uat` forwards them only when
asked; otherwise the assistant says the service is unreachable and lists matching pages:

```bash
NODE_EXTRA_CA_CERTS=vendor/globalsign-gcc-r6-alphassl-ca-2025.crt npm run serve:uat -- --tribot https://tribot.tribal.gov.in/api/v1
```

`NODE_EXTRA_CA_CERTS` gives Node the intermediate certificate that the chat service does not
send; certificate checks stay on. The tests use a stand-in for the service instead.

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
- **Chat popup test:** set `CHAT_POPUP_OUT=<folder>`.
- **Kit test:** set `MOTA_DOCS_DIR=<folder>`; it writes to `<folder>/Evidence/uat-kit/`.

Without these settings, the tests write to `docs/Evidence/uat/`, `uat-kit/`, `assistant/` and
`chat-popup/`.
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

## Chat popup page

`chat_popup/` holds the chat assistant on a page of its own, made from the component kit
([what it is](chat_popup/README.md)). Rebuild and test it after any change to the assistant
or the kit:

```bash
npm run build && npm run kit:build && npm run chat:build
npm run test:chat-popup     # the page end to end, with a stand-in for the chat service
```

To try it against the live service, serve the folder and open http://127.0.0.1:5500. The
service accepts requests from that address (checked 10 Oct 2026), so no backend is needed on
this computer:

```bash
python3 -m http.server 5500 --bind 127.0.0.1 --directory chat_popup
```

- **Port 5500 in use:** VS Code's Live Server extension also uses port 5500. Stop it first,
  or skip the command above and open `chat_popup/index.html` with Live Server.
- **A chat backend on this computer:** change the local rule in `chat_popup/config.js` to
  `http://127.0.0.1:8000/api/v1/chat`. The backend must allow the page's address in its
  `FRONTEND_ORIGINS` setting.

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
