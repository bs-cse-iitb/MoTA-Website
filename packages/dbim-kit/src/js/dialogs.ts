// Accessibility panel, external-link notice, cookie consent, back-to-top, toast.
import { applyPrefs, defaults, readPrefs, savePrefs, type Prefs } from './prefs';

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(s));

let lastTrigger: HTMLElement | null = null;
function openDialog(d: HTMLDialogElement | null, trigger?: HTMLElement | null) {
  if (!d) return;
  lastTrigger = trigger ?? (document.activeElement as HTMLElement);
  d.showModal();
}
function closeDialog(d: HTMLDialogElement) {
  d.close();
}
$$<HTMLDialogElement>('dialog.panel').forEach((d) => {
  d.addEventListener('close', () => lastTrigger?.focus());
  // Click on the backdrop closes the dialog.
  d.addEventListener('click', (e) => { if (e.target === d) closeDialog(d); });
  $$('[data-close-dialog]', d).forEach((b) => b.addEventListener('click', () => closeDialog(d)));
});

// ---------------------------------------------------------------- Accessibility
const a11y = $<HTMLDialogElement>('#a11y-panel');
$$('[data-open-a11y]').forEach((b) => b.addEventListener('click', () => openDialog(a11y, b)));

function syncPanel(p: Prefs) {
  if (!a11y) return;
  $$<HTMLButtonElement>('[data-a11y="text"]', a11y).forEach((b) => b.setAttribute('aria-checked', String(Number(b.value) === p.text)));
  $$<HTMLButtonElement>('[data-a11y="theme"]', a11y).forEach((b) => b.setAttribute('aria-checked', String(b.value === p.theme)));
  (['links', 'spacing', 'readable', 'noMotion', 'hideImages', 'bigCursor'] as const).forEach((k) => {
    $(`[data-a11y="${k}"]`, a11y)?.setAttribute('aria-pressed', String(p[k]));
  });
  $$<HTMLButtonElement>('[data-a11y="filter"]', a11y).forEach((b) => b.setAttribute('aria-pressed', String(b.value === p.filter)));
}
syncPanel(readPrefs());
document.addEventListener('prefs:change', (e) => syncPanel((e as CustomEvent<Prefs>).detail));

a11y?.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-a11y]');
  if (!btn) return;
  const p = readPrefs();
  const key = btn.dataset.a11y as keyof Prefs;
  if (key === 'text') p.text = Number(btn.value);
  else if (key === 'theme') p.theme = btn.value as Prefs['theme'];
  else if (key === 'filter') p.filter = p.filter === btn.value ? 'none' : (btn.value as Prefs['filter']);
  else if (key === 'links' || key === 'spacing' || key === 'readable' || key === 'noMotion' || key === 'hideImages' || key === 'bigCursor') p[key] = !p[key];
  savePrefs(p);
  applyPrefs(p, true);
});
// Arrow keys inside radio groups
$$('[role="radiogroup"]', a11y ?? document).forEach((group) => {
  group.addEventListener('keydown', (e) => {
    const ke = e as KeyboardEvent;
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(ke.key)) return;
    const radios = $$<HTMLButtonElement>('[role="radio"]', group);
    const i = radios.indexOf(document.activeElement as HTMLButtonElement);
    const next = radios[(i + (ke.key === 'ArrowRight' || ke.key === 'ArrowDown' ? 1 : radios.length - 1)) % radios.length];
    next.focus();
    next.click();
    e.preventDefault();
  });
});
$('[data-a11y-reset]')?.addEventListener('click', () => {
  const lang = readPrefs().lang;
  const p = { ...defaults, lang };
  savePrefs(p);
  applyPrefs(p, true);
});

// ---------------------------------------------------------- External link notice
const ext = $<HTMLDialogElement>('#ext-dialog');
let pendingUrl = '';
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-ext]');
  if (!a || !ext || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  pendingUrl = a.href;
  const host = $('[data-ext-host]', ext);
  if (host) host.textContent = new URL(a.href).hostname;
  openDialog(ext, a);
});
$('[data-ext-continue]', ext ?? document)?.addEventListener('click', () => {
  if (pendingUrl) window.open(pendingUrl, '_blank', 'noopener,noreferrer');
  ext?.close();
});

// ------------------------------------------------------------- Cookie consent
export interface Consent { analytics: boolean; social: boolean; ts: string }
const CKEY = 'mota-consent';
function readConsent(): Consent | null {
  try { const raw = localStorage.getItem(CKEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function saveConsent(c: Omit<Consent, 'ts'>) {
  const full = { ...c, ts: new Date().toISOString() };
  try { localStorage.setItem(CKEY, JSON.stringify(full)); } catch { /* storage unavailable */ }
  document.dispatchEvent(new CustomEvent('consent:change', { detail: full }));
}
const bar = $<HTMLElement>('[data-cookie-bar]');
const cookieDialog = $<HTMLDialogElement>('#cookie-dialog');
if (bar && !readConsent()) bar.hidden = false;

function syncCookieDialog() {
  const c = readConsent() ?? { analytics: false, social: false };
  $$<HTMLInputElement>('[data-consent-key]', cookieDialog ?? document).forEach((i) => { i.checked = Boolean(c[i.dataset.consentKey as 'analytics' | 'social']); });
}
$$('[data-open-cookies]').forEach((b) => b.addEventListener('click', () => { syncCookieDialog(); openDialog(cookieDialog, b); }));
$$<HTMLButtonElement>('[data-consent]').forEach((b) => {
  b.addEventListener('click', () => {
    const mode = b.dataset.consent;
    if (mode === 'accept') saveConsent({ analytics: true, social: true });
    else if (mode === 'reject') saveConsent({ analytics: false, social: false });
    else {
      const val = (k: string) => Boolean($<HTMLInputElement>(`[data-consent-key="${k}"]`, cookieDialog ?? document)?.checked);
      saveConsent({ analytics: val('analytics'), social: val('social') });
    }
    if (bar) bar.hidden = true;
    if (cookieDialog?.open) cookieDialog.close();
    toast(document.documentElement.lang === 'hi' ? 'आपकी प्राथमिकताएं सहेजी गईं' : 'Your preferences have been saved');
  });
});
// Expose for other scripts (social embeds wait for consent).
(window as unknown as { motaConsent: () => Consent | null }).motaConsent = readConsent;

// ---------------------------------------------------------------- Back to top
const toTop = $<HTMLAnchorElement>('[data-to-top]');
if (toTop) {
  const onScroll = () => toTop.classList.toggle('is-visible', window.scrollY > 600);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0 });
    $<HTMLElement>('.skip-link')?.focus();
  });
}

// ------------------------------------------------------------------- Toast
const toastEl = $<HTMLElement>('[data-toast]');
let toastTimer: number | undefined;
export function toast(msg: string) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 2800);
}
document.addEventListener('toast', (e) => toast((e as CustomEvent<string>).detail));
