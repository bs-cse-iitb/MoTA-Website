// Site search with Pagefind (static index generated after `astro build`).
// DBIM 9: covers all pages, filters by content type and audience, handles empty
// queries with suggestions, and keeps the query in the URL so results can be shared.

type PF = {
  options: (o: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  debouncedSearch: (q: string, o?: Record<string, unknown>, ms?: number) => Promise<null | {
    results: { id: string; data: () => Promise<{ url: string; excerpt: string; meta: { title?: string }; filters: Record<string, string[]> }> }[];
    filters: Record<string, Record<string, number>>;
  }>;
  filters: () => Promise<Record<string, Record<string, number>>>;
};

const form = document.querySelector<HTMLFormElement>('[data-search-form]');
const input = form?.querySelector<HTMLInputElement>('input[name="q"]');
const list = document.querySelector<HTMLOListElement>('[data-search-results]');
const status = document.querySelector<HTMLElement>('[data-search-status]');
const filterBox = document.querySelector<HTMLElement>('[data-search-filters]');
const hi = document.documentElement.lang === 'hi';
// Folder the site is served from: empty on the website, set as data-base only on copies
// served from a sub-folder (the GitHub Pages preview, scripts/build-pages.mjs).
const BASE = document.documentElement.dataset.base ?? '';
const L = (en: string, h: string) => (hi ? h : en);
const active: Record<string, Set<string>> = { type: new Set(), audience: new Set() };
const AUDIENCE: Record<string, string> = { student: 'Students', citizen: 'Tribal citizens', researcher: 'Researchers', ngo: 'Voluntary organisations', state: 'State Governments', entrepreneur: 'Entrepreneurs', media: 'Media' };

let pagefind: PF | null = null;
async function load(): Promise<PF | null> {
  if (pagefind) return pagefind;
  try {
    const url = `${BASE}/pagefind/pagefind.js`;
    pagefind = (await import(/* @vite-ignore */ url)) as PF;
    await pagefind.options({ excerptLength: 28, ...(BASE ? { baseUrl: `${BASE}/` } : {}) });
    await pagefind.init();
    return pagefind;
  } catch {
    if (status) status.textContent = L('Search index not found. Run "npm run build" to generate it.', 'खोज सूचकांक नहीं मिला। इसे बनाने के लिए "npm run build" चलाएं।');
    return null;
  }
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function renderFilters(counts: Record<string, Record<string, number>>) {
  if (!filterBox) return;
  filterBox.innerHTML = '';
  for (const key of ['type', 'audience'] as const) {
    const entries = Object.entries(counts[key] ?? {}).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    if (!entries.length) continue;
    const label = document.createElement('span');
    label.className = 'search-filters__label';
    label.textContent = key === 'type' ? L('Type:', 'प्रकार:') : L('For:', 'किसके लिए:');
    filterBox.append(label);
    for (const [value, n] of entries.slice(0, 10)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.setAttribute('aria-pressed', String(active[key].has(value)));
      b.textContent = `${key === 'audience' ? AUDIENCE[value] ?? value : value} (${n})`;
      b.addEventListener('click', () => {
        if (active[key].has(value)) active[key].delete(value); else active[key].add(value);
        run();
      });
      filterBox.append(b);
    }
  }
}

function suggestions(): string {
  const items: [string, string][] = [
    [L('Scholarships', 'छात्रवृत्ति'), '/offerings/schemes/?category=education'],
    ['PM-JANMAN', '/offerings/schemes/pm-janman/'],
    [L('Forest Rights Act', 'वन अधिकार अधिनियम'), '/ministry/our-divisions/forest-rights-act/'],
    ['EMRS', '/offerings/schemes/emrs/'],
    [L('Guidelines', 'दिशानिर्देश'), '/documents/guidelines/'],
    [L('Directory', 'निर्देशिका'), '/connect/directory/'],
  ];
  const prefix = BASE + (hi ? '/hi' : '');
  return `<li class="result"><p class="result__excerpt">${esc(L('Popular searches:', 'लोकप्रिय खोजें:'))}</p><ul class="chips" role="list">${items.map(([t, u]) => `<li><a class="chip" href="${prefix}${u}">${esc(t)}</a></li>`).join('')}</ul></li>`;
}

async function run() {
  if (!input || !list || !status) return;
  const q = input.value.trim();
  const url = new URL(location.href);
  if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
  history.replaceState(null, '', url);
  const pf = await load();
  if (!pf) return;
  if (!q) {
    status.textContent = '';
    renderFilters({});
    list.innerHTML = suggestions();
    return;
  }
  const filters: Record<string, { any: string[] }> = {};
  for (const k of Object.keys(active)) if (active[k].size) filters[k] = { any: [...active[k]] };
  const search = await pf.debouncedSearch(q, { filters }, 200);
  if (!search) return;
  renderFilters(search.filters);
  const n = search.results.length;
  status.textContent = hi ? `"${q}" के लिए ${n} परिणाम` : `${n} result${n === 1 ? '' : 's'} for “${q}”`;
  if (!n) {
    list.innerHTML = `<li class="result"><p>${esc(L('No pages matched. Check the spelling or try fewer or different words.', 'कोई पृष्ठ मेल नहीं खाया। वर्तनी जांचें या कम या अलग शब्द आज़माएं।'))}</p></li>${suggestions()}`;
    return;
  }
  const data = await Promise.all(search.results.slice(0, 40).map((r) => r.data()));
  list.innerHTML = data
    .map((d) => {
      const type = d.filters?.type?.[0];
      return `<li class="result">
        <h2 class="result__title"><a href="${esc(d.url)}">${esc(d.meta.title ?? d.url)}</a></h2>
        <p class="result__url">${type ? `<span class="badge">${esc(type)}</span> ` : ''}${esc(location.origin + d.url)}</p>
        <p class="result__excerpt">${d.excerpt}</p>
      </li>`;
    })
    .join('');
}

if (form && input) {
  input.value = new URLSearchParams(location.search).get('q') ?? '';
  form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
  input.addEventListener('input', () => run());
  run();
}

// Module scope: keeps this file's names from clashing with the other kit scripts.
export {};
