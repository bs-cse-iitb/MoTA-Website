# Integrating the kit

For teams of other MoTA portals. The general steps for any server are in the
[guide](README.md#quick-start-any-server-technology). This page covers:
- specific server technologies (sections 1–3);
- security headers, TLS and MIME types (section 4);
- Hindi and BHASHINI (section 5);
- the check on staging (section 6).

## 1. ASP.NET Web Forms (MasterPage)

Most MoTA portals hosted by NIC run ASP.NET Web Forms on IIS. The kit goes into the
MasterPage, so content pages keep working unchanged.

Copy `dist/` to the web application as `~/dbim-kit/`, and add the MIME types and headers of
section 4 to `web.config`.

`Site.Master` (English). For Hindi, use a second master, or choose the template with
`Request.Path.StartsWith("/hi/")`.

```aspx
<%@ Master Language="C#" AutoEventWireup="true" CodeBehind="Site.master.cs" Inherits="Portal.SiteMaster" %>
<!doctype html>
<html lang="<%= Lang %>" dir="ltr" data-dbim-group="9" data-theme="light" data-text="0" id="top">
<head runat="server">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><%: Page.Title %> | Ministry of Tribal Affairs, Government of India</title>
  <asp:ContentPlaceHolder ID="Meta" runat="server" />
  <link rel="stylesheet" href="<%= ResolveUrl("~/dbim-kit/dbim.min.css") %>">
  <script src="<%= ResolveUrl("~/dbim-kit/dbim-early.js") %>"></script>
</head>
<body>
  <!-- #include virtual="/dbim-kit/partials/header.en.html" -->
  <main id="main" tabindex="-1">
    <form id="form1" runat="server">
      <asp:ContentPlaceHolder ID="MainContent" runat="server" />
    </form>
  </main>
  <!-- #include virtual="/dbim-kit/partials/footer.en.html" -->
  <!-- #include virtual="/dbim-kit/partials/dialogs.en.html" -->
  <script src="<%= ResolveUrl("~/dbim-kit/dbim.js") %>"></script>
</body>
</html>
```

About the template files:
- **Partials:** `partials/*.html` are copies of `templates/<lang>/*.html` with `{{KIT}}`
  replaced by `/dbim-kit` and the menus edited for the portal.
- **No server-side includes?** Paste the markup into the master, or into user controls
  (`Header.ascx`, `Footer.ascx`).
- **One form only:** keep a single `<form runat="server">` inside `<main>`. The header's
  search form and the dialogs must stay **outside** it, because HTML forms cannot be nested.

Things to change in existing pages:

| Old pattern | Replace with |
|---|---|
| Inline `style=`, `<font>`, `<center>`, table layouts | Kit classes (`.container`, `.grid`, `.card`, `.table`) |
| `onclick=` attributes, inline `<script>` | Code in an external `.js` file, so the CSP needs no `'unsafe-inline'` |
| jQuery 1.x/2.x, FCKeditor | Remove. The kit needs no jQuery. Upgrade any editor that remains and keep it off the public site |
| `<asp:Menu>` | The kit header (`.mainnav`) |
| Images of text; `alt=""` on informative images | Real text; meaningful `alt` |
| Fonts other than Noto Sans | Remove; the kit loads Noto Sans |
| `debug="true"`, `customErrors mode="Off"` | `debug="false"`, `customErrors mode="RemoteOnly"` with a custom error page |

## 2. PHP, Drupal and WordPress

**Plain PHP.** Copy `dist/` to the document root as `/dbim-kit/`. Save the templates as
`partials/header.en.php` and so on, with `{{KIT}}` replaced by `/dbim-kit`.

```php
<?php
$lang = str_starts_with($_SERVER['REQUEST_URI'], '/hi/') ? 'hi' : 'en';
$title = $title ?? 'Home';
?><!doctype html>
<html lang="<?= $lang ?>" dir="ltr" data-dbim-group="9" data-theme="light" data-text="0" id="top">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($title) ?> | Ministry of Tribal Affairs, Government of India</title>
  <link rel="stylesheet" href="/dbim-kit/dbim.min.css">
  <script src="/dbim-kit/dbim-early.js"></script>
</head>
<body>
<?php include __DIR__ . "/partials/header.$lang.php"; ?>
<main id="main" tabindex="-1">
  <?php include $content; ?>
</main>
<?php include __DIR__ . "/partials/footer.$lang.php"; ?>
<?php include __DIR__ . "/partials/dialogs.$lang.php"; ?>
<script src="/dbim-kit/dbim.js"></script>
</body>
</html>
```

**Drupal and WordPress.**

- **Markup:** put the header, footer and dialogs markup in the theme's `page.html.twig`
  (Drupal) or `header.php` and `footer.php` (WordPress). Keep the classes and `data-*`
  attributes.
- **Assets:** load `dbim.min.css` and `dbim.js` as theme libraries or enqueued assets. Load
  `dbim-early.js` in `<head>` without `defer`.
- **Theme styles:** remove theme fonts and colour presets that override Noto Sans or the
  colour group.
- **Menus:** use the CMS's own menus to render `.mainnav__list` and the mega-menu links, in
  the same markup as `templates/en/header.html`.
- **Hindi:** use the CMS's language module (Drupal Content Translation, or Polylang or
  WPML), and make sure `<html lang>` follows the page language.

## 3. Static sites and static-site generators

1. Copy `dist/` to the site as `/dbim-kit/`.
2. Start every page from `templates/page.html` (English) or `templates/page.hi.html` (Hindi).
3. Replace each `<!-- @include … -->` comment with the matching template. Use your
   generator's include feature, or server-side includes
   (`<!--#include virtual="…" -->` on IIS and Apache).
4. Replace `{{KIT}}` with `/dbim-kit`, and fill the other `{{…}}` placeholders: page title,
   description, keywords, canonical URL, English and Hindi URLs, and the last-updated date.
5. Put the page content in place of `{{CONTENT}}`, using the components shown in
   `examples/index.html`. Their markup can be copied from the browser's developer tools or
   from the pilot source (`src/components/`).

`examples/page-en.html` and `examples/page-hi.html` are complete pages built exactly this way.
Sites built with Astro can import the sources directly (`@kit/css/*.css`, `@kit/js/*`), as
the pilot does in `src/layouts/BaseLayout.astro`.

## 4. Security headers, TLS and MIME types

The kit needs no inline scripts, no `eval` and no third-party hosts, so it works under a
strict Content Security Policy. Apply these settings on staging first.

**Baseline policy**

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), geolocation=(), microphone=(self), payment=(), usb=()
Cross-Origin-Opener-Policy: same-origin
```

Add a host only when a feature needs it:

| Feature | Addition |
|---|---|
| Site search with Pagefind (`dbim-search.js`) | `script-src 'wasm-unsafe-eval'` |
| Central campaign banner (CCPS) from MyGov | `img-src https://cbpssubscriber.mygov.in` |
| X and Facebook embeds, loaded only after consent | `script-src https://platform.twitter.com`; `frame-src https://www.facebook.com https://platform.twitter.com https://syndication.twitter.com`; `style-src 'unsafe-inline'` (the embeds set inline styles) |
| BHASHINI plugin | See section 5 |

`microphone=(self)` is needed only for voice search; use `microphone=()` without it.

**IIS (`web.config`).** The pilot's complete file is generated by
`src/pages/web.config.ts` (output `dist/web.config`). The essentials:

```xml
<system.webServer>
  <staticContent>
    <remove fileExtension=".woff2" /><mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    <remove fileExtension=".svg" /><mimeMap fileExtension=".svg" mimeType="image/svg+xml" />
    <remove fileExtension=".webp" /><mimeMap fileExtension=".webp" mimeType="image/webp" />
  </staticContent>
  <httpProtocol>
    <customHeaders>
      <remove name="X-Powered-By" />
      <add name="Content-Security-Policy" value="default-src 'self'; …" />
      <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
      <add name="X-Content-Type-Options" value="nosniff" />
      <add name="X-Frame-Options" value="SAMEORIGIN" />
      <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
      <add name="Permissions-Policy" value="camera=(), geolocation=(), microphone=(self), payment=(), usb=()" />
    </customHeaders>
  </httpProtocol>
  <security><requestFiltering removeServerHeader="true" /></security>
</system.webServer>
<system.web>
  <compilation debug="false" />
  <customErrors mode="RemoteOnly" defaultRedirect="~/error.html" />
  <httpRuntime enableVersionHeader="false" />
  <httpCookies httpOnlyCookies="true" requireSSL="true" sameSite="Lax" />
</system.web>
```

Each header must be sent **once**, with one value. A duplicated `X-Content-Type-Options`
(for example `nosniff, nosniff`) is malformed, and browsers may ignore it.

**Apache**

```apache
Header always set Content-Security-Policy "default-src 'self'; …"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), geolocation=(), microphone=(self), payment=(), usb=()"
ServerTokens Prod
ServerSignature Off
AddType font/woff2 .woff2
```

**Nginx**

```nginx
add_header Content-Security-Policy "default-src 'self'; …" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), geolocation=(), microphone=(self), payment=(), usb=()" always;
server_tokens off;
```

**TLS**

- **Protocols:** TLS 1.2 and 1.3 only. Disable TLS 1.0 and 1.1 and weak ciphers.
- **Certificate chain:** serve the full chain (leaf and intermediate). An incomplete chain
  works in desktop browsers that cache intermediates, but fails in some mobile browsers, API
  clients and audit tools.
- **HTTPS:** redirect all HTTP to HTTPS (301).
- **Renewal:** renew certificates before they expire, and monitor expiry.

## 5. Hindi and BHASHINI

**Hindi pages.** GIGW 3.0 requires the website in Hindi and English. Hindi pages must:
- be real pages with their own URLs (`/hi/…`);
- declare `lang="hi"`;
- carry text that a person has written or vetted. Machine translation does not meet the
  requirement.

The kit supports Hindi as follows:
- **Templates:** `templates/hi/` and the page shell `page.hi.html`.
- **Language selector:** each option has `hreflang` and `lang`; put the alternate links in `<head>`.
- **Font:** Noto Sans Devanagari, self-hosted. It loads only when Devanagari text appears.
- **Mixed text:** mark English words inside a Hindi page with `lang="en"`, and the reverse,
  so screen readers switch voice (WCAG 3.1.2).
- **Dates:** day-month-year (DBIM A.5.6 viii). In the pilot, Hindi month names come from
  `src/data/i18n.ts`, and `node scripts/assess/hindi-coverage.mjs` measures how much of
  each Hindi page is in Hindi.

**BHASHINI plugin.** Whether to use it is a Ministry decision; see the
[BHASHINI feasibility note](../GIGW_DBIM_Standardisation/5_Verify/BHASHINI_Feasibility.md).
Steps for a pilot on staging:

1. **Register** the domain on the BHASHINI dashboard (`dashboard.bhashini.co.in`) for the
   website translation plugin.
2. **Load the plugin only when a visitor asks for it**, for example from an "Other Indian
   languages" item in the language menu, not on every page view:
   ```html
   <script src="https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js" defer></script>
   ```
   Check the exact URL and set-up in the onboarding documents.
3. **Update the CSP.** Add the plugin's hosts to `script-src`, and the API hosts it calls to
   `connect-src`; find them in the browser's network panel on staging. Do **not** add
   `'unsafe-inline'` or `'unsafe-eval'`. If the plugin needs them, record that as a finding
   for the security audit.
4. **Exclude content that must not be translated** with `class="bhashini-skip-translation"`:
   - the organisation name and the State Emblem lockup;
   - the names of people, schemes and Acts as notified;
   - figures, amounts and dates in tables;
   - legal notices and policy text.
5. **Show a notice on translated pages:** "This is a machine translation provided for
   convenience. The English and Hindi versions are authoritative."
6. **Update the policies.** Change the cookie and privacy policies if the plugin stores
   anything in the browser.
7. **Re-test.** Re-run the tests with a translated language selected (axe-core, keyboard,
   reflow), and include the plugin in the next security audit.

## 6. Check on staging

Add the portal's staging address to `scripts/assess/targets.json`, for example
`{ "id": "nstfdc-uat", "name": "NSTFDC (UAT)", "url": "https://uat.example.nic.in/", "category": "sister" }`.
Then, in the repository root, run `node scripts/assess/audit.mjs --only nstfdc-uat --lighthouse`.

It checks accessibility (axe-core), headers, TLS, metadata, language, mobile layout and
performance, and saves screenshots. The checks are passive. Attach the output to the request
for production deployment.
