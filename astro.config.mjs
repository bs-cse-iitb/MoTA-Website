// @ts-check
import fs from 'node:fs';
import https from 'node:https';
import tls from 'node:tls';
import { defineConfig } from 'astro/config';

// Development only (`npm run dev`): forward /tribot-api/* to the TriBot chat service, as the
// IIS rule in src/pages/web.config.ts does on the server, so the chat assistant answers.
// - It goes first in the dev server, ahead of Astro's trailing-slash check, which would
//   answer 404 for /tribot-api/chat.
// - The service does not send its intermediate certificate, so Node is given it:
//   vendor/globalsign-gcc-r6-alphassl-ca-2025.crt ("GlobalSign GCC R6 AlphaSSL CA 2025", from
//   http://secure.globalsign.com/cacert/gsgccr6alphasslca2025.crt; checked against GlobalSign
//   Root CA - R6 on 10 Oct 2026; SHA-256 A8:83:55:92:31:F8:38:8D:AF:35:CE:41:C8:10:10:40:AE:
//   8F:D9:B6:56:43:42:47:B9:47:5A:F5:92:CC:08:CA; valid until 21 May 2027). Certificate checks
//   stay on. Remove it once the service sends its full chain.
/** @returns {import('vite').Plugin} */
function tribotDevProxy() {
  return {
    name: 'tribot-dev-proxy',
    enforce: 'post',
    configureServer(server) {
      const cert = fs.readFileSync(new URL('./vendor/globalsign-gcc-r6-alphassl-ca-2025.crt', import.meta.url), 'utf8');
      const agent = new https.Agent({ ca: [...tls.rootCertificates, cert] });
      /** @param {import('node:http').IncomingMessage} req @param {import('node:http').ServerResponse} res */
      const forward = (req, res) => {
        // Like IIS Application Request Routing: same origin for the browser, body passed through.
        const up = https.request(`https://tribot.tribal.gov.in/api/v1${req.url}`, {
          method: req.method,
          agent,
          headers: { 'Content-Type': req.headers['content-type'] ?? 'application/json', Accept: 'application/json' },
        }, (r) => {
          res.writeHead(r.statusCode ?? 502, { 'Content-Type': r.headers['content-type'] ?? 'application/json' });
          r.pipe(res);
        });
        up.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
        req.pipe(up);
      };
      return () => { server.middlewares.stack.unshift({ route: '/tribot-api', handle: forward }); };
    },
  };
}

// Static output: the `dist/` folder is plain HTML/CSS/JS that can be hosted
// on any NIC server (IIS, Apache, Nginx) with no Node.js runtime.
export default defineConfig({
  site: 'https://tribal.gov.in',
  output: 'static',
  trailingSlash: 'always',
  // No inline scripts or styles, so the Content-Security-Policy can be strict
  // (script-src 'self'); see public/web.config.
  build: { format: 'directory', assets: '_assets', inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 }, plugins: [tribotDevProxy()] },
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
