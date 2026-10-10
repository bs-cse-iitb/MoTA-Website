// Warli-inspired line art, generated as SVG markup at build time.
//
// Warli painting (from the Warli community of the Sahyadri foothills) draws people
// as two triangles joined at the waist, with a circle for the head, and builds
// scenes of dance, harvest, trees and huts from circles, triangles and lines.
// These motifs are used decoratively (aria-hidden) and draw in `currentColor`,
// so they follow every colour theme. For the production site, the Ministry may
// commission tribal artists for original artwork and credit them on the page.

type Pose = 'dance' | 'raise' | 'hold' | 'walk' | 'carry' | 'wave';

const r = (n: number) => Math.round(n * 100) / 100;

export interface FigureOpts { x: number; y: number; s?: number; pose?: Pose; step?: 0 | 1; flip?: boolean }

/** One figure standing with its feet on (x, y). Height is about 11 × s. */
export function figure({ x, y, s = 1, pose = 'dance', step = 0, flip = false }: FigureOpts): string {
  const d = flip ? -1 : 1;
  const ys = y - 8.4 * s; // shoulders
  const yw = y - 5.6 * s; // waist
  const yh = y - 3.2 * s; // hips
  const yhead = y - 10.05 * s;

  const body =
    `M${r(x - 2.1 * s)} ${r(ys)}L${r(x + 2.1 * s)} ${r(ys)}L${r(x)} ${r(yw)}Z` +
    `M${r(x)} ${r(yw)}L${r(x - 2 * s)} ${r(yh)}L${r(x + 2 * s)} ${r(yh)}Z`;

  const legs = step === 0
    ? `M${r(x - 1.2 * s)} ${r(yh)}L${r(x - 2.5 * s)} ${r(y - 1.5 * s)}L${r(x - 1.9 * s)} ${r(y)}` +
      `M${r(x + 1.2 * s)} ${r(yh)}L${r(x + 2.1 * s)} ${r(y - 1.7 * s)}L${r(x + 3.1 * s)} ${r(y - 0.3 * s)}`
    : `M${r(x - 1.2 * s)} ${r(yh)}L${r(x - 2.1 * s)} ${r(y - 1.7 * s)}L${r(x - 3.1 * s)} ${r(y - 0.3 * s)}` +
      `M${r(x + 1.2 * s)} ${r(yh)}L${r(x + 2.5 * s)} ${r(y - 1.5 * s)}L${r(x + 1.9 * s)} ${r(y)}`;

  const L = (ex: number, ey: number, hx: number, hy: number) =>
    `M${r(x - 2.1 * s)} ${r(ys)}L${r(x + ex * s)} ${r(ys + ey * s)}L${r(x + hx * s)} ${r(ys + hy * s)}`;
  const R = (ex: number, ey: number, hx: number, hy: number) =>
    `M${r(x + 2.1 * s)} ${r(ys)}L${r(x + ex * s)} ${r(ys + ey * s)}L${r(x + hx * s)} ${r(ys + hy * s)}`;

  let arms = '';
  switch (pose) {
    case 'dance': // hands meet neighbours at ±3.3s
      arms = L(-2.9, 1.9, -3.3, 0.9) + R(2.9, 1.9, 3.3, 0.9);
      break;
    case 'raise':
      arms = L(-3.4, -0.4, -3.1, -2.8) + R(3.4, -0.4, 3.1, -2.8);
      break;
    case 'hold': // both hands in front (towards d)
      arms = d > 0 ? L(-0.4, 2.6, 2.6, 1.4) + R(3.1, 1.6, 3.2, 1.0) : L(-3.1, 1.6, -3.2, 1.0) + R(0.4, 2.6, -2.6, 1.4);
      break;
    case 'walk':
      arms = L(-3.0, 2.2, -3.6, 3.6) + R(2.8, 1.6, 3.8, 0.4);
      break;
    case 'carry': // hands up to a load on the head
      arms = L(-3.0, -1.4, -1.7, -3.4) + R(3.0, -1.4, 1.7, -3.4);
      break;
    case 'wave':
      arms = L(-3.0, 2.2, -3.4, 3.4) + R(3.5, -0.3, 3.4, -2.9);
      break;
  }

  return (
    `<g>` +
    `<circle cx="${r(x)}" cy="${r(yhead)}" r="${r(1.25 * s)}"/>` +
    `<path d="${body}"/>` +
    `<path d="${legs}${arms}" fill="none" stroke="currentColor" stroke-width="${r(0.55 * s)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `</g>`
  );
}

/** A chain of dancers holding hands, as in the Warli tarpa dance. */
export function danceChain(x0: number, y: number, count: number, s = 1): string {
  let out = '';
  for (let i = 0; i < count; i++) out += figure({ x: x0 + i * 6.6 * s, y, s, pose: 'dance', step: (i % 2) as 0 | 1 });
  return out;
}

/** Warli tree: a trunk with paired branches and almond leaves. */
export function tree(x: number, y: number, h: number, s = 1): string {
  const sw = r(0.5 * s);
  let d = `M${r(x)} ${r(y)}L${r(x)} ${r(y - h)}`;
  let leaves = '';
  const levels = 6;
  for (let i = 0; i < levels; i++) {
    const by = y - h * (0.3 + (0.68 * i) / levels);
    const len = h * (0.36 - i * 0.045);
    for (const dir of [-1, 1]) {
      const ex = x + dir * len * 0.82;
      const ey = by - len * 0.55;
      d += `M${r(x)} ${r(by)}L${r(ex)} ${r(ey)}`;
      for (let k = 1; k <= 3; k++) {
        const t = k / 3.4;
        const lx = x + (ex - x) * t;
        const ly = by + (ey - by) * t;
        leaves += leaf(lx, ly, 1.5 * s, dir < 0 ? -50 : 50) + leaf(lx, ly, 1.5 * s, dir < 0 ? -140 : 140);
      }
    }
  }
  leaves += leaf(x, y - h - 1.2 * s, 1.8 * s, 0);
  return `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"/>${leaves}`;
}

function leaf(x: number, y: number, len: number, deg: number): string {
  return `<path transform="translate(${r(x)} ${r(y)}) rotate(${deg})" d="M0 0Q${r(len * 0.45)} ${r(-len * 0.5)} 0 ${r(-len * 1.6)}Q${r(-len * 0.45)} ${r(-len * 0.5)} 0 0Z"/>`;
}

/** Hut with a thatched (hatched) roof and a doorway. */
export function hut(x: number, y: number, s = 1): string {
  const w = 5.2 * s, hW = 6 * s, roofTop = y - 11.5 * s;
  let hatch = '';
  for (let i = -5; i <= 5; i++) {
    const t = i / 6;
    hatch += `M${r(x + t * 6.6 * s)} ${r(y - hW + 0.2 * s)}L${r(x + t * 1.6 * s)} ${r(roofTop + 1.6 * s)}`;
  }
  return (
    `<path d="M${r(x - 7 * s)} ${r(y - hW)}L${r(x)} ${r(roofTop)}L${r(x + 7 * s)} ${r(y - hW)}Z" fill="none" stroke="currentColor" stroke-width="${r(0.55 * s)}" stroke-linejoin="round"/>` +
    `<path d="${hatch}" stroke="currentColor" stroke-width="${r(0.3 * s)}"/>` +
    `<path d="M${r(x - w)} ${r(y - hW)}L${r(x - w)} ${r(y)}L${r(x + w)} ${r(y)}L${r(x + w)} ${r(y - hW)}" fill="none" stroke="currentColor" stroke-width="${r(0.55 * s)}"/>` +
    `<path d="M${r(x - 1.3 * s)} ${r(y)}L${r(x - 1.3 * s)} ${r(y - 3.6 * s)}Q${r(x)} ${r(y - 4.8 * s)} ${r(x + 1.3 * s)} ${r(y - 3.6 * s)}L${r(x + 1.3 * s)} ${r(y)}Z"/>`
  );
}

/** Sun with triangular rays. */
export function sun(x: number, y: number, rad: number): string {
  let rays = '';
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const a1 = a - 0.09, a2 = a + 0.09;
    const ir = rad * 1.3, or = rad * 1.85;
    rays += `M${r(x + Math.cos(a1) * ir)} ${r(y + Math.sin(a1) * ir)}L${r(x + Math.cos(a) * or)} ${r(y + Math.sin(a) * or)}L${r(x + Math.cos(a2) * ir)} ${r(y + Math.sin(a2) * ir)}Z`;
  }
  return `<circle cx="${r(x)}" cy="${r(y)}" r="${r(rad)}"/><path d="${rays}"/>`;
}

export function mountain(x: number, y: number, w: number, h: number, sw = 0.6): string {
  let dots = '';
  for (let row = 1; row < 5; row++) {
    const yy = y - h + (h * row) / 5;
    const half = (w / 2) * (row / 5);
    for (let k = -row; k <= row; k += 2) dots += `<circle cx="${r(x + (k * half) / (row + 1))}" cy="${r(yy)}" r="${r(sw * 0.7)}"/>`;
  }
  return `<path d="M${r(x - w / 2)} ${r(y)}L${r(x)} ${r(y - h)}L${r(x + w / 2)} ${r(y)}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linejoin="round"/>${dots}`;
}

export function bird(x: number, y: number, s = 1): string {
  return `<path d="M${r(x - 2 * s)} ${r(y - 0.6 * s)}Q${r(x - 1 * s)} ${r(y - 1.4 * s)} ${r(x)} ${r(y)}Q${r(x + 1 * s)} ${r(y - 1.4 * s)} ${r(x + 2 * s)} ${r(y - 0.6 * s)}" fill="none" stroke="currentColor" stroke-width="${r(0.4 * s)}" stroke-linecap="round"/>`;
}

/** Row of up/down triangles used as a Warli border. */
export function zigzag(x0: number, y: number, width: number, size: number): string {
  let d = '';
  for (let x = x0; x < x0 + width; x += size * 2) {
    d += `M${r(x)} ${r(y)}L${r(x + size / 2)} ${r(y - size * 0.8)}L${r(x + size)} ${r(y)}Z`;
    d += `M${r(x + size)} ${r(y - size * 0.8)}L${r(x + size * 1.5)} ${r(y)}L${r(x + size * 2)} ${r(y - size * 0.8)}Z`;
  }
  return `<path d="${d}"/>`;
}

export function dots(x0: number, y: number, width: number, gap: number, rad: number): string {
  let out = '';
  for (let x = x0; x <= x0 + width; x += gap) out += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(rad)}"/>`;
  return out;
}

// ---------------------------------------------------------------------------
// Composed artwork
// ---------------------------------------------------------------------------

/** Repeatable tile (2 dancers) used as a CSS mask for decorative bands. */
export function bandTile(): string {
  const s = 2.4;
  const w = 6.6 * s * 2; // 31.68
  const h = 40;
  const body = figure({ x: 3.3 * s, y: 33, s, pose: 'dance', step: 0 }) + figure({ x: 9.9 * s, y: 33, s, pose: 'dance', step: 1 });
  const ground = `<path d="M0 35.6H${r(w)}" stroke="#000" stroke-width="0.9"/>`;
  const zz = `<path d="M0 39.6L${r(w / 4)} 37L${r(w / 2)} 39.6L${r((3 * w) / 4)} 37L${r(w)} 39.6" fill="none" stroke="#000" stroke-width="0.9"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${h}" width="${r(w)}" height="${h}" fill="#000" stroke="#000">${body}${ground}${zz}</svg>`;
}

export function svgDataUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22')}")`;
}

/** Home hero scene, viewBox 0 0 520 360. */
export function heroScene(): string {
  let g = '';
  g += sun(430, 70, 22);
  g += bird(330, 60, 3) + bird(360, 44, 2.4) + bird(300, 80, 2);
  g += mountain(130, 250, 220, 120, 1.2) + mountain(300, 250, 260, 150, 1.2) + mountain(440, 250, 180, 95, 1.2);
  g += tree(60, 300, 120, 2.2) + tree(470, 300, 95, 1.9);
  g += hut(170, 300, 4.2) + hut(380, 300, 3.4);
  g += figure({ x: 245, y: 300, s: 3.6, pose: 'carry' });
  g += `<ellipse cx="245" cy="${r(300 - 10.05 * 3.6 - 4.4 * 3.6 + 1)}" rx="9" ry="4.6"/>`; // pot on head
  g += figure({ x: 300, y: 300, s: 3.6, pose: 'wave', step: 1 });
  g += `<path d="M10 302H510" stroke="currentColor" stroke-width="1.6"/>`;
  g += danceChain(36, 352, 22, 3.25);
  g += dots(12, 357, 500, 9, 1.1);
  return g;
}

/** Persona illustration, viewBox 0 0 120 120. */
export function personaArt(prop: 'book' | 'tree' | 'lens' | 'hands' | 'pillar' | 'basket' | 'mic'): string {
  const ground = `<path d="M14 104H106" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>` + dots(18, 110, 84, 7, 1.1);
  const s = 7.4;
  switch (prop) {
    case 'book':
      return ground + figure({ x: 54, y: 104, s, pose: 'hold' }) +
        `<path d="M68 34l9 3 9-3v13l-9 3-9-3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M77 37v13" stroke="currentColor" stroke-width="1.4"/>` +
        sun(98, 22, 5);
    case 'tree':
      return ground + figure({ x: 42, y: 104, s, pose: 'wave' }) + tree(88, 104, 64, 1.6);
    case 'lens':
      return ground + figure({ x: 50, y: 104, s, pose: 'hold' }) +
        `<circle cx="80" cy="36" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M74 42l-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>` +
        dots(88, 66, 16, 5, 1.3) + dots(84, 74, 20, 5, 1.3);
    case 'hands':
      return ground + figure({ x: 38, y: 104, s: 6.6, pose: 'dance' }) + figure({ x: 38 + 6.6 * 6.6, y: 104, s: 6.6, pose: 'dance', step: 1 }) +
        `<path d="M60 22c-3-4-9-2-8 3 1 4 8 8 8 8s7-4 8-8c1-5-5-7-8-3z"/>`;
    case 'pillar':
      return ground + figure({ x: 34, y: 104, s, pose: 'walk' }) +
        `<path d="M62 52l20-12 20 12z"/><path d="M64 56h36M64 100h36" stroke="currentColor" stroke-width="2"/>` +
        `<path d="M68 58v40M76 58v40M84 58v40M92 58v40M98 58v40" stroke="currentColor" stroke-width="2.2"/>`;
    case 'basket':
      return ground + figure({ x: 60, y: 104, s, pose: 'carry' }) +
        `<path d="M46 9h28l-4 8.5H50z"/><path d="M50 8c3-6 17-6 20 0" fill="none" stroke="currentColor" stroke-width="1.4"/>` +
        dots(52, 5.5, 16, 4, 1.1);
    case 'mic':
      return ground + figure({ x: 46, y: 104, s, pose: 'hold' }) +
        `<rect x="74" y="30" width="7" height="12" rx="3.5"/><path d="M77.5 42v62M70 104h15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>` +
        `<path d="M86 30q5 6 0 12M90 26q8 10 0 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`;
  }
}

/** Celebration scene for the PM quote band, viewBox 0 0 300 190. */
export function celebration(): string {
  let g = sun(250, 42, 16);
  g += bird(170, 40, 3) + bird(196, 26, 2.4);
  g += tree(36, 178, 120, 1.9);
  g += danceChain(86, 178, 6, 4.9);
  g += `<path d="M64 180H296" stroke="currentColor" stroke-width="1.4"/>`;
  g += dots(66, 186, 228, 8, 1.1);
  return g;
}
