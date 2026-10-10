// Accessible carousel (WAI-ARIA APG pattern): pause/play, prev/next, dots,
// pauses on hover and focus, no autoplay for reduced motion.
const root = document.querySelector<HTMLElement>('[data-carousel]');
if (root) init(root);

function init(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>('[data-carousel-viewport]')!;
  let slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
  let dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]'));
  const toggle = root.querySelector<HTMLButtonElement>('[data-carousel-toggle]')!;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-nomotion');
  let index = 0;
  let playing = !reduce;
  let timer: number | undefined;
  let hoverPause = false;

  // Drop the CCPS slide if MyGov's banner cannot be loaded (offline, blocked).
  const ccpsImg = root.querySelector<HTMLImageElement>('[data-ccps-img]');
  const dropCcps = () => {
    const slide = root.querySelector<HTMLElement>('[data-ccps]');
    if (!slide) return;
    const i = slides.indexOf(slide);
    slide.remove();
    dots[i]?.remove();
    slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
    dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]'));
    dots.forEach((d, k) => { d.dataset.carouselDot = String(k); d.setAttribute('aria-label', d.getAttribute('aria-label')!.replace(/\d+$/, String(k + 1))); });
    slides.forEach((s, k) => s.setAttribute('aria-label', `${k + 1} / ${slides.length}`));
    index = 0;
    show(0);
  };
  if (ccpsImg) {
    if (ccpsImg.complete && ccpsImg.naturalWidth === 0) dropCcps();
    ccpsImg.addEventListener('error', dropCcps);
  }

  function show(i: number) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const active = k === index;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', String(!active));
      s.querySelectorAll<HTMLElement>('a, button').forEach((el) => (active ? el.removeAttribute('tabindex') : el.setAttribute('tabindex', '-1')));
      if (active) s.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
    });
    dots.forEach((d, k) => (k === index ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    // Preload the next slide's image.
    slides[(index + 1) % slides.length]?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
  }
  function schedule() {
    window.clearTimeout(timer);
    if (playing && !hoverPause) timer = window.setTimeout(() => { show(index + 1); schedule(); }, 6500);
  }
  function setPlaying(p: boolean) {
    playing = p;
    root.classList.toggle('is-paused', !p);
    toggle.setAttribute('aria-label', p ? toggle.dataset.labelPause! : toggle.dataset.labelPlay!);
    viewport.setAttribute('aria-live', p ? 'off' : 'polite');
    schedule();
  }

  toggle.addEventListener('click', () => setPlaying(!playing));
  root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => { show(index - 1); schedule(); });
  root.querySelector('[data-carousel-next]')?.addEventListener('click', () => { show(index + 1); schedule(); });
  root.addEventListener('click', (e) => {
    const dot = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-carousel-dot]');
    if (dot) { show(Number(dot.dataset.carouselDot)); schedule(); }
  });
  root.addEventListener('mouseenter', () => { hoverPause = true; schedule(); });
  root.addEventListener('mouseleave', () => { hoverPause = false; schedule(); });
  root.addEventListener('focusin', () => { hoverPause = true; schedule(); });
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget as Node)) { hoverPause = false; schedule(); } });
  document.addEventListener('visibilitychange', () => { hoverPause = document.hidden; schedule(); });

  // Swipe on touch screens
  let x0: number | null = null;
  viewport.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { show(index + (dx < 0 ? 1 : -1)); schedule(); }
    x0 = null;
  });

  show(0);
  setPlaying(playing);
}

// Module scope: keeps this file's names from clashing with the other kit scripts.
export {};
