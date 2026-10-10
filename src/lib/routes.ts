// Registry of every inner page. Both /[...slug] (English) and /hi/[...slug]
// (Hindi) are generated from this list, so menus, sitemap and pages can never
// drift apart: every link in src/data/nav.ts must resolve to an entry here
// (checked by scripts/check-links.mjs after each build).

import type { Bilingual } from '../data/site';
import { mainNav, policyNav, utilityNav } from '../data/nav';
import { schemes } from '../data/schemes';
import { divisions } from '../data/divisions';
import { initiatives } from '../data/initiatives';
import { organisations } from '../data/organisations';
import { policies } from '../data/policies';
import { personas } from '../data/personas';

export type PageKind =
  | 'hub' | 'about' | 'team' | 'divisions' | 'division' | 'organisations' | 'organisation' | 'performance' | 'reviews'
  | 'schemes' | 'scheme' | 'portals' | 'initiatives' | 'initiative' | 'tenders' | 'vacancies' | 'competitions'
  | 'docs' | 'sanction' | 'photos' | 'videos' | 'brochures'
  | 'contact' | 'directory' | 'rti' | 'grievance' | 'citizen' | 'parliament' | 'feedback'
  | 'policies' | 'policy' | 'whatsnew' | 'archives' | 'related' | 'help' | 'screenreader' | 'sitemap' | 'search' | 'persona';

export interface PageDef {
  path: string;
  title: Bilingual;
  lead?: Bilingual;
  kind: PageKind;
  /** Content-type label for search filters. */
  type: string;
  slug?: string;
  /** Parent path for breadcrumbs/side nav on L3 pages. */
  parent?: string;
  personas?: string[];
  docCategory?: string;
}

const L = (en: string, hi: string): Bilingual => ({ en, hi });

const KIND_BY_PATH: Record<string, { kind: PageKind; type: string; lead?: Bilingual; docCategory?: string }> = {
  '/ministry/': { kind: 'hub', type: 'Ministry' },
  '/ministry/about-us/': { kind: 'about', type: 'Ministry', lead: L('Mandate, functions and history of the Ministry of Tribal Affairs.', 'जनजातीय कार्य मंत्रालय का अधिदेश, कार्य और इतिहास।') },
  '/ministry/our-team/': { kind: 'team', type: 'Ministry', lead: L('Ministers and senior officers of the Ministry, by seniority.', 'मंत्रालय के मंत्री और वरिष्ठ अधिकारी, वरिष्ठता क्रम में।') },
  '/ministry/our-divisions/': { kind: 'divisions', type: 'Ministry', lead: L('The divisions of the Ministry and the work each one handles.', 'मंत्रालय के प्रभाग और प्रत्येक का कार्य।') },
  '/ministry/our-organisations/': { kind: 'organisations', type: 'Ministry', lead: L('Commission, corporations, societies and institutes that work with the Ministry.', 'मंत्रालय के साथ कार्यरत आयोग, निगम, संस्थाएं और संस्थान।') },
  '/ministry/our-performance/': { kind: 'performance', type: 'Ministry', lead: L('Dashboards and figures on how the Ministry’s schemes are performing.', 'मंत्रालय की योजनाओं के प्रदर्शन पर डैशबोर्ड और आंकड़े।') },
  '/offerings/': { kind: 'hub', type: 'Offerings' },
  '/offerings/schemes/': { kind: 'schemes', type: 'Scheme', lead: L('All schemes and services of the Ministry, whichever division runs them.', 'मंत्रालय की सभी योजनाएं और सेवाएं।') },
  '/offerings/portals/': { kind: 'portals', type: 'Service', lead: L('Apply, track and report online through the Ministry’s portals.', 'मंत्रालय के पोर्टलों के माध्यम से ऑनलाइन आवेदन, ट्रैक और रिपोर्ट करें।') },
  '/offerings/initiatives/': { kind: 'initiatives', type: 'Initiative', lead: L('Innovative programmes run with partners across the country.', 'देश भर में साझेदारों के साथ चल रहे अभिनव कार्यक्रम।') },
  '/offerings/tenders/': { kind: 'tenders', type: 'Tender', lead: L('Current tenders floated by the Ministry, with links to the procurement portal.', 'मंत्रालय द्वारा जारी वर्तमान निविदाएं।') },
  '/offerings/vacancies/': { kind: 'vacancies', type: 'Vacancy', lead: L('Current job openings in the Ministry and its organisations.', 'मंत्रालय और उसके संगठनों में वर्तमान रिक्तियां।') },
  '/offerings/competitions-and-awards/': { kind: 'competitions', type: 'Award', lead: L('Competitions run by the Ministry and recognition it has received.', 'मंत्रालय द्वारा आयोजित प्रतियोगिताएं और प्राप्त सम्मान।') },
  '/documents/': { kind: 'hub', type: 'Document' },
  '/documents/reports/': { kind: 'docs', type: 'Report', docCategory: 'reports', lead: L('Annual reports, statistical profiles, monitoring and study reports.', 'वार्षिक रिपोर्ट, सांख्यिकीय रूपरेखा, निगरानी और अध्ययन रिपोर्ट।') },
  '/documents/acts-and-policies/': { kind: 'docs', type: 'Act', docCategory: 'acts-and-policies', lead: L('Acts, rules, constitutional provisions and policy documents.', 'अधिनियम, नियम, संवैधानिक प्रावधान और नीति दस्तावेज़।') },
  '/documents/guidelines/': { kind: 'docs', type: 'Guideline', docCategory: 'guidelines', lead: L('Scheme guidelines, SOPs, formats, FAQs and manuals.', 'योजना दिशानिर्देश, एसओपी, प्रारूप, सामान्य प्रश्न और पुस्तिकाएं।') },
  '/documents/orders-and-notices/': { kind: 'docs', type: 'Order', docCategory: 'orders-and-notices', lead: L('Circulars, office orders, letters and notifications.', 'परिपत्र, कार्यालय आदेश, पत्र और अधिसूचनाएं।') },
  '/documents/gazette-notifications/': { kind: 'docs', type: 'Gazette', docCategory: 'gazette-notifications', lead: L('Notifications on scheduling of tribes and declaration of Scheduled Areas.', 'जनजातियों के अनुसूचीकरण और अनुसूचित क्षेत्रों की घोषणा संबंधी अधिसूचनाएं।') },
  '/documents/minutes-of-meetings/': { kind: 'docs', type: 'Minutes', docCategory: 'minutes-of-meetings', lead: L('Minutes of PAC, review and consultation meetings.', 'पीएसी, समीक्षा और परामर्श बैठकों का कार्यवृत्त।') },
  '/documents/publications/': { kind: 'docs', type: 'Publication', docCategory: 'publications', lead: L('Newsletters, books, stories of change and other publications.', 'समाचार पत्र, पुस्तकें, बदलाव की कहानियां और अन्य प्रकाशन।') },
  '/documents/press-releases/': { kind: 'docs', type: 'Press release', docCategory: 'press-releases', lead: L('Press releases of the Ministry published by the Press Information Bureau.', 'पत्र सूचना कार्यालय द्वारा प्रकाशित मंत्रालय की प्रेस विज्ञप्तियां।') },
  '/documents/sanction-orders/': { kind: 'sanction', type: 'Sanction order', lead: L('Scheme-wise sanction orders released through PFMS, by financial year.', 'पीएफएमएस के माध्यम से जारी योजना-वार स्वीकृति आदेश, वित्तीय वर्ष अनुसार।') },
  '/documents/knowledge-hub/': { kind: 'docs', type: 'Document', docCategory: 'knowledge-hub', lead: L('Key guidelines and reference documents in one place.', 'प्रमुख दिशानिर्देश और संदर्भ दस्तावेज़ एक स्थान पर।') },
  '/media/': { kind: 'hub', type: 'Media' },
  '/media/photos/': { kind: 'photos', type: 'Photo', lead: L('Photographs from the Ministry’s programmes, festivals and events.', 'मंत्रालय के कार्यक्रमों, उत्सवों और आयोजनों की तस्वीरें।') },
  '/media/videos/': { kind: 'videos', type: 'Video', lead: L('Videos of the Ministry’s programmes and campaigns.', 'मंत्रालय के कार्यक्रमों और अभियानों के वीडियो।') },
  '/media/brochures/': { kind: 'brochures', type: 'Brochure', lead: L('Brochures, booklets and newsletters to download.', 'डाउनलोड हेतु विवरणिकाएं, पुस्तिकाएं और समाचार पत्र।') },
  '/connect/': { kind: 'hub', type: 'Connect' },
  '/connect/contact-us/': { kind: 'contact', type: 'Contact', lead: L('Addresses, phone numbers and key contacts of the Ministry.', 'मंत्रालय के पते, फ़ोन नंबर और प्रमुख संपर्क।') },
  '/connect/directory/': { kind: 'directory', type: 'Contact', lead: L('Officers of the Ministry with work allocation and contact details.', 'कार्य आवंटन और संपर्क विवरण सहित मंत्रालय के अधिकारी।') },
  '/connect/rti/': { kind: 'rti', type: 'RTI', lead: L('Right to Information: how to apply, CPIOs, appellate authorities and disclosures.', 'सूचना का अधिकार: आवेदन, सीपीआईओ, अपीलीय प्राधिकारी और प्रकटीकरण।') },
  '/connect/grievance-redressal/': { kind: 'grievance', type: 'Grievance', lead: L('Lodge and track a public grievance with the Ministry.', 'मंत्रालय में लोक शिकायत दर्ज करें और ट्रैक करें।') },
  '/connect/citizen-engagement/': { kind: 'citizen', type: 'Connect', lead: L('Ways to take part, share ideas and follow the Ministry.', 'भाग लेने, विचार साझा करने और मंत्रालय को फ़ॉलो करने के तरीके।') },
  '/connect/parliament-questions/': { kind: 'parliament', type: 'Parliament', lead: L('Questions and answers in Parliament on tribal affairs.', 'जनजातीय मामलों पर संसद में प्रश्न और उत्तर।') },
  '/connect/feedback/': { kind: 'feedback', type: 'Connect', lead: L('Tell us what works and what we should improve on this website.', 'हमें बताएं कि इस वेबसाइट पर क्या अच्छा है और क्या सुधारना चाहिए।') },
  '/policies/': { kind: 'policies', type: 'Policy', lead: L('Policies that govern this website and its content.', 'इस वेबसाइट और इसकी सामग्री को नियंत्रित करने वाली नीतियां।') },
  '/whats-new/': { kind: 'whatsnew', type: 'Update', lead: L('Latest notices, documents and updates from the Ministry.', 'मंत्रालय की नवीनतम सूचनाएं, दस्तावेज़ और अपडेट।') },
  '/archives/': { kind: 'archives', type: 'Archive', lead: L('Announcements, tenders and notices whose date has passed.', 'वे घोषणाएं, निविदाएं और सूचनाएं जिनकी तिथि बीत चुकी है।') },
  '/related-links/': { kind: 'related', type: 'Link', lead: L('Websites of State tribal welfare departments and related Government portals.', 'राज्य जनजातीय कल्याण विभागों और संबंधित सरकारी पोर्टलों की वेबसाइटें।') },
  '/help/': { kind: 'help', type: 'Help', lead: L('How to use this website, accessibility options and file viewers.', 'इस वेबसाइट का उपयोग, सुगम्यता विकल्प और फ़ाइल व्यूअर।') },
  '/screen-reader-access/': { kind: 'screenreader', type: 'Help', lead: L('Screen readers you can use with this website.', 'इस वेबसाइट के साथ उपयोग किए जा सकने वाले स्क्रीन रीडर।') },
  '/sitemap/': { kind: 'sitemap', type: 'Help', lead: L('Every page of this website in one place.', 'इस वेबसाइट के सभी पृष्ठ एक स्थान पर।') },
  '/search/': { kind: 'search', type: 'Help' },
};

let cache: PageDef[] | undefined;

export function allPages(): PageDef[] {
  if (cache) return cache;
  const pages: PageDef[] = [];
  const seen = new Set<string>();
  const add = (p: PageDef) => { if (!seen.has(p.path)) { seen.add(p.path); pages.push(p); } };

  // Level-1 and level-2 pages from the navigation tree.
  for (const sec of [...mainNav, policyNav, ...utilityNav]) {
    const meta = KIND_BY_PATH[sec.href];
    if (meta) add({ path: sec.href, title: sec.label, kind: meta.kind, type: meta.type, lead: meta.lead ?? sec.blurb, docCategory: meta.docCategory });
    for (const c of sec.children ?? []) {
      const m = KIND_BY_PATH[c.href];
      if (m) add({ path: c.href, title: c.label, kind: m.kind, type: m.type, lead: m.lead, docCategory: m.docCategory });
    }
  }

  // Level-3 pages
  for (const s of schemes) add({ path: `/offerings/schemes/${s.slug}/`, title: s.title, lead: s.summary, kind: 'scheme', type: 'Scheme', slug: s.slug, parent: '/offerings/schemes/', personas: s.personas });
  for (const d of divisions) add({ path: `/ministry/our-divisions/${d.slug}/`, title: d.title, lead: d.summary, kind: 'division', type: 'Division', slug: d.slug, parent: '/ministry/our-divisions/', personas: d.personas });
  for (const i of initiatives) add({ path: `/offerings/initiatives/${i.slug}/`, title: i.title, lead: i.summary, kind: 'initiative', type: 'Initiative', slug: i.slug, parent: '/offerings/initiatives/', personas: i.personas });
  for (const o of organisations.filter((o) => o.legacy)) add({ path: `/ministry/our-organisations/${o.slug}/`, title: o.name, lead: o.type, kind: 'organisation', type: 'Organisation', slug: o.slug, parent: '/ministry/our-organisations/' });
  add({ path: '/ministry/our-performance/state-review-meetings/', title: L('State Review Meetings', 'राज्य समीक्षा बैठकें'), lead: L('Monitoring reports and circulars for the Ministry’s reviews with State Governments.', 'राज्य सरकारों के साथ मंत्रालय की समीक्षा हेतु निगरानी रिपोर्ट और परिपत्र।'), kind: 'reviews', type: 'Ministry', parent: '/ministry/our-performance/' });
  for (const p of policies) {
    const nav = policyNav.children!.find((c) => c.href === `/policies/${p.slug}/`);
    add({ path: `/policies/${p.slug}/`, title: nav?.label ?? { en: p.title, hi: p.title }, kind: 'policy', type: 'Policy', slug: p.slug, parent: '/policies/' });
  }
  for (const p of personas) add({ path: `/personas/${p.id}/`, title: { en: `For ${p.title.en}`, hi: `${p.title.hi} के लिए` }, lead: p.intent, kind: 'persona', type: 'Persona', slug: p.id, parent: '/' });

  cache = pages;
  return pages;
}

export function pageByPath(path: string) {
  return allPages().find((p) => p.path === path);
}
