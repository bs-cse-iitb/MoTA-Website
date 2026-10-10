// Accessibility and language preferences. Stored in localStorage as an
// essential, non-personal preference (DBIM 7.6.3.1); every access is guarded so
// the site works when storage is blocked.

export interface Prefs {
  text: number;                         // -1 .. 2
  theme: 'light' | 'dark' | 'contrast';
  links: boolean;
  spacing: boolean;
  readable: boolean;
  noMotion: boolean;
  /** Colour filter (DBIM template): none, invert or low saturation. */
  filter: 'none' | 'invert' | 'saturate';
  hideImages: boolean;
  bigCursor: boolean;
  lang?: 'en' | 'hi';
}

const KEY = 'mota-prefs';
export const defaults: Prefs = { text: 0, theme: 'light', links: false, spacing: false, readable: false, noMotion: false, filter: 'none', hideImages: false, bigCursor: false };

export function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

export function savePrefs(p: Prefs) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}

// ?theme=dark|contrast previews a theme for this page view without saving it.
let previewTheme = new URLSearchParams(location.search).get('theme');
if (!['light', 'dark', 'contrast'].includes(previewTheme ?? '')) previewTheme = null;

export function applyPrefs(p: Prefs, fromUser = false) {
  const root = document.documentElement;
  if (fromUser) previewTheme = null;
  root.dataset.text = String(p.text);
  root.dataset.theme = previewTheme ?? p.theme;
  root.classList.toggle('a11y-links', p.links);
  root.classList.toggle('a11y-spacing', p.spacing);
  root.classList.toggle('a11y-readable', p.readable);
  root.classList.toggle('a11y-nomotion', p.noMotion);
  root.classList.toggle('a11y-invert', p.filter === 'invert');
  root.classList.toggle('a11y-saturate', p.filter === 'saturate');
  root.classList.toggle('a11y-noimg', p.hideImages);
  root.classList.toggle('a11y-cursor', p.bigCursor);
  document.querySelectorAll<HTMLElement>('[data-contrast-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(root.dataset.theme === 'contrast')));
  document.querySelectorAll<HTMLElement>('[data-text-step]').forEach((b) => {
    const step = Number(b.dataset.textStep);
    b.setAttribute('aria-pressed', String(step === 0 ? p.text === 0 : false));
  });
  document.dispatchEvent(new CustomEvent('prefs:change', { detail: p }));
}
