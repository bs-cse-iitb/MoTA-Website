// Generates dist/web.config for IIS (NIC hosting): security headers (GIGW 3.0
// cybersecurity / CERT-In), MIME types, caching, custom 404, and 301 redirects
// from the legacy ASP.NET page URLs to the new pages (src/data/legacy-urls.json).
import type { APIRoute } from 'astro';
import legacyUrls from '../data/legacy-urls.json';

const csp = [
  "default-src 'self'",
  // 'wasm-unsafe-eval' is required by the Pagefind search index (WebAssembly).
  "script-src 'self' 'wasm-unsafe-eval' https://platform.twitter.com",
  // Third-party embeds (loaded only after consent) set inline styles.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cbpssubscriber.mygov.in https://pbs.twimg.com https://abs.twimg.com https://syndication.twitter.com",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://www.facebook.com https://platform.twitter.com https://syndication.twitter.com',
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// Old page names are literal text inside an IIS regular expression ("PnC - Copy.aspx",
// names with brackets or "+"), so every regex metacharacter must be escaped.
const literal = (s: string) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

export const GET: APIRoute = () => {
  const lower = (list: string[]) => new Set(list.map((p) => p.toLowerCase()));
  // Old pages the new site still links to (content not migrated yet) get no rule,
  // otherwise the link would redirect straight back (a loop).
  const held = lower(Object.keys(legacyUrls.notRedirectedYet));
  const keepQuery = lower(legacyUrls.keepQueryString);
  // IIS matches the path without the leading slash or the query string, ignoring case,
  // so Home.aspx?lang=en uses the home.aspx rule.
  const rules = Object.entries(legacyUrls.redirects as Record<string, string>)
    .filter(([from]) => !held.has(from.toLowerCase()))
    .map(([from, to], i) => `        <rule name="legacy-${i}" stopProcessing="true">
          <match url="^${esc(literal(from))}$" ignoreCase="true" />
          <action type="Redirect" url="${esc(to)}" redirectType="Permanent" appendQueryString="${keepQuery.has(from.toLowerCase())}" />
        </rule>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generated at build time by src/pages/web.config.ts; do not edit on the server.
     The public site serves only static files. The old ASP.NET application runs on an
     internal back-office host; documents keep their old addresses as static files
     (docs/DEPLOYMENT.md). -->
<configuration>
  <system.webServer>
    <defaultDocument enabled="true">
      <files><clear /><add value="index.html" /></files>
    </defaultDocument>
    <staticContent>
      <remove fileExtension=".webp" /><mimeMap fileExtension=".webp" mimeType="image/webp" />
      <remove fileExtension=".woff2" /><mimeMap fileExtension=".woff2" mimeType="font/woff2" />
      <remove fileExtension=".svg" /><mimeMap fileExtension=".svg" mimeType="image/svg+xml" />
      <remove fileExtension=".json" /><mimeMap fileExtension=".json" mimeType="application/json" />
      <remove fileExtension=".wasm" /><mimeMap fileExtension=".wasm" mimeType="application/wasm" />
      <remove fileExtension=".pf_meta" /><mimeMap fileExtension=".pf_meta" mimeType="application/octet-stream" />
      <remove fileExtension=".pf_index" /><mimeMap fileExtension=".pf_index" mimeType="application/octet-stream" />
      <remove fileExtension=".pf_fragment" /><mimeMap fileExtension=".pf_fragment" mimeType="application/octet-stream" />
      <remove fileExtension=".pf_filter" /><mimeMap fileExtension=".pf_filter" mimeType="application/octet-stream" />
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="0.01:00:00" />
    </staticContent>
    <urlCompression doStaticCompression="true" doDynamicCompression="true" />
    <httpProtocol>
      <customHeaders>
        <remove name="X-Powered-By" />
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
        <add name="Content-Security-Policy" value="${esc(csp)}" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
        <add name="Permissions-Policy" value="camera=(), geolocation=(), microphone=(self), payment=(), usb=()" />
        <add name="Cross-Origin-Opener-Policy" value="same-origin" />
      </customHeaders>
    </httpProtocol>
    <security>
      <requestFiltering removeServerHeader="true">
        <verbs allowUnlisted="false"><add verb="GET" allowed="true" /><add verb="HEAD" allowed="true" /><add verb="POST" allowed="true" /></verbs>
      </requestFiltering>
    </security>
    <httpErrors errorMode="Custom" existingResponse="Replace">
      <remove statusCode="404" />
      <error statusCode="404" path="/404.html" responseMode="ExecuteURL" />
    </httpErrors>
    <rewrite>
      <rules>
        <!-- Chat assistant (Jago): forward /tribot-api/ to the TriBot service, so the browser only talks
             to tribal.gov.in (CSP connect-src 'self'). Required: the service rejects cross-origin calls
             from tribal.gov.in (checked 6 Oct 2026). No API key is sent. Needs IIS Application Request
             Routing with proxy switched on; uncomment once it is (docs/DEPLOYMENT.md).
        <rule name="tribot" stopProcessing="true">
          <match url="^tribot-api/(.*)" />
          <action type="Rewrite" url="https://tribot.tribal.gov.in/api/v1/{R:1}" />
        </rule> -->
        <rule name="https" stopProcessing="true">
          <match url="(.*)" />
          <conditions><add input="{HTTPS}" pattern="^OFF$" /></conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
        </rule>
${rules}
      </rules>
      <outboundRules>
        <rule name="remove-server">
          <match serverVariable="RESPONSE_SERVER" pattern=".+" />
          <action type="Rewrite" value="" />
        </rule>
      </outboundRules>
    </rewrite>
  </system.webServer>
  <location path="_assets">
    <system.webServer>
      <staticContent><clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" /></staticContent>
      <httpProtocol><customHeaders><add name="Cache-Control" value="public, max-age=31536000, immutable" /></customHeaders></httpProtocol>
    </system.webServer>
  </location>
</configuration>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
