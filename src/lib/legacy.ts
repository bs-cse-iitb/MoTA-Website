// Access layer for content harvested from the legacy tribal.gov.in pages
// (see scripts/harvest/harvest.py). It merges probed file sizes, removes links
// confirmed broken (HTTP 404) and normalises headings, so pages only ever
// render working links. Broken links are listed in docs/Evidence/broken-links-report.csv.

import pages from '../data/generated/legacy-pages.json';
import linkMeta from '../data/generated/link-meta.json';
import { DEFUNCT_HOSTS, secureUrl } from './links';

export interface DocLink {
  title: string;
  url: string;
  kind: 'internal' | 'document' | 'external' | 'legacy';
  format?: string;
  size?: string;
  /** Heading of the legacy section the link came from. */
  group?: string;
  /** Legacy page key the link came from. */
  source?: string;
}

export interface LegacySection {
  heading: string;
  text: string[];
  links: DocLink[];
}

interface Meta { status: number; ok: boolean; size?: string; type?: string }
const meta = linkMeta as Record<string, Meta>;
const legacy = pages as Record<string, { source: string; title: string; intro: string[]; sections: LegacySection[] }>;

/**
 * True when a file on the Ministry's own server was probed and is missing (404,
 * or an HTML error page served for a PDF). External sites are never treated as
 * broken here: many government sites answer automated checks with 401/403/404
 * while working normally in a browser.
 */
export function isBroken(url: string): boolean {
  const m = meta[url];
  if (!m || !/^https?:\/\/(www\.)?tribal\.(gov|nic)\.in\//i.test(url)) return false;
  return !m.ok && (m.status === 404 || m.status === 410 || (m.status === 200 && !m.ok));
}

const HEADING_FIXES: [RegExp, string][] = [
  [/Grievences/gi, 'Grievances'],
  [/Guidlines/gi, 'Guidelines'],
  [/Achievments/gi, 'Achievements'],
  [/Resettelement/gi, 'Resettlement'],
  [/Provison/gi, 'Proviso'],
  [/\s*:\s*$/, ''],
];

export function cleanHeading(h: string): string {
  let out = h.trim();
  for (const [re, rep] of HEADING_FIXES) out = out.replace(re, rep);
  // Title-case headings that the legacy site wrote in capitals (DBIM 4.1.1).
  if (out === out.toUpperCase() && /[A-Z]{4,}/.test(out)) {
    out = out.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\bSt\b/g, 'ST').replace(/\bOf\b/g, 'of').replace(/\bFor\b/g, 'for');
  }
  return out;
}

function cleanTitle(t: string): string {
  return t.replace(/^[•·\-\s]+/, '').replace(/[\u200b"]+$/g, '').replace(/[\u200b]/g, '').replace(/\s+/g, ' ').trim();
}

function enrich(link: DocLink, group: string, source: string): DocLink {
  const m = meta[link.url];
  const size = link.size || (m && m.ok ? m.size : undefined) || undefined;
  let format = link.format;
  if (!format && m?.type === 'application/pdf') format = 'PDF';
  return { ...link, title: cleanTitle(link.title), size, format, group, source };
}

/** Sections of a legacy page with working links only. */
export function legacySections(
  key: string,
  opts: { from?: RegExp; to?: RegExp; only?: RegExp; skip?: RegExp; withText?: boolean } = {},
): LegacySection[] {
  const page = legacy[key];
  if (!page) return [];
  let secs = page.sections;
  if (opts.from) {
    const i = secs.findIndex((s) => opts.from!.test(s.heading));
    if (i >= 0) secs = secs.slice(i);
  }
  if (opts.to) {
    const j = secs.findIndex((s, idx) => idx > 0 && opts.to!.test(s.heading));
    if (j > 0) secs = secs.slice(0, j);
  }
  const out: LegacySection[] = [];
  for (const s of secs) {
    const heading = cleanHeading(s.heading);
    if (opts.only && !opts.only.test(heading)) continue;
    if (opts.skip && opts.skip.test(heading)) continue;
    const links = s.links
      .filter((l) => l.kind !== 'internal' || !/^\/(ministry\/our-divisions|offerings\/initiatives)\/?$/.test(l.url))
      .filter((l) => !isBroken(l.url))
      .filter((l) => { try { return !DEFUNCT_HOSTS.test(new URL(l.url, 'https://tribal.gov.in').hostname); } catch { return true; } })
      .map((l) => ({ ...l, url: secureUrl(l.url) }))
      // Bare-URL titles ("http://forestrights.nic.in/") are website links already shown as portals.
      .filter((l) => !/^https?:\/\/\S+$/.test(l.title.trim()))
      .map((l) => enrich(l as DocLink, heading, key));
    if (!links.length && !(opts.withText && s.text.length)) continue;
    // Merge consecutive duplicate headings.
    const prev = out[out.length - 1];
    if (prev && prev.heading === heading) {
      prev.links.push(...links);
      continue;
    }
    out.push({ heading, text: opts.withText ? s.text : [], links });
  }
  return out;
}

export function legacyLinks(key: string, opts: Parameters<typeof legacySections>[1] = {}): DocLink[] {
  return legacySections(key, opts).flatMap((s) => s.links);
}

export function legacyText(key: string, heading: RegExp): string[] {
  const s = legacy[key]?.sections.find((sec) => heading.test(sec.heading));
  return s?.text ?? [];
}

// ---------------------------------------------------------------------------
// Documents section (DBIM A.5.3): legacy links grouped into document types.
// ---------------------------------------------------------------------------

export type DocCategory =
  | 'reports' | 'acts-and-policies' | 'guidelines' | 'orders-and-notices' | 'gazette-notifications'
  | 'minutes-of-meetings' | 'publications' | 'press-releases';

const CATEGORY_RULES: [DocCategory, RegExp][] = [
  ['minutes-of-meetings', /minutes|pac minutes|meeting/i],
  ['gazette-notifications', /scheduling|scheduled areas|5th schedule|notifications for declaration/i],
  ['acts-and-policies', /constitutional provisions|fra literature|act|rules|policy|r&r|executive directions|resettlement/i],
  ['guidelines', /guideline|sop|formats?|faq|instruction manual|how to apply/i],
  ['orders-and-notices', /circular|orders?|notification|letters?|notice|icc|internal complaints/i],
  ['press-releases', /press release|pib/i],
  ['publications', /news-?letter|publication|stories of change|resource and publications|alekh/i],
  ['reports', /report|annual|statistic|profile|demand of grants|outcome|monitoring|summary|data|study|studies/i],
];

export function categoriseHeading(heading: string): DocCategory | undefined {
  for (const [cat, re] of CATEGORY_RULES) if (re.test(heading)) return cat;
  return undefined;
}

const DOC_SOURCES = [
  'scholarship', 'tri-research-media', 'tribal-health', 'emrs', 'livelihood', 'pm-janman', 'da-jgua', 'grants', 'ngo',
  'forest-rights-act', 'stc-monitoring', 'constitutional-legal-matters', 'parliament-coordination', 'establishment',
  'statistics', 'finance', 'ncst', 'nstfdc', 'knowledge-hub', 'review-meeting',
  'initiative:goal', 'initiative:ice-stupa', 'initiative:model-village', 'initiative:swasthya-portal', 'initiative:telemedicine',
];

export const SOURCE_LABEL: Record<string, string> = {
  scholarship: 'Scholarship', 'tri-research-media': 'TRI, Research & Media', 'tribal-health': 'Tribal Health', emrs: 'EMRS',
  livelihood: 'Livelihood', 'pm-janman': 'PM-JANMAN', 'da-jgua': 'DAJGUA', grants: 'Grants', ngo: 'NGO',
  'forest-rights-act': 'Forest Rights Act', 'stc-monitoring': 'STC Monitoring', 'constitutional-legal-matters': 'Constitutional & Legal Matters',
  'parliament-coordination': 'Parliament & Coordination', establishment: 'Establishment', statistics: 'Statistics', finance: 'Finance',
  ncst: 'NCST', nstfdc: 'NSTFDC', 'knowledge-hub': 'Knowledge Hub', 'review-meeting': 'State Review Meeting',
  'initiative:goal': 'GOAL', 'initiative:ice-stupa': 'Ice Stupa', 'initiative:model-village': 'Model Village',
  'initiative:swasthya-portal': 'Swasthya', 'initiative:telemedicine': 'Telemedicine',
};

let cachedDocs: Map<DocCategory, DocLink[]> | undefined;

export function documentsByCategory(): Map<DocCategory, DocLink[]> {
  if (cachedDocs) return cachedDocs;
  const map = new Map<DocCategory, DocLink[]>();
  const seen = new Set<string>();
  for (const key of DOC_SOURCES) {
    for (const s of legacySections(key)) {
      const cat = categoriseHeading(s.heading);
      if (!cat) continue;
      for (const l of s.links) {
        if (l.kind !== 'document' && !(cat === 'press-releases' && l.kind === 'external')) continue;
        if (seen.has(l.url)) continue;
        seen.add(l.url);
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat)!.push(l);
      }
    }
  }
  cachedDocs = map;
  return map;
}

/** Most recent-looking documents, judged by dates/years in title or file name. */
export function recentDocuments(limit = 6): DocLink[] {
  const all = [...documentsByCategory().values()].flat();
  const score = (l: DocLink) => {
    const s = `${l.title} ${decodeURIComponent(l.url)}`;
    const full = s.match(/(\d{2})[.\-/]?(\d{2})[.\-/]?(20\d{2})/);
    if (full) return Number(full[3]) * 10000 + Number(full[2]) * 100 + Number(full[1]);
    const yr = [...s.matchAll(/20(1\d|2\d)/g)].map((m) => Number(`20${m[1]}`));
    return yr.length ? Math.max(...yr) * 10000 : 0;
  };
  return all
    .map((l) => ({ l, s: score(l) }))
    .filter((x) => x.s > 0 && x.s < 20270000)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.l);
}
