// Social feeds load only with consent for social media cookies (DBIM 7.6).
type Consent = { analytics: boolean; social: boolean } | null;
const getConsent = (): Consent => {
  try { return JSON.parse(localStorage.getItem('mota-consent') || 'null'); } catch { return null; }
};
function saveSocialConsent() {
  const c = getConsent() ?? { analytics: false, social: false };
  const next = { ...c, social: true, ts: new Date().toISOString() };
  try { localStorage.setItem('mota-consent', JSON.stringify(next)); } catch { /* ignore */ }
  document.querySelector<HTMLElement>('[data-cookie-bar]')?.setAttribute('hidden', '');
  document.dispatchEvent(new CustomEvent('consent:change', { detail: next }));
}

function loadFeed(box: HTMLElement) {
  if (box.dataset.loaded) return;
  box.dataset.loaded = '1';
  const kind = box.dataset.socialFeed;
  const url = box.dataset.url || '';
  box.innerHTML = '';
  if (kind === 'facebook') {
    const f = document.createElement('iframe');
    f.src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(url)}&tabs=timeline&width=340&height=420&small_header=true&adapt_container_width=true&hide_cover=false`;
    f.title = 'Facebook posts of the Ministry of Tribal Affairs';
    f.loading = 'lazy';
    f.width = '100%';
    f.height = '420';
    f.setAttribute('allow', 'encrypted-media');
    box.append(f);
  } else if (kind === 'x') {
    const a = document.createElement('a');
    a.className = 'twitter-timeline';
    a.dataset.height = '420';
    a.href = 'https://twitter.com/TribalAffairsIn';
    a.textContent = 'Posts by @TribalAffairsIn';
    box.append(a);
    const s = document.createElement('script');
    s.src = 'https://platform.twitter.com/widgets.js';
    s.async = true;
    box.append(s);
  }
}

const boxes = Array.from(document.querySelectorAll<HTMLElement>('[data-social-feed]'));
const loadAll = () => boxes.forEach(loadFeed);
if (getConsent()?.social) loadAll();
boxes.forEach((b) => b.querySelector('[data-load-feed]')?.addEventListener('click', () => { saveSocialConsent(); loadAll(); }));
document.addEventListener('consent:change', (e) => { if ((e as CustomEvent).detail?.social) loadAll(); });

// Module scope: keeps this file's names from clashing with the other kit scripts.
export {};
