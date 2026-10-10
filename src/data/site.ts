// Ministry identity and global settings. Edit here; every page reads from this file.

export const site = {
  url: 'https://tribal.gov.in',
  name: { en: 'Ministry of Tribal Affairs', hi: 'जनजातीय कार्य मंत्रालय' },
  government: { en: 'Government of India', hi: 'भारत सरकार' },
  short: 'MoTA',
  description: {
    en: 'Official website of the Ministry of Tribal Affairs, Government of India: schemes, services, documents and updates for the welfare and development of Scheduled Tribes.',
    hi: 'जनजातीय कार्य मंत्रालय, भारत सरकार की आधिकारिक वेबसाइट: अनुसूचित जनजातियों के कल्याण और विकास हेतु योजनाएं, सेवाएं, दस्तावेज़ और नवीनतम जानकारी।',
  },
  // DBIM 5.6: footer lineage wording for a Central Government Ministry.
  lineage: {
    en: 'This website belongs to Ministry of Tribal Affairs, Government of India',
    hi: 'यह वेबसाइट जनजातीय कार्य मंत्रालय, भारत सरकार की है',
  },
  managedBy: {
    en: 'Designed, developed and hosted by National Informatics Centre (NIC), Ministry of Electronics & Information Technology',
    hi: 'राष्ट्रीय सूचना विज्ञान केंद्र (एनआईसी), इलेक्ट्रॉनिकी और सूचना प्रौद्योगिकी मंत्रालय द्वारा डिज़ाइन, विकसित और होस्ट',
  },
  // DBIM colour group 9 ("terracotta") — see packages/dbim-kit/src/css/tokens.css.
  colourGroup: 'Group 9 — Terracotta',
  offices: [
    {
      label: { en: 'Ministry of Tribal Affairs (Main Office)', hi: 'जनजातीय कार्य मंत्रालय (मुख्य कार्यालय)' },
      address: { en: '3rd Floor, Kartavya Bhawan-01, New Delhi', hi: 'तीसरी मंज़िल, कर्तव्य भवन-01, नई दिल्ली' },
      phone: '011-24013700',
      mapQuery: 'Kartavya Bhawan, New Delhi',
    },
    {
      label: { en: 'Ministry of Tribal Affairs (Jeevan Tara Building)', hi: 'जनजातीय कार्य मंत्रालय (जीवन तारा भवन)' },
      address: { en: 'Jeevan Tara Building, Gate No. 5, Ashoka Road, Patel Chowk, New Delhi-110001', hi: 'जीवन तारा भवन, गेट नंबर 5, अशोक रोड, पटेल चौक, नई दिल्ली-110001' },
      phone: '011-23340470',
      mapQuery: 'Jeevan Tara Building, Patel Chowk, New Delhi',
    },
  ],
  social: [
    { id: 'x', label: 'X (Twitter)', handle: '@TribalAffairsIn', url: 'https://x.com/TribalAffairsIn' },
    { id: 'facebook', label: 'Facebook', handle: 'TribalAffairsIn', url: 'https://www.facebook.com/TribalAffairsIn/' },
    { id: 'instagram', label: 'Instagram', handle: '@tribalaffairsin', url: 'https://www.instagram.com/tribalaffairsin/' },
    { id: 'youtube', label: 'YouTube', handle: 'Ministry of Tribal Affairs', url: 'https://www.youtube.com/c/MinistryofTribalAffairs/videos' },
  ],
  nationalPortal: 'https://www.india.gov.in/',
  // Shown in the footer (GIGW: "last updated" must be on the home page).
  lastUpdated: new Date(),
  /** DBIM 5.4 co-branding (at most two): the campaign logos in the live header. The Janjatiya Gaurav
   *  Varsh logo links to the campaign site, which the old main menu linked as "JJGD". */
  cobrand: [
    { logo: '/images/cobrand/azadi-ka-amrit-mahotsav.png', width: 88, height: 48, href: 'https://amritmahotsav.nic.in/', alt: { en: 'Azadi Ka Amrit Mahotsav', hi: 'आज़ादी का अमृत महोत्सव' } },
    { logo: '/images/cobrand/janjatiya-gaurav-varsh-150.png', width: 114, height: 48, href: 'https://adiprasaran.tribal.gov.in/jjgd/', alt: { en: 'Janjatiya Gaurav Varsh: 150th birth anniversary of Bhagwan Birsa Munda', hi: 'जनजातीय गौरव वर्ष: भगवान बिरसा मुंडा की 150वीं जयंती' } },
  ],
  /** STQC certificate shown in the footer only while valid. The 2023 certificate expired on 12 Feb 2026;
   *  put the new one here (PDF path, size and expiry) when STQC issues it. */
  stqc: { href: 'https://tribal.gov.in/DivisionsFiles/STQC13022023.pdf', size: '191 KB', validTill: '2026-02-12' },
  /** FAQ document linked in the footer, as on the live site. */
  faq: { href: 'https://tribal.gov.in/downloads/tribal/FAQ.pdf', size: '9.1 MB' },
  /** Visitor counter, as on the live footer. Needs a same-origin endpoint that returns {"count": 12345}
   *  (the legacy site counted visits in its database). Empty = switched off; e.g. '/api/visitor-count'. */
  visitorCounter: '',
  // Chat assistant settings are in src/data/assistant.ts.
} as const;

export type Locale = 'en' | 'hi';
export type Bilingual = { en: string; hi: string };

export const ministers = [
  {
    name: { en: 'Shri Jual Oram', hi: 'श्री जुएल ओराम' },
    role: { en: "Hon'ble Minister of Tribal Affairs", hi: 'माननीय जनजातीय कार्य मंत्री' },
    photo: 'jual-oram',
    profile: 'https://sansad.in/ls/members/biography/279',
  },
  {
    name: { en: 'Shri Durgadas Uikey', hi: 'श्री दुर्गादास उइके' },
    role: { en: "Hon'ble Minister of State for Tribal Affairs", hi: 'माननीय जनजातीय कार्य राज्य मंत्री' },
    photo: 'durgadas-uikey',
    profile: 'https://sansad.in/ls/members/biography/5057',
  },
] as const;
