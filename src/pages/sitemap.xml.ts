// XML sitemap for search engines (both languages, with hreflang alternates).
import type { APIRoute } from 'astro';
import { allPages } from '../lib/routes';
import { site } from '../data/site';

export const GET: APIRoute = () => {
  const paths = ['/', ...allPages().filter((p) => p.kind !== 'search').map((p) => p.path)];
  const today = site.lastUpdated.toISOString().slice(0, 10);
  const url = (p: string, lang: 'en' | 'hi') => new URL(lang === 'hi' ? (p === '/' ? '/hi/' : `/hi${p}`) : p, site.url).href;
  const body = paths
    .flatMap((p) => (['en', 'hi'] as const).map((lang) => `  <url>
    <loc>${url(p, lang)}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${url(p, 'en')}"/>
    <xhtml:link rel="alternate" hreflang="hi" href="${url(p, 'hi')}"/>
  </url>`))
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`, { headers: { 'Content-Type': 'application/xml' } });
};
