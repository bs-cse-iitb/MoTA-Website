// Visitor counter in the footer. Shown only when the endpoint answers with {"count": n}.
const el = document.querySelector<HTMLElement>('[data-visitor-count]');
const endpoint = el?.dataset.endpoint;
if (el && endpoint) {
  fetch(endpoint, { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { count?: number } | null) => {
      if (!d || typeof d.count !== 'number') return;
      const out = el.querySelector('[data-visitor-value]');
      if (out) out.textContent = d.count.toLocaleString(document.documentElement.lang === 'hi' ? 'hi-IN' : 'en-IN');
      el.hidden = false;
    })
    .catch(() => { /* counter unavailable: stay hidden */ });
}

// Module scope: keeps this file's names from clashing with the other kit scripts.
export {};
