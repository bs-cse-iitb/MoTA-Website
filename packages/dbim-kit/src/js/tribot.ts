// Chat assistant ("Jago", the Ministry's TriBot service). Markup: TriBot.astro in the site,
// templates/<lang>/tribot.html in the kit.
//
// Request (POST data-endpoint, a same-origin path that IIS forwards to the service):
//   { query, messages: [{ role, content }], language: 'eng' | 'hin' | 'gnd' | …, top_k, session_id? }
// Response (as returned by tribot.tribal.gov.in/api/v1/chat in Oct 2026):
//   { response_type: 'plain_text' | 'bullet_list' | 'table' | …, answer, items[], table_headers[],
//     table_rows[], actions[], sources[{ filename, page, section }], session_id, lang }
//
// Answers are written into the page as text nodes only, never as HTML, so nothing in an
// answer can run as code. If the service fails, the assistant answers from the site search.
// On a page without the site's search index (the standalone chat_popup/), data-search-url
// names the website's search page: the fallback then links there and searches nothing.

type Turn = { role: 'user' | 'assistant'; content: string };
type Item = string | { title?: string; text?: string; content?: string; url?: string };
type Action = string | { label?: string; title?: string; text?: string; url?: string; link?: string; query?: string };
type Source = string | { filename?: string; title?: string; document?: string; source?: string; url?: string; page?: number | string };
interface Answer {
  response_type?: string;
  answer?: string;
  items?: Item[];
  table_headers?: string[];
  table_rows?: unknown[][];
  actions?: Action[];
  sources?: Source[];
  session_id?: string;
  lang?: string;
}
/** One message as kept for the browser session, so it can be shown again on the next page. */
type Saved = { role: 'user'; text: string } | { role: 'bot'; answer: Answer } | { role: 'fallback'; query: string; pages: Link[] };
type Link = { title: string; url: string };
type PF = {
  options: (o: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  search: (q: string) => Promise<{ results: { data: () => Promise<{ url: string; meta: { title?: string } }> }[] }>;
};

const CHAT_KEY = 'mota-assistant-chat'; // sessionStorage: this tab only, cleared when it closes
const LANG_KEY = 'mota-assistant-lang'; // localStorage: the answer language the visitor chose
const MAX_TURNS = 10;
// Folder the site is served from: empty on the website, set as data-base only on copies
// served from a sub-folder (the GitHub Pages preview, scripts/build-pages.mjs).
const BASE = document.documentElement.dataset.base ?? '';

const root = document.querySelector<HTMLElement>('[data-tribot]');
if (root) init(root);

function init(root: HTMLElement) {
  const d = root.dataset;
  const $ = <T extends Element>(s: string) => root.querySelector<T>(s)!;
  const toggle = $<HTMLButtonElement>('[data-tribot-toggle]');
  const panel = $<HTMLElement>('[data-tribot-panel]');
  const log = $<HTMLElement>('[data-tribot-log]');
  const statusText = $<HTMLElement>('[data-tribot-status-text]');
  const form = $<HTMLFormElement>('[data-tribot-form]');
  const input = $<HTMLInputElement>('[data-tribot-input]');
  const langSel = $<HTMLSelectElement>('[data-tribot-lang]');
  const expand = $<HTMLButtonElement>('[data-tribot-expand]');
  const suggest = $<HTMLElement>('[data-tribot-suggest]');
  const welcome = log.innerHTML; // static markup from the build
  const pageLang = document.documentElement.lang || 'en';
  let history: Turn[] = [];
  let saved: Saved[] = [];
  let sessionId: string | undefined;
  let busy = false;

  // ------------------------------------------------------------ open, close, size
  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle('is-open', open);
    if (open) input.focus();
    else toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  $<HTMLButtonElement>('[data-tribot-close]').addEventListener('click', () => setOpen(false));
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } });
  expand.addEventListener('click', () => {
    const on = expand.getAttribute('aria-pressed') !== 'true';
    expand.setAttribute('aria-pressed', String(on));
    expand.setAttribute('aria-label', on ? d.lShrink! : d.lExpand!);
    expand.title = on ? d.lShrink! : d.lExpand!;
    root.classList.toggle('is-wide', on);
  });

  // ------------------------------------------------------------ answer language
  try {
    const chosen = localStorage.getItem(LANG_KEY);
    if (chosen && [...langSel.options].some((o) => o.value === chosen)) langSel.value = chosen;
  } catch { /* storage blocked: keep the page language */ }
  langSel.addEventListener('change', () => { try { localStorage.setItem(LANG_KEY, langSel.value); } catch { /* ignore */ } });
  const tagFor = (code?: string) => [...langSel.options].find((o) => o.value === code)?.dataset.tag;

  // ------------------------------------------------------------ conversation
  $<HTMLButtonElement>('[data-tribot-new]').addEventListener('click', () => {
    history = []; saved = []; sessionId = undefined;
    log.innerHTML = welcome;
    suggest.hidden = false;
    store();
    input.focus();
  });
  root.querySelectorAll<HTMLButtonElement>('[data-tribot-q]').forEach((b) => b.addEventListener('click', () => ask(b.textContent || '')));
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });

  function store() {
    try {
      if (saved.length) sessionStorage.setItem(CHAT_KEY, JSON.stringify({ sessionId, history, saved: saved.slice(-2 * MAX_TURNS) }));
      else sessionStorage.removeItem(CHAT_KEY);
    } catch { /* storage full or blocked: the conversation just is not kept */ }
  }
  function show(m: Saved) {
    if (m.role === 'user') addUser(m.text);
    else if (m.role === 'bot') addAnswer(m.answer);
    else addFallback(m.query, m.pages);
  }

  async function ask(raw: string) {
    const query = raw.trim().slice(0, 500);
    if (!query || busy) return;
    busy = true;
    input.value = '';
    suggest.hidden = true;
    addUser(query);
    saved.push({ role: 'user', text: query });
    statusText.textContent = d.lTyping!;
    root.classList.add('is-busy');
    try {
      const answer = await callService(query);
      addAnswer(answer);
      saved.push({ role: 'bot', answer });
      history.push({ role: 'user', content: query }, { role: 'assistant', content: plainText(answer) });
      history = history.slice(-2 * MAX_TURNS);
    } catch {
      const pages = await siteSearch(query);
      addFallback(query, pages);
      saved.push({ role: 'fallback', query, pages });
    } finally {
      store();
      statusText.textContent = '';
      root.classList.remove('is-busy');
      busy = false;
      input.focus();
    }
  }

  async function callService(query: string): Promise<Answer> {
    if (!d.endpoint) throw new Error('no endpoint');
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), Number(d.timeout || 60) * 1000);
    try {
      const r = await fetch(d.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          query,
          messages: [...history, { role: 'user', content: query }],
          language: langSel.value,
          top_k: 10,
          ...(sessionId ? { session_id: sessionId, conversation_id: sessionId } : {}),
        }),
        signal: ctrl.signal,
      });
      if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as Answer;
      if (!data.answer && !data.items?.length && !data.table_rows?.length) throw new Error('empty answer');
      if (typeof data.session_id === 'string') sessionId = data.session_id;
      return data;
    } finally {
      window.clearTimeout(timer);
    }
  }

  // ------------------------------------------------------------ rendering (text nodes only)
  function bubble(role: 'user' | 'bot') {
    const el = document.createElement('div');
    el.className = `tribot__msg tribot__msg--${role}`;
    log.append(el);
    return el;
  }
  const scroll = (el: HTMLElement) => el.scrollIntoView({ block: 'nearest' });

  function addUser(text: string) {
    const el = bubble('user');
    const who = document.createElement('span');
    who.className = 'visually-hidden';
    who.textContent = `${d.lYou}: `;
    el.append(who);
    textBlocks(el, text);
    scroll(el);
  }

  function addAnswer(a: Answer) {
    const el = bubble('bot');
    // Mark the answer's language so screen readers switch voice (WCAG 3.1.2).
    const tag = tagFor(a.lang);
    if (tag && tag !== pageLang) el.lang = tag;
    if (a.answer) textBlocks(el, String(a.answer));
    const items = (a.items ?? []).map(itemOf).filter((x) => x.text);
    if (items.length) {
      const ul = document.createElement('ul');
      for (const it of items) {
        const li = document.createElement('li');
        if (it.url) li.append(link(it.text, it.url)); else inline(li, it.text);
        ul.append(li);
      }
      el.append(ul);
    }
    if (a.table_rows?.length) el.append(table(a.table_headers ?? [], a.table_rows));
    const actions = (a.actions ?? []).map(actionOf).filter((x) => x.label);
    if (actions.length) {
      const ul = document.createElement('ul');
      ul.className = 'tribot__actions';
      ul.setAttribute('role', 'list');
      for (const act of actions) {
        const li = document.createElement('li');
        if (act.url) li.append(link(act.label, act.url));
        else {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'chip';
          b.textContent = act.label;
          b.addEventListener('click', () => ask(act.query || act.label));
          li.append(b);
        }
        ul.append(li);
      }
      el.append(ul);
    }
    const sources = (a.sources ?? []).map(sourceOf).filter((s): s is { title: string; url?: string } => Boolean(s));
    if (sources.length) {
      const h = document.createElement('p');
      h.className = 'tribot__src-label';
      h.textContent = d.lSources!;
      const ul = document.createElement('ul');
      ul.className = 'tribot__src';
      for (const s of sources) {
        const li = document.createElement('li');
        if (s.url) li.append(link(s.title, s.url)); else li.textContent = s.title;
        ul.append(li);
      }
      el.append(h, ul);
    }
    if (navigator.clipboard) el.append(copyButton(plainText(a)));
    scroll(el);
  }

  function addFallback(query: string, pages: Link[]) {
    const el = bubble('bot');
    textBlocks(el, pages.length ? d.lFallback! : d.lNone!);
    if (pages.length) {
      const ul = document.createElement('ul');
      ul.className = 'tribot__src';
      for (const p of pages) { const li = document.createElement('li'); li.append(link(p.title, p.url)); ul.append(li); }
      el.append(ul);
    }
    const more = document.createElement('p');
    const search = d.searchUrl || `${BASE}${pageLang === 'hi' ? '/hi' : ''}/search/`;
    more.append(link(d.lSearch!, `${search}?q=${encodeURIComponent(query)}`));
    el.append(more);
    scroll(el);
  }

  /** Paragraphs and lists from plain text: blank lines separate paragraphs; lines starting
   *  with "-", "*", "•" or "1." become list items. */
  function textBlocks(el: HTMLElement, text: string) {
    for (const block of text.replace(/\r/g, '').split(/\n{2,}/)) {
      const lines = block.split('\n').filter((l) => l.trim());
      let list: HTMLElement | null = null;
      let para: HTMLElement | null = null;
      for (const line of lines) {
        const m = line.match(/^\s*(?:([-*•])|(\d+)[.)])\s+(.*)$/);
        if (m) {
          const kind = m[1] ? 'UL' : 'OL';
          if (!list || list.tagName !== kind) { list = document.createElement(kind.toLowerCase()); el.append(list); }
          const li = document.createElement('li');
          inline(li, m[3]);
          list.append(li);
          para = null;
        } else {
          list = null;
          if (para) para.append(document.createElement('br')); else { para = document.createElement('p'); el.append(para); }
          inline(para, line.trim());
        }
      }
    }
  }

  /** **bold** and web addresses inside a line of text. */
  function inline(el: HTMLElement, text: string) {
    const re = /\*\*(.+?)\*\*|(https?:\/\/[^\s<>"')\]]+|www\.[^\s<>"')\]]+)/g;
    let last = 0;
    for (const m of text.matchAll(re)) {
      el.append(text.slice(last, m.index));
      if (m[1]) { const b = document.createElement('strong'); b.textContent = m[1]; el.append(b); }
      else {
        const raw = m[2].replace(/[.,;:]+$/, '');
        el.append(link(raw, raw.startsWith('www.') ? `https://${raw}` : raw));
        el.append(m[2].slice(raw.length));
      }
      last = (m.index ?? 0) + m[0].length;
    }
    el.append(text.slice(last));
  }

  /** A link to a web address or a page of this site; other kinds of address become text. */
  function link(text: string, url: string): Node {
    let u: URL;
    try { u = new URL(url, location.origin); } catch { return document.createTextNode(text); }
    if (!/^https?:$/.test(u.protocol)) return document.createTextNode(text);
    const a = document.createElement('a');
    a.href = u.href;
    a.textContent = text;
    if (u.host !== location.host) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.dataset.ext = ''; // "You are leaving tribal.gov.in" notice (GIGW hyperlink policy)
    }
    return a;
  }

  function table(headers: string[], rows: unknown[][]) {
    const wrap = document.createElement('div');
    wrap.className = 'table-wrap tribot__table';
    wrap.tabIndex = 0; // scrollable region reachable by keyboard
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', headers.join(', ').slice(0, 120) || d.lTable || 'Table');
    const t = document.createElement('table');
    t.className = 'table';
    if (headers.length) {
      const tr = t.createTHead().insertRow();
      for (const h of headers) { const th = document.createElement('th'); th.scope = 'col'; th.textContent = String(h); tr.append(th); }
    }
    const tb = t.createTBody();
    for (const row of rows) {
      const cells = Array.isArray(row) ? row : Object.values(row as Record<string, unknown>);
      const tr = tb.insertRow();
      for (const c of cells) {
        const td = tr.insertCell();
        td.textContent = c == null ? '' : String(c);
        // DBIM 4.1.1: numbers right-aligned, text left-aligned.
        if (/^[₹]?\s?\d[\d,.\s%–-]*$/.test(td.textContent.trim())) td.className = 'num';
      }
    }
    wrap.append(t);
    return wrap;
  }

  const itemOf = (it: Item) => (typeof it === 'string'
    ? { text: it, url: '' }
    : { text: String(it.title || it.text || it.content || ''), url: String(it.url || '') });
  const actionOf = (a: Action) => (typeof a === 'string'
    ? { label: a, url: '', query: a }
    : { label: String(a.label || a.title || a.text || ''), url: String(a.url || a.link || ''), query: String(a.query || '') });
  function sourceOf(s: Source): { title: string; url?: string } | null {
    if (typeof s === 'string') return /^https?:\/\//.test(s) ? { title: s, url: s } : { title: s };
    const name = String(s.title || s.document || s.filename || s.source || '').trim();
    if (!name || /^unknown$/i.test(name)) return null; // the service sends "Unknown" when it has no document name
    const page = s.page ? ` (${d.lPage} ${s.page})` : '';
    return { title: name + page, url: s.url && /^(https?:\/\/|\/)/.test(s.url) ? s.url : undefined };
  }

  function plainText(a: Answer) {
    const parts = [a.answer ?? ''];
    for (const it of a.items ?? []) parts.push(`• ${itemOf(it).text}`);
    if (a.table_rows?.length) {
      parts.push((a.table_headers ?? []).join(' | '));
      for (const r of a.table_rows) parts.push((Array.isArray(r) ? r : Object.values(r as Record<string, unknown>)).join(' | '));
    }
    return parts.filter(Boolean).join('\n').replace(/\*\*(.+?)\*\*/g, '$1');
  }

  function copyButton(text: string) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tribot__copy';
    b.textContent = d.lCopy!;
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        statusText.textContent = d.lCopied!;
        window.setTimeout(() => { if (statusText.textContent === d.lCopied) statusText.textContent = ''; }, 3000);
      } catch { /* clipboard refused by the browser */ }
    });
    return b;
  }

  // ------------------------------------------------------------ site search fallback
  // Question words match every page, so search only on the words that carry meaning.
  const STOP = new Set(('what is are was the a an of for to in on and or how do does can i me my we our about please tell '
    + 'apply get which who when where why this that with from क्या है हैं कैसे करें करना के की का को में से लिए और या मुझे बताएं कौन कब कहां').split(' '));
  const keywords = (q: string) => {
    const words = q.toLowerCase().replace(/[?!.,;:()"'“”‘’।]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));
    return words.length ? words.join(' ') : q;
  };
  let pf: PF | null = null;
  async function siteSearch(query: string): Promise<Link[]> {
    if (d.searchUrl) return []; // no search index on this page
    try {
      if (!pf) {
        const url = `${BASE}/pagefind/pagefind.js`;
        pf = (await import(/* @vite-ignore */ url)) as PF;
        if (BASE) await pf.options({ baseUrl: `${BASE}/` });
        await pf.init();
      }
      const res = await pf.search(keywords(query));
      const top = await Promise.all(res.results.slice(0, 4).map((x) => x.data()));
      return top.map((x) => ({ title: x.meta.title || x.url, url: x.url }));
    } catch {
      return [];
    }
  }

  // ------------------------------------------------------------ restore
  // Show the conversation again after moving to another page of the site. Runs after all
  // the helpers above are defined.
  try {
    const prev = JSON.parse(sessionStorage.getItem(CHAT_KEY) || 'null') as { sessionId?: string; history?: Turn[]; saved?: Saved[] } | null;
    if (prev?.saved?.length) {
      sessionId = prev.sessionId;
      history = prev.history ?? [];
      saved = prev.saved;
      saved.forEach(show);
      suggest.hidden = true;
    }
  } catch { /* nothing to restore */ }

  // ------------------------------------------------------------ voice input
  // The browser's speech service turns speech into text in the question box; the visitor
  // checks it and sends it. Shown only where the browser supports it.
  type Rec = { lang: string; interimResults: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  const Speech = w.SpeechRecognition || w.webkitSpeechRecognition;
  const voice = $<HTMLButtonElement>('[data-tribot-voice]');
  if (Speech) {
    voice.hidden = false;
    $<HTMLElement>('[data-tribot-voice-note]').hidden = false;
    let rec: Rec | null = null;
    voice.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      rec = new Speech();
      rec.lang = langSel.selectedOptions[0]?.dataset.speech || (pageLang === 'hi' ? 'hi-IN' : 'en-IN');
      rec.interimResults = false;
      voice.setAttribute('aria-pressed', 'true');
      const placeholder = input.placeholder;
      input.placeholder = d.lListening!;
      statusText.textContent = d.lListening!;
      rec.onresult = (e) => { const t = e.results[0]?.[0]?.transcript; if (t) { input.value = t; input.focus(); } };
      rec.onend = rec.onerror = () => {
        voice.setAttribute('aria-pressed', 'false');
        input.placeholder = placeholder;
        if (statusText.textContent === d.lListening) statusText.textContent = '';
        rec = null;
      };
      rec.start();
    });
  }
}

// Module scope: keeps this file's names from clashing with the other kit scripts.
export {};
