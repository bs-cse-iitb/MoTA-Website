# Deployment

For NIC hosting staff and the web team. Covers the switch-over from the old ASP.NET
site to the new static site, staging, release, rollback and continued access to old
addresses such as https://tribal.gov.in/Home.aspx.

> **Status, 6 Oct 2026.** Not deployed anywhere yet. Go-live is blocked until
> `npm run check:release` passes (content export, held pages, inventory gaps). Steps
> marked *(planned)* are not implemented yet.

## 1. Target set-up (decided 6 Oct 2026)

The three parts, public site, back-office and TriBot service, are described in
[TECHNOLOGY.md](TECHNOLOGY.md) §1. For deployment:

- **Public site:** serves `dist/` and the old **document folders** at their old
  addresses. It has no ASP.NET pages.
- **Back-office:** runs on an **internal-only** host (NIC network or VPN).
- **Chat proxy:** the `/tribot-api/` rule is ready in `web.config`, commented out until
  Application Request Routing is on (§2).

Old page addresses (`.aspx`) get permanent redirects to the new pages
(`src/data/legacy-urls.json`, 186 entries). Documents keep their exact addresses.

## 2. Server requirements (hosting provider)

- IIS 10 with the **URL Rewrite** module. **Application Request Routing** with proxy on,
  for TriBot and the feedback handler.
- TLS 1.2 and 1.3 only, with the **full certificate chain**. In Oct 2026 the live server
  sent only its own certificate, without the "GlobalSign GCC R6 AlphaSSL CA 2025"
  intermediate. Some browsers and all scripted clients then fail to connect
  (`openssl s_client` reports "verify return code 21").
- ASP.NET is not needed on the public site.

### Chat assistant proxy (required)

The assistant posts to `/tribot-api/chat` on tribal.gov.in. IIS must forward that path to
`https://tribot.tribal.gov.in/api/v1/chat`. The service rejects cross-origin calls from
tribal.gov.in (checked 6 Oct 2026), so the browser cannot call it directly. No API key is
needed or sent. Steps for the hosting team:

1. Install Application Request Routing and switch proxy on (server level).
2. Uncomment the `tribot` rule in `src/pages/web.config.ts`, rebuild and deploy.
3. Check: `curl -s -X POST https://STAGING/tribot-api/chat -H 'Content-Type: application/json' -d '{"query":"What is PM-JANMAN?","messages":[{"role":"user","content":"What is PM-JANMAN?"}],"language":"eng","top_k":10}'`
   returns JSON with an `answer`.

Until then the assistant answers from the site search and says the service is unreachable.

## 3. Build the release

In the repository root:

```bash
npm ci                      # exact versions from package-lock.json
npm run build               # dist/
npm run check:links         # broken links, anchors and redirect loops
npm run inventory           # docs/Migration/ (needs dist/)
npm run check:release       # must say "Ready" before go-live
```

## 4. Copy to the server

Use a **new, empty site root**, never the old application folder: copying into the old
folder would leave `.aspx` pages and server code reachable.

1. **Documents first.** Copy document and media files from the **current live server**,
   not from an old copy (the copy checked in Oct 2026 lacked `grievance/`). Keep folder
   names and paths exactly. Copy only these file types: `pdf doc docx xls xlsx ppt pptx
   odt ods rtf txt csv zip rar jpg jpeg png gif svg webp bmp mp3 mp4 ogg mpeg mpg wav wmv
   swf` and the HTML packages under `writereaddata/` and `mos/`. **Never copy** `.aspx
   .ascx .master .asax .ashx .asmx .cs .vb .config .dll .resx .dbml .bak` or the folders
   `AUTH App_Code* App_Data App_GlobalResources Bin aspnet_client fckeditor UserControl`.
   About 19,200 files and 28 GB in Oct 2026; folders by size: `writereaddata` 17.3 GB,
   `downloads` 4.5 GB, `ResourcesHindi` 2.2 GB, `Docs` 2.0 GB, `DivisionsFiles` 1.4 GB.
   Example on Windows:

   ```bat
   robocopy \\OLDSERVER\tribal \\NEWSERVER\tribal *.pdf *.doc *.docx *.xls *.xlsx *.ppt *.pptx *.zip *.rar *.jpg *.jpeg *.png *.gif *.mp3 *.mp4 /S /XD AUTH App_Code App_Data App_GlobalResources Bin aspnet_client fckeditor UserControl /R:1 /W:1 /LOG:docs-copy.log
   ```
2. **Then the site.** Copy everything inside `dist/` into the same site root. It adds
   files and replaces `web.config`. It does not delete the document folders.
3. **After go-live (planned).** Divisions keep uploading through the back-office, so
   new files in its `writereaddata/` must reach the public site. Schedule a one-way copy
   (robocopy `/XO`, same file types) at least hourly, plus a rebuild from the content
   export ([`Migration/nic-content-export.md`](Migration/nic-content-export.md)).

## 5. Check on staging

Run from the repository root on the build computer, against the staging address.

```bash
curl -sI https://STAGING/ | grep -iE 'strict-transport|content-security|x-content-type|x-frame|referrer|permissions'
curl -sI https://STAGING/Home.aspx                 # 301, Location: /
echo | openssl s_client -connect STAGING:443 -servername STAGING 2>/dev/null | grep 'Verify return code'   # 0 (ok)
BASE_URL=https://STAGING npm run test:redirects    # every old page address
BASE_URL=https://STAGING npm run test:documents    # every document linked from the new pages
node scripts/assess/prototype-suite.mjs --base https://STAGING --out docs/Evidence/runs/<date>-staging/uat
```

Also open a sample of documents from the What's New archive, the HTML packages in
`writereaddata/TrainingModule/` and `mos/`, and the feedback form once its handler is
connected. The new Content-Security-Policy blocks inline scripts, and those old packages
use them, so they may need their own `<location>` rule. Save the reports under
`docs/Evidence/runs/<date>-staging/` and record the results in the
[test report](GIGW_DBIM_Standardisation/5_Verify/Test_Report.md) and the
[main-website gap matrix](GIGW_DBIM_Standardisation/2_Assess/Gap_Matrix_Main_Website.md).

## 6. Release and rollback

- Before switching, take a full backup of the live site root and its databases, and
  keep the old application folder unchanged.
- Release: point the IIS site at the new root (old documents plus `dist/`). Then
  run the checks in section 5 against production.
- Rollback: point the IIS site back at the old application folder. No database step is
  needed, because the new site does not write to a database. Keep the old folder for at
  least 30 days.

## 7. Old addresses

`https://tribal.gov.in/Home.aspx` and `/Default.aspx` redirect (301) to `/`, with or
without a query string and in any letter case. Hindi pages (`/ResourcesHindi/…h.aspx`)
redirect to the matching `/hi/…` page. Verified on the local IIS stand-in on 6 Oct 2026
(`npm run test:redirects`: 309 checks passed). Production and staging are not verified yet.
