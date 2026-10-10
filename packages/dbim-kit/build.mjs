// Builds the distributable kit into dist/ for portals that are not built with Astro
// (ASP.NET Web Forms/MVC, PHP, Java, static HTML):
//   dist/dbim.css, dbim.min.css   all styles, with self-hosted Noto Sans
//   dist/dbim.js                  behaviour for every component (IIFE, no dependencies)
//   dist/dbim-search.js           optional site search (needs a Pagefind index)
//   dist/dbim-early.js            applies saved accessibility preferences before paint
//   dist/icons.svg                DBIM line-icon sprite (<use href="icons.svg#i-search">)
//   dist/fonts/, dist/assets/     fonts, emblem, Warli band, big cursor, chat assistant mascot
//   templates/, examples/         generated from the built pilot site (run `npm run build` first)
// Run from the project root:  npm run build && node packages/dbim-kit/build.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, transform } from 'esbuild';
import * as lucide from 'lucide-static';
import { extract } from './extract.mjs';

const kit = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(kit, '../..');
const dist = path.join(kit, 'dist');
await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(path.join(dist, 'fonts'), { recursive: true });
await fs.mkdir(path.join(dist, 'assets'), { recursive: true });

// Fonts (Noto Sans: DBIM 4.1) — variable weight, Latin + Devanagari subsets
const fontFiles = {
  'noto-sans-latin.woff2': 'node_modules/@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2',
  'noto-sans-latin-ext.woff2': 'node_modules/@fontsource-variable/noto-sans/files/noto-sans-latin-ext-wght-normal.woff2',
  'noto-sans-devanagari.woff2': 'node_modules/@fontsource-variable/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-wght-normal.woff2',
};
for (const [to, from] of Object.entries(fontFiles)) await fs.copyFile(path.join(root, from), path.join(dist, 'fonts', to));
const fontCss = `
@font-face { font-family: 'Noto Sans Variable'; font-style: normal; font-display: swap; font-weight: 100 900; src: url('./fonts/noto-sans-latin.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: 'Noto Sans Variable'; font-style: normal; font-display: swap; font-weight: 100 900; src: url('./fonts/noto-sans-latin-ext.woff2') format('woff2-variations');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Noto Sans Devanagari Variable'; font-style: normal; font-display: swap; font-weight: 100 900; src: url('./fonts/noto-sans-devanagari.woff2') format('woff2-variations');
  unicode-range: U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09; }
`;

// CSS
const order = ['tokens', 'base', 'layout', 'components', 'a11y', 'print'];
let css = `/*! MoTA DBIM Kit — DBIM 3.0 / GIGW 3.0 components. Colour group: <html data-dbim-group="1..10|neutral"> (default 9). */\n${fontCss}`;
for (const f of order) css += `\n/* ---- ${f}.css ---- */\n` + (await fs.readFile(path.join(kit, 'src/css', `${f}.css`), 'utf8'));
css = css.replaceAll("url('/images/warli-band.svg')", "url('./assets/warli-band.svg')").replaceAll("url('/images/cursor-big.svg')", "url('./assets/cursor-big.svg')");
await fs.writeFile(path.join(dist, 'dbim.css'), css);
const min = await transform(css, { loader: 'css', minify: true });
await fs.writeFile(path.join(dist, 'dbim.min.css'), min.code);

// JS
await build({ entryPoints: [path.join(kit, 'src/js/index.ts')], bundle: true, minify: true, format: 'iife', target: 'es2019', outfile: path.join(dist, 'dbim.js'), legalComments: 'none', logLevel: 'warning' });
await build({ entryPoints: [path.join(kit, 'src/js/search.ts')], bundle: true, minify: true, format: 'esm', target: 'es2020', outfile: path.join(dist, 'dbim-search.js'), logLevel: 'warning' });
await fs.copyFile(path.join(root, 'public/js/prefs-early.js'), path.join(dist, 'dbim-early.js'));

// Icon sprite: icons used by the templates plus a standard government set
const icons = ['House', 'Search', 'Mic', 'Menu', 'X', 'ChevronDown', 'ChevronRight', 'ChevronLeft', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowUpRight', 'ExternalLink',
  'Accessibility', 'Languages', 'Contrast', 'Type', 'Link', 'BookOpen', 'Pause', 'Play', 'RotateCcw', 'SunMoon', 'Droplet', 'ImageOff', 'MousePointer2', 'Cookie', 'Globe',
  'SquareArrowOutUpRight', 'Landmark', 'HandHeart', 'Files', 'Camera', 'MessageSquare', 'Info', 'Users', 'LayoutGrid', 'Building2', 'ChartColumn', 'Contact', 'HandCoins',
  'Laptop', 'Sparkles', 'Gavel', 'Briefcase', 'Award', 'ChartLine', 'Scale', 'ScrollText', 'Newspaper', 'ClipboardList', 'Library', 'Megaphone', 'IndianRupee', 'BookMarked',
  'Image', 'Video', 'Notebook', 'Phone', 'Mail', 'MapPin', 'Map', 'FileText', 'LifeBuoy', 'Handshake', 'Vote', 'Send', 'ShieldCheck', 'Bell', 'FolderOpen', 'CircleHelp',
  'Volume2', 'Network', 'Clock', 'Calendar', 'Download', 'Filter', 'Printer', 'Share2', 'Quote', 'GraduationCap', 'School', 'HeartPulse', 'Trees', 'Sprout', 'Store', 'Check'];
// Templates and gallery come from the built pilot; their icons are added to the sprite.
let generated = { used: new Set(), images: 0 };
try { generated = await extract({ root, kit, lucide, preferred: icons }); }
catch (e) { console.warn(`templates not generated (${e.message}); run the site build first`); }
for (const name of generated.used) if (!icons.includes(name)) icons.push(name);
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Za-z])([0-9])/g, '$1-$2').toLowerCase();
let sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n';
for (const name of icons) {
  const raw = lucide[name];
  if (!raw) { console.warn('missing icon', name); continue; }
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\n\s*/g, '');
  sprite += `<symbol id="i-${kebab(name)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>\n`;
}
sprite += '</svg>\n';
await fs.writeFile(path.join(dist, 'icons.svg'), sprite);

// Assets
for (const [from, to] of [['public/images/emblem/emblem-black.png', 'emblem-black.png'], ['public/images/emblem/emblem-white.png', 'emblem-white.png'], ['public/images/cursor-big.svg', 'cursor-big.svg'], ['public/favicon.png', 'favicon.png'], ['dist/images/warli-band.svg', 'warli-band.svg'], ['public/images/assistant/jago-96.webp', 'jago-96.webp'], ['public/images/assistant/jago-160.webp', 'jago-160.webp']]) {
  try { await fs.copyFile(path.join(root, from), path.join(dist, 'assets', to)); } catch (e) { console.warn(`skip ${from}: run the site build first`); }
}
const sizes = {};
for (const f of ['dbim.css', 'dbim.min.css', 'dbim.js', 'dbim-search.js', 'icons.svg']) sizes[f] = `${((await fs.stat(path.join(dist, f))).size / 1024).toFixed(1)} KB`;
console.log('dbim-kit built:', sizes, `${icons.length} icons`, `${generated.images} gallery images`);
