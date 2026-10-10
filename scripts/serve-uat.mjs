// Local stand-in for the IIS staging server: serves dist/ with the response headers from
// dist/web.config (CSP, HSTS, X-Content-Type-Options, …), gzip compression, the same
// cache rules (1 hour; 1 year for hashed files in /_assets/), the custom 404 page and the
// legacy .aspx redirects. Use it for UAT evidence before the NIC staging server is ready.
//
//   npm run build && node scripts/serve-uat.mjs [--port 4322] [--docs <old App folder>] [--tribot <service URL>]
//
// --docs also serves documents and media (PDF, Office files, images, audio, video) from a
// copy of the old site at their old addresses, as the production server will after the
// document folders are copied across (docs/DEPLOYMENT.md). Code and configuration files
// are never served from it.
//
// --tribot forwards /tribot-api/* to a chat service, as the IIS proxy rule in web.config
// does on the server: the mock in tests/mocks/tribot-service.mjs, or the real service.

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const gzip = promisify(zlib.gzip);
const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1]) || 4322;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const docsArg = args.indexOf('--docs');
const docsRoot = docsArg >= 0 ? path.resolve(args[docsArg + 1]) : null;
const tribotArg = args.indexOf('--tribot');
const tribot = tribotArg >= 0 ? args[tribotArg + 1].replace(/\/$/, '') : null;
// Only these file types are served from the old site's folders.
const DOC_TYPES = /\.(pdf|docx?|xlsx?|pptx?|odt|ods|rtf|txt|csv|zip|rar|jpe?g|png|gif|svg|webp|bmp|mp3|mp4|ogg|mpeg|mpg|wav|wmv|swf|html?)$/i;

const config = await fs.readFile(path.join(root, 'web.config'), 'utf8');
const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const block = config.match(/<customHeaders>([\s\S]*?)<\/customHeaders>/)[1];
const headers = Object.fromEntries([...block.matchAll(/<add name="([^"]+)" value="([^"]*)"/g)].map((m) => [m[1], unescape(m[2])]));
// Over plain HTTP on 127.0.0.1 the browser would upgrade our own requests to https; production keeps it.
if (headers['Content-Security-Policy']) headers['Content-Security-Policy'] = headers['Content-Security-Policy'].replace(/;\s*upgrade-insecure-requests/, '');
// Same matching as IIS URL Rewrite: path without the leading slash or query string, any case;
// the query string is passed on only where the rule says appendQueryString="true".
const redirects = [...config.matchAll(/<match url="\^([^"]+)\$" ignoreCase="true" \/>\s*<action type="Redirect" url="([^"]+)"[^>]*?appendQueryString="(true|false)"/g)]
  .map((m) => [new RegExp(`^/${unescape(m[1])}$`, 'i'), unescape(m[2]), m[3] === 'true']);

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf', '.wasm': 'application/wasm', '.config': 'text/plain',
  '.htm': 'text/html; charset=utf-8', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.bmp': 'image/bmp', '.csv': 'text/csv',
  '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.odt': 'application/vnd.oasis.opendocument.text', '.ods': 'application/vnd.oasis.opendocument.spreadsheet', '.rtf': 'application/rtf',
  '.zip': 'application/zip', '.rar': 'application/vnd.rar', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.ogg': 'audio/ogg',
  '.mpeg': 'video/mpeg', '.mpg': 'video/mpeg', '.wav': 'audio/wav', '.wmv': 'video/x-ms-wmv', '.swf': 'application/x-shockwave-flash',
};
const compressible = /^(text\/|application\/(json|xml|javascript)|image\/svg)/;

async function resolve(p) {
  const file = path.join(root, p);
  if (!file.startsWith(root)) return null;
  // Not in the new build: an old document at its old address (with --docs).
  // Old HTML is served only from content folders (e.g. writereaddata/TrainingModule/);
  // old site pages at the top level or in ResourcesHindi/ are redirected or retired instead.
  const oldPage = /\.html?$/i.test(p) && (/^\/[^/]+$/.test(p) || /^\/(resourceshindi|chat_popup)\//i.test(p));
  if (docsRoot && DOC_TYPES.test(p) && !oldPage) {
    try { await fs.access(file); } catch {
      const old = path.join(docsRoot, p);
      if (old.startsWith(docsRoot + path.sep)) { try { if ((await fs.stat(old)).isFile()) return old; } catch { /* not there either */ } }
    }
  }
  try {
    const st = await fs.stat(file);
    if (st.isDirectory()) return resolve(path.join(p, 'index.html'));
    return file;
  } catch { return null; }
}

http.createServer((req, res) => handle(req, res).catch((e) => { res.writeHead(500); res.end(String(e.message)); }))
  .listen(port, '127.0.0.1', () => console.log(`UAT server: http://127.0.0.1:${port}/ (headers from dist/web.config: ${Object.keys(headers).join(', ')})${docsRoot ? `; old documents from ${docsRoot}` : ''}${tribot ? `; /tribot-api/ → ${tribot}` : ''}`));

async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const pathname = decodeURIComponent(url.pathname);
  const send = async (status, file, extra = {}) => {
    let body = await fs.readFile(file);
    const type = types[path.extname(file)] ?? 'application/octet-stream';
    const h = { ...headers, 'Content-Type': type, 'Cache-Control': pathname.startsWith('/_assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600', Vary: 'Accept-Encoding', ...extra };
    if (compressible.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) { body = await gzip(body); h['Content-Encoding'] = 'gzip'; }
    res.writeHead(status, h);
    res.end(req.method === 'HEAD' ? undefined : body);
  };
  if (tribot && pathname.startsWith('/tribot-api/')) {
    // Like IIS Application Request Routing: same origin for the browser, body passed through.
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const r = await fetch(`${tribot}/${pathname.slice('/tribot-api/'.length)}${url.search}`, {
        method: req.method, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
        headers: { 'Content-Type': req.headers['content-type'] ?? 'application/json', Accept: 'application/json' },
      });
      res.writeHead(r.status, { ...headers, 'Content-Type': r.headers.get('content-type') ?? 'application/json' });
      res.end(Buffer.from(await r.arrayBuffer()));
    } catch { res.writeHead(502, headers); res.end(); }
    return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, headers); res.end(); return; }
  // IIS never serves configuration files (request filtering denies .config in any case).
  if (/\.config$/i.test(pathname)) { await send(404, path.join(root, '404.html')); return; }
  for (const [re, to, keepQuery] of redirects) if (re.test(pathname)) { res.writeHead(301, { ...headers, Location: keepQuery ? `${to}${url.search}` : to }); res.end(); return; }
  if (!pathname.endsWith('/') && !path.extname(pathname) && await resolve(`${pathname}/`)) { res.writeHead(301, { ...headers, Location: `${pathname}/${url.search}` }); res.end(); return; }
  const file = await resolve(pathname);
  if (file) await send(200, file);
  else await send(404, path.join(root, '404.html'));
}
