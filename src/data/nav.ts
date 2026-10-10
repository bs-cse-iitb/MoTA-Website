import type { Bilingual } from './site';

// Global Information Architecture (DBIM 3.0, Annexure A.1).
// Five mandatory level-1 sections — Ministry, Offerings, Documents, Media, Connect —
// with Ministry-specific level-2 pages. This tree drives the mega menu, mobile menu,
// breadcrumbs, section side navigation, footer and the sitemap.

export interface NavItem {
  label: Bilingual;
  href: string;
  icon?: string;
  blurb?: Bilingual;
  children?: NavItem[];
  /** Hidden from menus (still in sitemap/breadcrumbs). */
  menuHidden?: boolean;
}

export const mainNav: NavItem[] = [
  {
    label: { en: 'Ministry', hi: 'मंत्रालय' },
    href: '/ministry/',
    icon: 'Landmark',
    blurb: {
      en: 'Who we are, our leadership, divisions, organisations and how we perform.',
      hi: 'हम कौन हैं, हमारा नेतृत्व, प्रभाग, संगठन और हमारा प्रदर्शन।',
    },
    children: [
      { label: { en: 'About Us', hi: 'हमारे बारे में' }, href: '/ministry/about-us/', icon: 'Info' },
      { label: { en: 'Our Team', hi: 'हमारी टीम' }, href: '/ministry/our-team/', icon: 'Users' },
      { label: { en: 'Our Divisions', hi: 'हमारे प्रभाग' }, href: '/ministry/our-divisions/', icon: 'LayoutGrid' },
      { label: { en: 'Our Organisations', hi: 'हमारे संगठन' }, href: '/ministry/our-organisations/', icon: 'Building2' },
      { label: { en: 'Our Performance', hi: 'हमारा प्रदर्शन' }, href: '/ministry/our-performance/', icon: 'ChartColumn' },
      { label: { en: 'Directory', hi: 'निर्देशिका' }, href: '/connect/directory/', icon: 'Contact' },
    ],
  },
  {
    label: { en: 'Offerings', hi: 'सेवाएं' },
    href: '/offerings/',
    icon: 'HandHeart',
    blurb: {
      en: 'Schemes, online services, initiatives, tenders and vacancies of the Ministry.',
      hi: 'मंत्रालय की योजनाएं, ऑनलाइन सेवाएं, पहल, निविदाएं और रिक्तियां।',
    },
    children: [
      { label: { en: 'Schemes and Services', hi: 'योजनाएं और सेवाएं' }, href: '/offerings/schemes/', icon: 'HandCoins' },
      { label: { en: 'Portals & Online Services', hi: 'पोर्टल और ऑनलाइन सेवाएं' }, href: '/offerings/portals/', icon: 'Laptop' },
      { label: { en: 'Initiatives', hi: 'पहल' }, href: '/offerings/initiatives/', icon: 'Sparkles' },
      { label: { en: 'Tenders', hi: 'निविदाएं' }, href: '/offerings/tenders/', icon: 'Gavel' },
      { label: { en: 'Vacancies', hi: 'रिक्तियां' }, href: '/offerings/vacancies/', icon: 'Briefcase' },
      { label: { en: 'Competitions and Awards', hi: 'प्रतियोगिताएं और पुरस्कार' }, href: '/offerings/competitions-and-awards/', icon: 'Award' },
    ],
  },
  {
    label: { en: 'Documents', hi: 'दस्तावेज़' },
    href: '/documents/',
    icon: 'Files',
    blurb: {
      en: 'Reports, acts, guidelines, orders, publications and other official documents.',
      hi: 'रिपोर्ट, अधिनियम, दिशानिर्देश, आदेश, प्रकाशन और अन्य आधिकारिक दस्तावेज़।',
    },
    children: [
      { label: { en: 'Reports', hi: 'रिपोर्ट' }, href: '/documents/reports/', icon: 'ChartLine' },
      { label: { en: 'Acts and Policies', hi: 'अधिनियम और नीतियां' }, href: '/documents/acts-and-policies/', icon: 'Scale' },
      { label: { en: 'Guidelines', hi: 'दिशानिर्देश' }, href: '/documents/guidelines/', icon: 'BookOpen' },
      { label: { en: 'Orders and Notices', hi: 'आदेश और सूचनाएं' }, href: '/documents/orders-and-notices/', icon: 'ScrollText' },
      { label: { en: 'Gazette Notifications', hi: 'राजपत्र अधिसूचनाएं' }, href: '/documents/gazette-notifications/', icon: 'Newspaper' },
      { label: { en: 'Minutes of Meetings', hi: 'बैठकों का कार्यवृत्त' }, href: '/documents/minutes-of-meetings/', icon: 'ClipboardList' },
      { label: { en: 'Publications', hi: 'प्रकाशन' }, href: '/documents/publications/', icon: 'Library' },
      { label: { en: 'Press Releases', hi: 'प्रेस विज्ञप्तियां' }, href: '/documents/press-releases/', icon: 'Megaphone' },
      { label: { en: 'Sanction Orders', hi: 'स्वीकृति आदेश' }, href: '/documents/sanction-orders/', icon: 'FileCheck' },
      { label: { en: 'Knowledge Hub', hi: 'ज्ञान केंद्र' }, href: '/documents/knowledge-hub/', icon: 'BookMarked' },
    ],
  },
  {
    label: { en: 'Media', hi: 'मीडिया' },
    href: '/media/',
    icon: 'Camera',
    blurb: {
      en: 'Photographs, videos and brochures from the Ministry’s programmes and events.',
      hi: 'मंत्रालय के कार्यक्रमों और आयोजनों की तस्वीरें, वीडियो और विवरणिकाएं।',
    },
    children: [
      { label: { en: 'Photos', hi: 'फ़ोटो' }, href: '/media/photos/', icon: 'Image' },
      { label: { en: 'Videos', hi: 'वीडियो' }, href: '/media/videos/', icon: 'Video' },
      { label: { en: 'Brochures', hi: 'विवरणिकाएं' }, href: '/media/brochures/', icon: 'Notebook' },
    ],
  },
  {
    label: { en: 'Connect', hi: 'संपर्क' },
    href: '/connect/',
    icon: 'MessageSquare',
    blurb: {
      en: 'Contact the Ministry, file RTI or grievances, and take part in citizen engagement.',
      hi: 'मंत्रालय से संपर्क करें, आरटीआई या शिकायत दर्ज करें और नागरिक सहभागिता में भाग लें।',
    },
    children: [
      { label: { en: 'Contact Us', hi: 'संपर्क करें' }, href: '/connect/contact-us/', icon: 'Phone' },
      { label: { en: 'Directory', hi: 'निर्देशिका' }, href: '/connect/directory/', icon: 'Contact' },
      { label: { en: 'RTI', hi: 'सूचना का अधिकार' }, href: '/connect/rti/', icon: 'FileText' },
      { label: { en: 'Grievance Redressal', hi: 'शिकायत निवारण' }, href: '/connect/grievance-redressal/', icon: 'LifeBuoy' },
      { label: { en: 'Citizen Engagement', hi: 'नागरिक सहभागिता' }, href: '/connect/citizen-engagement/', icon: 'Handshake' },
      { label: { en: 'Parliament Questions', hi: 'संसद प्रश्न' }, href: '/connect/parliament-questions/', icon: 'Vote' },
      { label: { en: 'Feedback', hi: 'प्रतिक्रिया' }, href: '/connect/feedback/', icon: 'Send' },
    ],
  },
];

export const policyNav: NavItem = {
  label: { en: 'Website Policies', hi: 'वेबसाइट नीतियां' },
  href: '/policies/',
  icon: 'ShieldCheck',
  children: [
    { label: { en: 'Terms of Use', hi: 'उपयोग की शर्तें' }, href: '/policies/terms-of-use/' },
    { label: { en: 'Privacy Policy', hi: 'गोपनीयता नीति' }, href: '/policies/privacy-policy/' },
    { label: { en: 'Hyperlinking Policy', hi: 'हाइपरलिंकिंग नीति' }, href: '/policies/hyperlinking-policy/' },
    { label: { en: 'Copyright Policy', hi: 'कॉपीराइट नीति' }, href: '/policies/copyright-policy/' },
    { label: { en: 'Cookie Policy', hi: 'कुकी नीति' }, href: '/policies/cookie-policy/' },
    { label: { en: 'Disclaimer', hi: 'अस्वीकरण' }, href: '/policies/disclaimer/' },
    { label: { en: 'Accessibility Statement', hi: 'सुगम्यता विवरण' }, href: '/policies/accessibility-statement/' },
    { label: { en: 'Content Archival Policy', hi: 'सामग्री संग्रह नीति' }, href: '/policies/content-archival-policy/' },
    { label: { en: 'Content Contribution, Moderation & Approval Policy', hi: 'सामग्री योगदान, संचालन और अनुमोदन नीति' }, href: '/policies/cmap/' },
    { label: { en: 'Content Review Policy', hi: 'सामग्री समीक्षा नीति' }, href: '/policies/content-review-policy/' },
    { label: { en: 'Security Policy', hi: 'सुरक्षा नीति' }, href: '/policies/security-policy/' },
    { label: { en: 'Contingency Management Plan', hi: 'आकस्मिक प्रबंधन योजना' }, href: '/policies/contingency-management-plan/' },
    { label: { en: 'Website Monitoring Policy', hi: 'वेबसाइट निगरानी नीति' }, href: '/policies/website-monitoring-policy/' },
  ],
};

export const utilityNav: NavItem[] = [
  { label: { en: "What's New", hi: 'नया क्या है' }, href: '/whats-new/', icon: 'Bell' },
  { label: { en: 'Archives', hi: 'पुरालेख' }, href: '/archives/', icon: 'FolderOpen' },
  { label: { en: 'Related Links', hi: 'संबंधित लिंक' }, href: '/related-links/', icon: 'Link' },
  { label: { en: 'Help', hi: 'सहायता' }, href: '/help/', icon: 'CircleHelp' },
  { label: { en: 'Screen Reader Access', hi: 'स्क्रीन रीडर का उपयोग' }, href: '/screen-reader-access/', icon: 'Volume2' },
  { label: { en: 'Sitemap', hi: 'साइटमैप' }, href: '/sitemap/', icon: 'Network' },
  { label: { en: 'Search', hi: 'खोजें' }, href: '/search/', icon: 'Search' },
];

/** Find the trail of nav items leading to `href` (for breadcrumbs and side nav). */
export function findTrail(href: string, items: NavItem[] = [...mainNav, policyNav, ...utilityNav]): NavItem[] {
  for (const item of items) {
    if (item.href === href) return [item];
    if (item.children) {
      const sub = findTrail(href, item.children);
      if (sub.length) return [item, ...sub];
    }
  }
  return [];
}

/** The level-1 section a path belongs to (by URL prefix). */
export function sectionFor(href: string): NavItem | undefined {
  return [...mainNav, policyNav].find((s) => href.startsWith(s.href));
}
