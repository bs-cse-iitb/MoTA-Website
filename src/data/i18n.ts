import type { Locale } from './site';

// Interface strings in both languages (GIGW 3.0: bilingual website).
const strings = {
  skipToMain: { en: 'Skip to main content', hi: 'मुख्य सामग्री पर जाएं' },
  screenReader: { en: 'Screen Reader Access', hi: 'स्क्रीन रीडर का उपयोग' },
  accessibility: { en: 'Accessibility options', hi: 'सुगम्यता विकल्प' },
  language: { en: 'Language', hi: 'भाषा' },
  switchTo: { en: 'हिन्दी', hi: 'English' },
  switchToLabel: { en: 'View this page in Hindi', hi: 'यह पृष्ठ अंग्रेज़ी में देखें' },
  search: { en: 'Search', hi: 'खोजें' },
  searchPlaceholder: { en: 'Search schemes, documents, services…', hi: 'योजनाएं, दस्तावेज़, सेवाएं खोजें…' },
  voiceSearch: { en: 'Search by voice', hi: 'आवाज़ से खोजें' },
  listening: { en: 'Listening… speak now', hi: 'सुन रहे हैं… अब बोलें' },
  menu: { en: 'Menu', hi: 'मेनू' },
  close: { en: 'Close', hi: 'बंद करें' },
  home: { en: 'Home', hi: 'मुखपृष्ठ' },
  mainNav: { en: 'Main', hi: 'मुख्य' },
  // Accessibility panel
  textSize: { en: 'Text size', hi: 'पाठ का आकार' },
  decreaseText: { en: 'Decrease text size', hi: 'पाठ का आकार घटाएं' },
  normalText: { en: 'Normal text size', hi: 'सामान्य पाठ आकार' },
  increaseText: { en: 'Increase text size', hi: 'पाठ का आकार बढ़ाएं' },
  colourContrast: { en: 'Colour contrast', hi: 'रंग कंट्रास्ट' },
  standard: { en: 'Standard', hi: 'सामान्य' },
  highContrast: { en: 'High contrast', hi: 'उच्च कंट्रास्ट' },
  dark: { en: 'Dark', hi: 'डार्क' },
  highlightLinks: { en: 'Highlight links', hi: 'लिंक हाइलाइट करें' },
  textSpacing: { en: 'Text spacing', hi: 'पाठ अंतराल' },
  stopMotion: { en: 'Stop animations', hi: 'एनिमेशन रोकें' },
  dyslexiaFont: { en: 'Readable font', hi: 'पठनीय फ़ॉन्ट' },
  reset: { en: 'Reset all', hi: 'सभी रीसेट करें' },
  invertColours: { en: 'Invert colours', hi: 'रंग उलटें' },
  lowSaturation: { en: 'Low saturation', hi: 'कम संतृप्ति' },
  hideImages: { en: 'Hide images', hi: 'चित्र छिपाएं' },
  bigCursor: { en: 'Big cursor', hi: 'बड़ा कर्सर' },
  colourFilter: { en: 'Colour adjustments', hi: 'रंग समायोजन' },
  // Home sections
  announcements: { en: 'Announcements', hi: 'घोषणाएं' },
  pauseTicker: { en: 'Pause announcements', hi: 'घोषणाएं रोकें' },
  playTicker: { en: 'Play announcements', hi: 'घोषणाएं चलाएं' },
  pauseSlides: { en: 'Pause slideshow', hi: 'स्लाइड शो रोकें' },
  playSlides: { en: 'Play slideshow', hi: 'स्लाइड शो चलाएं' },
  prevSlide: { en: 'Previous slide', hi: 'पिछली स्लाइड' },
  nextSlide: { en: 'Next slide', hi: 'अगली स्लाइड' },
  goToSlide: { en: 'Go to slide', hi: 'स्लाइड पर जाएं' },
  viewAll: { en: 'View all', hi: 'सभी देखें' },
  viewMore: { en: 'View more', hi: 'और देखें' },
  readMore: { en: 'Read more', hi: 'और पढ़ें' },
  explore: { en: 'Explore', hi: 'देखें' },
  visit: { en: 'Visit', hi: 'देखें' },
  download: { en: 'Download', hi: 'डाउनलोड' },
  apply: { en: 'Apply', hi: 'आवेदन करें' },
  postedOn: { en: 'Posted on', hi: 'प्रकाशित' },
  lastDate: { en: 'Last date', hi: 'अंतिम तिथि' },
  whatsNew: { en: "What's New", hi: 'नया क्या है' },
  recentDocuments: { en: 'Recent Documents', hi: 'हाल के दस्तावेज़' },
  keyOfferings: { en: 'Key Offerings', hi: 'प्रमुख सेवाएं' },
  schemes: { en: 'Schemes', hi: 'योजनाएं' },
  tenders: { en: 'Tenders', hi: 'निविदाएं' },
  vacancies: { en: 'Vacancies', hi: 'रिक्तियां' },
  aboutMinistry: { en: 'About the Ministry', hi: 'मंत्रालय के बारे में' },
  tribalIndia: { en: 'Tribal India at a glance', hi: 'एक नज़र में जनजातीय भारत' },
  personaTitle: { en: 'Find what is meant for you', hi: 'आपके लिए क्या है, जानें' },
  personaLead: { en: 'Choose who you are to see schemes, services and documents tagged for you.', hi: 'अपनी भूमिका चुनें और अपने लिए चिह्नित योजनाएं, सेवाएं और दस्तावेज़ देखें।' },
  divisions: { en: 'Divisions', hi: 'प्रभाग' },
  initiatives: { en: 'Innovative Initiatives', hi: 'अभिनव पहल' },
  importantLinks: { en: 'Important Links & Portals', hi: 'महत्वपूर्ण लिंक और पोर्टल' },
  citizenEngagement: { en: 'Citizen Engagement', hi: 'नागरिक सहभागिता' },
  socialMedia: { en: 'Follow us on social media', hi: 'सोशल मीडिया पर हमें फ़ॉलो करें' },
  loadFeed: { en: 'Load posts', hi: 'पोस्ट लोड करें' },
  feedConsent: {
    en: 'Social media posts are served by the platform and may set its cookies. Load them only if you agree.',
    hi: 'सोशल मीडिया पोस्ट संबंधित प्लेटफ़ॉर्म से आती हैं और उसकी कुकीज़ सेट कर सकती हैं। सहमत हों तभी लोड करें।',
  },
  centralPosts: { en: 'From the Government of India', hi: 'भारत सरकार से' },
  mediaGallery: { en: 'Events & Media', hi: 'कार्यक्रम और मीडिया' },
  partners: { en: 'Related portals and associations', hi: 'संबंधित पोर्टल और संस्थाएं' },
  pmQuote: { en: "Hon'ble Prime Minister", hi: 'माननीय प्रधानमंत्री' },
  // Footer
  websitePolicies: { en: 'Website Policies', hi: 'वेबसाइट नीतियां' },
  sitemap: { en: 'Sitemap', hi: 'साइटमैप' },
  help: { en: 'Help', hi: 'सहायता' },
  feedback: { en: 'Feedback', hi: 'प्रतिक्रिया' },
  relatedLinks: { en: 'Related Links', hi: 'संबंधित लिंक' },
  archives: { en: 'Archives', hi: 'पुरालेख' },
  contactUs: { en: 'Contact Us', hi: 'संपर्क करें' },
  lastUpdated: { en: 'Last updated on', hi: 'अंतिम अद्यतन' },
  quickLinks: { en: 'Quick links', hi: 'त्वरित लिंक' },
  followUs: { en: 'Follow us', hi: 'हमें फ़ॉलो करें' },
  backToTop: { en: 'Back to top', hi: 'ऊपर जाएं' },
  // Pages
  onThisPage: { en: 'On this page', hi: 'इस पृष्ठ पर' },
  inThisSection: { en: 'In this section', hi: 'इस अनुभाग में' },
  breadcrumb: { en: 'Breadcrumb', hi: 'ब्रेडक्रम्ब' },
  print: { en: 'Print', hi: 'प्रिंट करें' },
  share: { en: 'Share', hi: 'साझा करें' },
  copied: { en: 'Link copied', hi: 'लिंक कॉपी हुआ' },
  pageUpdated: { en: 'Page last reviewed', hi: 'पृष्ठ की अंतिम समीक्षा' },
  documents: { en: 'Documents', hi: 'दस्तावेज़' },
  filterList: { en: 'Filter this list', hi: 'इस सूची को फ़िल्टर करें' },
  noMatches: { en: 'No items match your filter.', hi: 'आपके फ़िल्टर से कोई आइटम मेल नहीं खाता।' },
  showing: { en: 'Showing', hi: 'दिखाए जा रहे' },
  items: { en: 'items', hi: 'आइटम' },
  externalNote: { en: 'opens an external website in a new tab', hi: 'बाहरी वेबसाइट नए टैब में खुलेगी' },
  newTabNote: { en: 'opens in a new tab', hi: 'नए टैब में खुलेगा' },
  contentInEnglish: {
    en: '',
    hi: 'दस्तावेज़ों के शीर्षक उनकी मूल भाषा (अंग्रेज़ी) में दिए गए हैं।',
  },
  // External link dialog (GIGW: warn before leaving the site)
  leavingTitle: { en: 'You are leaving tribal.gov.in', hi: 'आप tribal.gov.in से बाहर जा रहे हैं' },
  leavingBody: {
    en: 'This link opens an external website in a new tab. The Ministry of Tribal Affairs is not responsible for the content or privacy practices of external websites.',
    hi: 'यह लिंक एक बाहरी वेबसाइट नए टैब में खोलेगा। जनजातीय कार्य मंत्रालय बाहरी वेबसाइटों की सामग्री या गोपनीयता प्रथाओं के लिए उत्तरदायी नहीं है।',
  },
  continue: { en: 'Continue', hi: 'जारी रखें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  // Cookie consent (DBIM 7.6, DPDP Act 2023)
  cookieTitle: { en: 'Your privacy choices', hi: 'आपकी गोपनीयता के विकल्प' },
  cookieBody: {
    en: 'We use essential cookies to remember your language and accessibility settings. With your consent we also use analytics cookies to improve this website, and load social media posts.',
    hi: 'हम आपकी भाषा और सुगम्यता सेटिंग याद रखने के लिए आवश्यक कुकीज़ का उपयोग करते हैं। आपकी सहमति से हम वेबसाइट सुधारने हेतु एनालिटिक्स कुकीज़ और सोशल मीडिया पोस्ट का भी उपयोग करते हैं।',
  },
  acceptAll: { en: 'Accept all', hi: 'सभी स्वीकार करें' },
  rejectAll: { en: 'Reject non-essential', hi: 'गैर-आवश्यक अस्वीकार करें' },
  customise: { en: 'Customise', hi: 'अनुकूलित करें' },
  savePrefs: { en: 'Save preferences', hi: 'प्राथमिकताएं सहेजें' },
  essential: { en: 'Essential', hi: 'आवश्यक' },
  essentialDesc: { en: 'Language, accessibility and cookie choices. Always on.', hi: 'भाषा, सुगम्यता और कुकी विकल्प। हमेशा चालू।' },
  analytics: { en: 'Analytics', hi: 'एनालिटिक्स' },
  analyticsDesc: { en: 'Anonymous visit statistics that help us improve the website.', hi: 'अनाम विज़िट आंकड़े जो वेबसाइट सुधारने में मदद करते हैं।' },
  socialCookies: { en: 'Social media', hi: 'सोशल मीडिया' },
  socialDesc: { en: 'Embedded posts from X, Facebook, Instagram and YouTube.', hi: 'X, फ़ेसबुक, इंस्टाग्राम और यूट्यूब की एम्बेड की गई पोस्ट।' },
  cookiePolicy: { en: 'Cookie Policy', hi: 'कुकी नीति' },
  // Search page
  searchTitle: { en: 'Search the website', hi: 'वेबसाइट खोजें' },
  searchHint: {
    en: 'Search covers every page of this website. Filter results by type or by who the content is for.',
    hi: 'खोज इस वेबसाइट के हर पृष्ठ पर होती है। परिणामों को प्रकार या उपयोगकर्ता के अनुसार फ़िल्टर करें।',
  },
  // 404
  notFoundTitle: { en: 'Page not found', hi: 'पृष्ठ नहीं मिला' },
  notFoundBody: {
    en: 'The page you are looking for may have moved during the website upgrade. Try search, or start from one of these sections.',
    hi: 'आप जो पृष्ठ ढूंढ रहे हैं वह वेबसाइट अपग्रेड के दौरान स्थानांतरित हो सकता है। खोज का उपयोग करें या इनमें से किसी अनुभाग से शुरू करें।',
  },
} as const;

export type StringKey = keyof typeof strings;

export function t(key: StringKey, locale: Locale): string {
  return strings[key][locale];
}

/** Inline bilingual text: tx(locale, 'English', 'हिन्दी'). */
export function tx(locale: Locale, en: string, hi: string): string {
  return locale === 'hi' ? hi : en;
}

/** Prefix an internal path with /hi for the Hindi site. */
export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith('/')) return path;
  if (locale === 'en') return path;
  return path === '/' ? '/hi/' : `/hi${path}`;
}

/** Strip /hi so a Hindi path can be mapped back to English. */
export function basePath(path: string): string {
  return path.replace(/^\/hi(\/|$)/, '/');
}

const hiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
export function formatDate(d: Date | string, locale: Locale): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  // DBIM A.5.6 (viii): day before month.
  const s = date.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return s;
}
export { hiDigits };
