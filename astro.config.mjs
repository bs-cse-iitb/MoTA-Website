// @ts-check
import { defineConfig } from 'astro/config';

// Static output: the `dist/` folder is plain HTML/CSS/JS that can be hosted
// on any NIC server (IIS, Apache, Nginx) with no Node.js runtime.
export default defineConfig({
  site: 'https://tribal.gov.in',
  output: 'static',
  trailingSlash: 'always',
  // No inline scripts or styles, so the Content-Security-Policy can be strict
  // (script-src 'self'); see public/web.config.
  build: { format: 'directory', assets: '_assets', inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
