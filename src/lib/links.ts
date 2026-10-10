import type { Locale } from '../data/site';
import { localePath } from '../data/i18n';

const OWN_HOSTS = /^(www\.)?tribal\.(gov|nic)\.in$/i;

// DBIM A.5.6 (x): external links must be secure. These hosts serve HTTPS, so
// legacy http:// links to them are upgraded (checked 5 Oct 2026).
const HTTPS_HOSTS = /^(www\.)?(nests\.tribal\.gov\.in|nstfdc\.tribal\.gov\.in|forestrights\.nic\.in|ngo\.tribal\.gov\.in|saanjhi\.gov\.in|megsocialwelfare\.gov\.in|tribal\.(gov|nic)\.in)$/i;

/** Hosts that no longer exist; links to them are removed from legacy lists. */
export const DEFUNCT_HOSTS = /^(www\.)?(pqals\.nic\.in|loksabhaph\.nic\.in|geet-undp\.com)$/i;

export function secureUrl(url: string): string {
  const m = url.match(/^http:\/\/([^/]+)(.*)$/i);
  return m && HTTPS_HOSTS.test(m[1]) ? `https://${m[1]}${m[2]}` : url;
}

export interface LinkInfo {
  href: string;
  external: boolean;   // another website: warn + new tab (GIGW hyperlink policy)
  document: boolean;   // downloadable file: new tab + format/size label
  newTab: boolean;
  format?: string;
}

/** Classify a link and localise internal paths for the Hindi site. */
export function linkInfo(rawUrl: string, locale: Locale = 'en'): LinkInfo {
  const url = secureUrl(rawUrl);
  if (url.startsWith('/')) {
    return { href: localePath(url, locale), external: false, document: false, newTab: false };
  }
  if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return { href: url, external: false, document: false, newTab: false };
  }
  let host = '';
  let path = '';
  try {
    const u = new URL(url);
    host = u.hostname;
    path = u.pathname;
  } catch {
    return { href: url, external: true, document: false, newTab: true };
  }
  const m = path.toLowerCase().match(/\.(pdf|docx?|xlsx?|pptx?|zip|rar|jpe?g|png|mp4)$/);
  const document = Boolean(m);
  const format = m ? m[1].replace('jpeg', 'jpg').toUpperCase() : undefined;
  // Files on the Ministry's own server are documents, not external sites.
  const external = !OWN_HOSTS.test(host);
  return { href: url, external, document, newTab: true, format };
}

export function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
