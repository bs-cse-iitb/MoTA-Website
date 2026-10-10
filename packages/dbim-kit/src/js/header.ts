// Header behaviour: mega menu (disclosure pattern), mobile drawer, search toggle,
// voice search, text-size and contrast quick controls.
import { applyPrefs, readPrefs, savePrefs } from './prefs';

const desktop = window.matchMedia('(min-width: 1024px)');
const nav = document.querySelector<HTMLElement>('[data-mainnav]');
const items = Array.from(document.querySelectorAll<HTMLElement>('[data-menu-item]'));

function setOpen(item: HTMLElement, open: boolean) {
  const btn = item.querySelector<HTMLButtonElement>('.mainnav__trigger');
  if (!btn) return;
  btn.setAttribute('aria-expanded', String(open));
  item.classList.toggle('is-open', open);
}
function closeAll(except?: HTMLElement) {
  items.forEach((i) => i !== except && setOpen(i, false));
}

items.forEach((item) => {
  const btn = item.querySelector<HTMLButtonElement>('.mainnav__trigger');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    if (desktop.matches) closeAll(item);
    setOpen(item, open);
  });
  // Hover opens on devices with a fine pointer, with a short intent delay.
  let timer: number | undefined;
  item.addEventListener('pointerenter', (e) => {
    if (!desktop.matches || (e as PointerEvent).pointerType !== 'mouse') return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => { closeAll(item); setOpen(item, true); }, 120);
  });
  item.addEventListener('pointerleave', (e) => {
    if (!desktop.matches || (e as PointerEvent).pointerType !== 'mouse') return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => setOpen(item, false), 200);
  });
  // Close when keyboard focus leaves the item.
  item.addEventListener('focusout', (e) => {
    if (desktop.matches && !item.contains(e.relatedTarget as Node)) setOpen(item, false);
  });
});

// Arrow keys move between top-level triggers (menubar convenience).
const triggers = Array.from(document.querySelectorAll<HTMLElement>('.mainnav__home, .mainnav__trigger, .mainnav__whatsnew'));
triggers.forEach((el, i) => {
  el.addEventListener('keydown', (e) => {
    if (!desktop.matches) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = triggers[(i + (e.key === 'ArrowRight' ? 1 : triggers.length - 1)) % triggers.length];
      next.focus();
    }
    if (e.key === 'ArrowDown' && el.classList.contains('mainnav__trigger')) {
      e.preventDefault();
      const item = el.closest<HTMLElement>('[data-menu-item]');
      if (item) { closeAll(item); setOpen(item, true); item.querySelector<HTMLElement>('.mega a')?.focus(); }
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = items.find((i) => i.classList.contains('is-open'));
  if (open) {
    setOpen(open, false);
    open.querySelector<HTMLElement>('.mainnav__trigger')?.focus();
  } else if (document.body.classList.contains('menu-open')) {
    toggleMenu(false);
  }
});
document.addEventListener('click', (e) => {
  if (desktop.matches && nav && !nav.contains(e.target as Node)) closeAll();
});

// Mobile drawer
const menuBtn = document.querySelector<HTMLButtonElement>('[data-toggle-menu]');
function toggleMenu(open: boolean) {
  // Start the drawer below the brand bar, wherever the page is scrolled to.
  const bar = document.querySelector<HTMLElement>('.brandbar');
  if (open && bar) document.documentElement.style.setProperty('--drawer-top', `${Math.max(0, Math.round(bar.getBoundingClientRect().bottom))}px`);
  document.body.classList.toggle('menu-open', open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  if (open) nav?.querySelector<HTMLElement>('a, button')?.focus();
  else menuBtn?.focus();
}
menuBtn?.addEventListener('click', () => toggleMenu(!document.body.classList.contains('menu-open')));
desktop.addEventListener('change', () => { toggleMenu(false); closeAll(); });

// Mobile search toggle
const searchBtn = document.querySelector<HTMLButtonElement>('[data-toggle-search]');
searchBtn?.addEventListener('click', () => {
  const open = !document.body.classList.contains('search-open');
  document.body.classList.toggle('search-open', open);
  searchBtn.setAttribute('aria-expanded', String(open));
  if (open) document.querySelector<HTMLInputElement>('#site-search-q')?.focus();
});

// Voice search (Web Speech API) — shown only where the browser supports it.
type SpeechCtor = new () => {
  lang: string; interimResults: boolean; maxAlternatives: number;
  start(): void; stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
};
const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
const Speech = w.SpeechRecognition || w.webkitSpeechRecognition;
const voiceBtn = document.querySelector<HTMLButtonElement>('[data-voice-search]');
if (Speech && voiceBtn) {
  voiceBtn.hidden = false;
  const input = document.querySelector<HTMLInputElement>('#site-search-q');
  const form = document.querySelector<HTMLFormElement>('[data-site-search]');
  let rec: InstanceType<SpeechCtor> | null = null;
  voiceBtn.addEventListener('click', () => {
    if (rec) { rec.stop(); return; }
    rec = new Speech();
    rec.lang = document.documentElement.lang === 'hi' ? 'hi-IN' : 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    voiceBtn.classList.add('is-listening');
    if (input) input.placeholder = voiceBtn.dataset.listeningLabel || '';
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? '';
      if (input && text) { input.value = text; form?.requestSubmit(); }
    };
    rec.onend = rec.onerror = () => { voiceBtn.classList.remove('is-listening'); rec = null; };
    rec.start();
  });
}

// Quick text-size and contrast controls in the top bar
document.querySelectorAll<HTMLButtonElement>('[data-text-step]').forEach((b) => {
  b.addEventListener('click', () => {
    const prefs = readPrefs();
    const step = Number(b.dataset.textStep);
    prefs.text = step === 0 ? 0 : Math.max(-1, Math.min(2, prefs.text + step));
    savePrefs(prefs); applyPrefs(prefs, true);
  });
});
document.querySelectorAll<HTMLButtonElement>('[data-contrast-toggle]').forEach((b) => {
  b.addEventListener('click', () => {
    const prefs = readPrefs();
    prefs.theme = prefs.theme === 'contrast' ? 'light' : 'contrast';
    savePrefs(prefs); applyPrefs(prefs, true);
  });
});

// Language selector (DBIM 8, Fig. 42-43): disclosure button with a list of languages.
document.querySelectorAll<HTMLElement>('[data-lang-menu]').forEach((menu) => {
  const btn = menu.querySelector<HTMLButtonElement>('button');
  const list = menu.querySelector<HTMLElement>('ul');
  if (!btn || !list) return;
  const set = (open: boolean) => { btn.setAttribute('aria-expanded', String(open)); list.hidden = !open; };
  btn.addEventListener('click', () => set(list.hidden));
  menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); btn.focus(); } });
  document.addEventListener('click', (e) => { if (!menu.contains(e.target as Node)) set(false); });
  menu.addEventListener('focusout', (e) => { if (!menu.contains(e.relatedTarget as Node)) set(false); });
});

// Keep the language switch on the same section when there is a hash.
document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]').forEach((a) => {
  a.addEventListener('click', () => {
    if (location.hash) a.href = a.href.split('#')[0] + location.hash;
    const prefs = readPrefs();
    prefs.lang = a.dataset.langSwitch as 'en' | 'hi';
    savePrefs(prefs);
  });
});

// Sticky offsets: keep the nav row (desktop) or brand bar (mobile) in view.
const headerEl = document.querySelector<HTMLElement>('.site-header');
const topbar = document.querySelector<HTMLElement>('.topbar');
const brandbar = document.querySelector<HTMLElement>('.brandbar');
function measure() {
  if (!headerEl || !topbar || !brandbar) return;
  const tb = topbar.offsetHeight;
  const bb = brandbar.offsetHeight;
  document.documentElement.style.setProperty('--header-offset', `-${tb + bb}px`);
  document.documentElement.style.setProperty('--header-offset-m', `-${tb}px`);
  document.documentElement.style.setProperty('--header-h', `${desktop.matches ? headerEl.offsetHeight - tb - bb : bb}px`);
}
measure();
window.addEventListener('resize', measure, { passive: true });
document.addEventListener('prefs:change', () => requestAnimationFrame(measure));
document.fonts?.ready.then(measure);

// Elevated header shadow once the page scrolls.
const header = headerEl;
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 120);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
