// ONE-TIME MIGRATION TOOL. The website does not need the legacy code to build or run:
// every image it uses is already inside this project (src/assets, public/images).
// Run this only to re-import images from the legacy site (read only), for example
// after the Ministry changes a banner there:
//   LEGACY_DIR=/path/to/legacy/App node scripts/prepare-assets.mjs
// (defaults to ../MoTA_Website_Old/App, the legacy copy kept beside MoTA-Website/).
//
// It produces DBIM-compliant derivatives:
//   - State Emblem as black (light background) and white (dark background) PNGs, < 100 KB
//   - favicons
//   - partner logos re-encoded to WebP (< 100 KB each)
// Photos and banners go to src/assets so Astro's image pipeline can resize them
// and emit WebP at build time (DBIM: banners < 500 KB, thumbnails < 100 KB).
//
//   node scripts/prepare-assets.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacyApp = process.env.LEGACY_DIR ? path.resolve(process.env.LEGACY_DIR) : path.resolve(root, '..', 'MoTA_Website_Old', 'App');
const legacy = path.join(legacyApp, 'images');
try { await fs.access(legacy); } catch {
  console.error(`Legacy images not found at ${legacy}. Set LEGACY_DIR to the legacy App folder. (Not needed for building the site.)`);
  process.exit(1);
}
const out = (p) => path.join(root, p);

async function ensure(dir) { await fs.mkdir(out(dir), { recursive: true }); }
async function copy(from, to) {
  await fs.copyFile(path.join(legacy, from), out(to));
}

// 1. State Emblem. Source: vendor/emblem-of-india.svg (Wikimedia Commons).
//    Replace with the DBIM Toolkit original before go-live (see docs).
await ensure('public/images/emblem');
const emblemSvg = await fs.readFile(out('vendor/emblem-of-india.svg'), 'utf8');
const whiteSvg = emblemSvg.replace('<svg ', '<svg fill="#ffffff" ');
for (const [name, svg] of [['emblem-black', emblemSvg], ['emblem-white', whiteSvg]]) {
  await sharp(Buffer.from(svg), { density: 300 }).resize({ height: 160 }).png({ compressionLevel: 9, palette: true }).toFile(out(`public/images/emblem/${name}.png`));
}
await sharp(Buffer.from(emblemSvg), { density: 300 })
  .resize({ height: 160, width: 160, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png().toFile(out('public/apple-touch-icon.png'));
await sharp(Buffer.from(emblemSvg), { density: 200 })
  .resize({ height: 64, width: 64, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toFile(out('public/favicon.png'));

// 2. People (headshots on white, DBIM 6.1.4).
await ensure('src/assets/people');
// DBIM 6.1.4: headshots 1:1 on white — crop square from the top of the portrait.
for (const [from, to] of [['minister_JO.png', 'jual-oram.png'], ['MoS_DU.png', 'durgadas-uikey.png']]) {
  const src = path.join(legacy, from);
  const m = await sharp(src).metadata();
  const side = Math.min(m.width, m.height);
  await sharp(src).extract({ left: Math.floor((m.width - side) / 2), top: 0, width: side, height: side }).png().toFile(out(`src/assets/people/${to}`));
}

// 3. Campaign banners and event creatives (Astro converts to WebP at build).
await ensure('src/assets/banners');
const banners = {
  'WebBannerJGU2026-1.jpg': 'jgu-2026-themes.jpg',
  'WebBannerJGU2026-2.jpg': 'jgu-2026-technology.jpg',
  'WebBannerJGU2026-3.jpg': 'jgu-2026-jan-bhagidaari.jpg',
  'WebBannerJGU2026-4.jpg': 'jgu-2026-birsa.jpg',
  'WebBannerJGU2026-5.jpg': 'jgu-2026-classroom.jpg',
  '12SaalWebBanner.jpg': '12-saal.jpg',
};
for (const [from, to] of Object.entries(banners)) await copy(`Slider/${from}`, `src/assets/banners/${to}`);
// Bharat Innovates is 3:1; letterbox it to the 1440 x 386 banner size on its own edge colour.
await sharp(path.join(legacy, 'Slider/Bharat_innovates_banner.jpeg'))
  .resize({ width: 1440, height: 386, fit: 'contain', background: { r: 6, g: 10, b: 38 } })
  .jpeg({ quality: 88 }).toFile(out('src/assets/banners/bharat-innovates-2026.jpg'));
// TribeX (TribeXBannerNew.jpg) is only on the live server, not in the legacy source copy:
// it was downloaded once from https://tribal.gov.in/images/Slider/TribeXBannerNew.jpg to src/assets/banners/tribex.jpg.

// Co-branding logos shown in the live header (DBIM 5.4 allows at most two).
await ensure('public/images/cobrand');
await sharp(path.join(legacy, 'Aajadikaamrutmahotsav.jpg')).trim({ threshold: 12 }).resize({ height: 96 })
  .png({ compressionLevel: 9, palette: true }).toFile(out('public/images/cobrand/azadi-ka-amrit-mahotsav.png'));
await sharp(path.join(legacy, '150_logo_red.png')).trim().png({ compressionLevel: 9 })
  .toFile(out('public/images/cobrand/janjatiya-gaurav-varsh-150.png'));

await ensure('src/assets/gallery');
const gallery = {
  'AdiMahotsav2025Eng.jpeg': 'aadi-mahotsav-2025.jpg',
  'TribalBusinessConclave2025.jpg': 'tribal-business-conclave-2025.jpg',
  'PMJANMAN.jpg': 'pm-janman-manthan-shivir-2023.jpg',
  'JJGD.jpg': 'janjatiya-gaurav-divas.jpg',
  'Sickle2.jpg': 'sickle-cell-2047.jpg',
  'Sickle1.jpg': 'world-sickle-cell-day.jpg',
  'Banner_tri.jpg': 'tribal-research-institute.jpg',
  'RDCWebBanner2026.jpg': 'republic-day-2026.jpg',
};
for (const [from, to] of Object.entries(gallery)) await copy(`Slider/${from}`, `src/assets/gallery/${to}`);

// 4. Partner / related-portal logos for the footer carousel (DBIM A.4.1.2 xiv).
await ensure('public/images/partners');
const partners = {
  'india-gov.png': 'india-gov', 'mygov.png': 'mygov', 'datagov.png': 'data-gov', 'digital-india.png': 'digital-india',
  'pib_logo.png': 'pib', 'ncst.png': 'ncst', 'nstfdc.png': 'nstfdc', 'tribes.png': 'tribes-india', 'ngo.png': 'ngo-darpan',
  'IndiaCode.png': 'india-code', 'nvsp.png': 'nvsp', 'Utsav-logo2.png': 'utsav', 'logo_bhuvan.png': 'bhuvan', 'dial_gov_logo.png': 'dial-gov',
};
for (const [from, name] of Object.entries(partners)) {
  const src = path.join(legacy, 'Client-logo', from);
  try {
    await sharp(src).resize({ height: 120, withoutEnlargement: true }).webp({ quality: 88 }).toFile(out(`public/images/partners/${name}.webp`));
  } catch (err) {
    console.warn(`skip ${from}: ${err.message}`);
  }
}

// Report sizes so DBIM limits can be checked at a glance.
for (const dir of ['public/images/emblem', 'public/images/partners', 'public/images/cobrand']) {
  for (const f of await fs.readdir(out(dir))) {
    const { size } = await fs.stat(out(`${dir}/${f}`));
    console.log(`${dir}/${f}  ${(size / 1024).toFixed(1)} KB${size > 100 * 1024 ? '  <-- over DBIM 100 KB logo limit' : ''}`);
  }
}
console.log('assets ready');
