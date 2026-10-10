import type { Bilingual } from './site';
import type { PersonaId } from './schemes';

// User personas (DBIM A.2). Every scheme, division, initiative and portal is
// tagged with personas; each persona page lists what is tagged for it.

export interface Persona {
  id: PersonaId;
  title: Bilingual;
  short: Bilingual;
  intent: Bilingual;
  /** Prop held by the Warli figure in the persona illustration. */
  prop: 'book' | 'tree' | 'lens' | 'hands' | 'pillar' | 'basket' | 'mic';
  quickLinks: { label: string; href: string }[];
}

export const personas: Persona[] = [
  {
    id: 'student',
    title: { en: 'Student', hi: 'विद्यार्थी' },
    short: { en: 'Scholarships, EMRS and fellowships', hi: 'छात्रवृत्ति, ईएमआरएस और फ़ेलोशिप' },
    intent: { en: 'I want to find scholarships and schools for ST students.', hi: 'मैं अनुसूचित जनजाति छात्रों हेतु छात्रवृत्ति और विद्यालय ढूंढना चाहता/चाहती हूं।' },
    prop: 'book',
    quickLinks: [
      { label: 'National Scholarship Portal', href: 'https://scholarships.gov.in/' },
      { label: 'National Fellowship portal', href: 'https://fellowship.tribal.gov.in/' },
      { label: 'National Overseas portal', href: 'https://overseas.tribal.gov.in/' },
      { label: 'List of EMRS schools', href: 'https://tribal.gov.in/downloads/EMRS/ListEMRSSchinIndia31072026.pdf' },
    ],
  },
  {
    id: 'citizen',
    title: { en: 'Tribal Citizen', hi: 'जनजातीय नागरिक' },
    short: { en: 'Forest rights, health, housing and livelihoods', hi: 'वन अधिकार, स्वास्थ्य, आवास और आजीविका' },
    intent: { en: 'I want to know my rights and the benefits my family and village can get.', hi: 'मैं अपने अधिकार और अपने परिवार व गांव को मिलने वाले लाभ जानना चाहता/चाहती हूं।' },
    prop: 'tree',
    quickLinks: [
      { label: 'Forest Rights Act', href: '/ministry/our-divisions/forest-rights-act/' },
      { label: 'Lodge a grievance', href: '/connect/grievance-redressal/' },
      { label: 'Swasthya health portal', href: 'https://swasthya.tribal.gov.in' },
    ],
  },
  {
    id: 'researcher',
    title: { en: 'Researcher', hi: 'शोधकर्ता' },
    short: { en: 'TRIs, data, reports and repositories', hi: 'टीआरआई, डेटा, रिपोर्ट और भंडार' },
    intent: { en: 'I need data, reports and research on Scheduled Tribes.', hi: 'मुझे अनुसूचित जनजातियों पर डेटा, रिपोर्ट और शोध चाहिए।' },
    prop: 'lens',
    quickLinks: [
      { label: 'Statistics & ST profile', href: '/ministry/our-divisions/statistics/' },
      { label: 'Tribal Digital Document Repository', href: 'https://repository.tribal.gov.in/' },
      { label: 'Knowledge Hub', href: '/documents/knowledge-hub/' },
    ],
  },
  {
    id: 'ngo',
    title: { en: 'Voluntary Organisation', hi: 'स्वैच्छिक संगठन' },
    short: { en: 'Grants-in-aid, formats and timelines', hi: 'सहायता अनुदान, प्रारूप और समय-सीमाएं' },
    intent: { en: 'My organisation wants to apply for grants and report progress.', hi: 'मेरा संगठन अनुदान हेतु आवेदन और प्रगति रिपोर्ट देना चाहता है।' },
    prop: 'hands',
    quickLinks: [
      { label: 'NGO Grants portal', href: 'https://ngo.tribal.gov.in/' },
      { label: 'NGO Division documents', href: '/ministry/our-divisions/ngo/' },
      { label: 'NGO Darpan', href: 'https://ngodarpan.gov.in/' },
    ],
  },
  {
    id: 'state',
    title: { en: 'State Government', hi: 'राज्य सरकार' },
    short: { en: 'Guidelines, grants, sanctions and monitoring', hi: 'दिशानिर्देश, अनुदान, स्वीकृतियां और निगरानी' },
    intent: { en: 'I implement tribal schemes and need guidelines, sanctions and review data.', hi: 'मैं जनजातीय योजनाएं लागू करता/करती हूं और मुझे दिशानिर्देश, स्वीकृतियां और समीक्षा डेटा चाहिए।' },
    prop: 'pillar',
    quickLinks: [
      { label: 'Sanction orders', href: '/documents/sanction-orders/' },
      { label: 'Scheme guidelines', href: '/documents/guidelines/' },
      { label: 'DBT Tribal portal', href: 'https://dbttribal.gov.in/' },
    ],
  },
  {
    id: 'entrepreneur',
    title: { en: 'Entrepreneur', hi: 'उद्यमी' },
    short: { en: 'Loans, venture capital and markets', hi: 'ऋण, उद्यम पूंजी और बाज़ार' },
    intent: { en: 'I want finance and markets to grow a tribal enterprise.', hi: 'मैं जनजातीय उद्यम बढ़ाने के लिए वित्त और बाज़ार चाहता/चाहती हूं।' },
    prop: 'basket',
    quickLinks: [
      { label: 'NSTFDC loans', href: '/offerings/schemes/nstfdc-equity/' },
      { label: 'Venture Capital Fund for STs', href: '/offerings/schemes/vcf-st/' },
      { label: 'Tribes India', href: 'https://www.tribesindia.com/' },
    ],
  },
  {
    id: 'media',
    title: { en: 'Media', hi: 'मीडिया' },
    short: { en: 'Press releases, photos and reports', hi: 'प्रेस विज्ञप्तियां, फ़ोटो और रिपोर्ट' },
    intent: { en: 'I need official information, figures and media for reporting.', hi: 'मुझे रिपोर्टिंग हेतु आधिकारिक जानकारी, आंकड़े और मीडिया चाहिए।' },
    prop: 'mic',
    quickLinks: [
      { label: 'Press releases', href: '/documents/press-releases/' },
      { label: 'Photos', href: '/media/photos/' },
      { label: 'Performance Dashboard', href: 'https://dashboard.tribal.gov.in/' },
    ],
  },
];
