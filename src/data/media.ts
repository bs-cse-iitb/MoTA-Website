// Media: campaign banners for the home carousel and photo albums.
// Image files live in src/assets (copied from the legacy site by scripts/prepare-assets.mjs)
// and are converted to WebP at build time.

import jguThemes from '../assets/banners/jgu-2026-themes.jpg';
import jguTech from '../assets/banners/jgu-2026-technology.jpg';
import jguJan from '../assets/banners/jgu-2026-jan-bhagidaari.jpg';
import jguBirsa from '../assets/banners/jgu-2026-birsa.jpg';
import jguClass from '../assets/banners/jgu-2026-classroom.jpg';
import saal12 from '../assets/banners/12-saal.jpg';
import tribex from '../assets/banners/tribex.jpg';
import bharatInnovates from '../assets/banners/bharat-innovates-2026.jpg';

import aadi from '../assets/gallery/aadi-mahotsav-2025.jpg';
import tbc from '../assets/gallery/tribal-business-conclave-2025.jpg';
import manthan from '../assets/gallery/pm-janman-manthan-shivir-2023.jpg';
import jjgd from '../assets/gallery/janjatiya-gaurav-divas.jpg';
import sickle from '../assets/gallery/sickle-cell-2047.jpg';
import scd from '../assets/gallery/world-sickle-cell-day.jpg';
import tri from '../assets/gallery/tribal-research-institute.jpg';
import rdc from '../assets/gallery/republic-day-2026.jpg';

// Same slides and order as the live home page (after the CCPS banner and the welcome slide).
const JGU = 'https://adiprasaran.tribal.gov.in/jjgu/';
export const banners: { image: ImageMetadata; alt: string; altHi: string; href?: string }[] = [
  { image: tribex, href: '/offerings/initiatives/tribex/', alt: 'TribeX digital learning platform: admissions open for UGC-recognised PG diploma programmes in museology, tribal livelihoods, Santali (Ol Chiki), tribal textile, and tribal culture and arts. Fee ₹7,500, with scholarships for ST students.', altHi: 'ट्राइबएक्स डिजिटल लर्निंग प्लेटफ़ॉर्म: संग्रहालय विज्ञान, जनजातीय आजीविका, संथाली (ओल चिकी), जनजातीय वस्त्र तथा जनजातीय संस्कृति एवं कला में यूजीसी मान्यता प्राप्त पीजी डिप्लोमा कार्यक्रमों में प्रवेश प्रारंभ। शुल्क ₹7,500, अनुसूचित जनजाति विद्यार्थियों के लिए छात्रवृत्ति।' },
  { image: saal12, alt: '12 years of development and public welfare: Sabka Saath, Sabka Vikas, Sabka Vishwas.', altHi: 'विकास और जन-कल्याण के 12 वर्ष: सबका साथ, सबका विकास, सबका विश्वास।' },
  { image: jguThemes, href: JGU, alt: 'Janjatiya Garima Utsav 2026, held over four thematic weeks: Technology as a Development Driver; Jan Bhagidaari — Sabse Door, Sabse Pehle; Birsa Lives in New Bharat; and From Classroom to Confidence.', altHi: 'जनजातीय गरिमा उत्सव 2026, चार विषयगत सप्ताहों में: विकास के वाहक के रूप में प्रौद्योगिकी; जन भागीदारी — सबसे दूर, सबसे पहले; नए भारत में बिरसा; और कक्षा से आत्मविश्वास तक।' },
  { image: bharatInnovates, href: 'https://bharatinnovates.in/', alt: 'Bharat Innovates, the DeepTech innovation initiative of the Ministry of Education, Government of India: 14 to 16 June 2026, Palais des Expositions, Nice, France.', altHi: 'भारत इनोवेट्स, शिक्षा मंत्रालय, भारत सरकार की डीपटेक नवाचार पहल: 14 से 16 जून 2026, पैलेस डेस एक्सपोज़िशन्स, नीस, फ़्रांस।' },
  { image: jguTech, href: JGU, alt: 'Janjatiya Garima Utsav 2026, week one: Technology as a Development Driver, featuring Adi Vaani, the AI translator for tribal languages.', altHi: 'जनजातीय गरिमा उत्सव 2026, पहला सप्ताह: विकास के वाहक के रूप में प्रौद्योगिकी, जनजातीय भाषाओं के एआई अनुवादक आदि वाणी सहित।' },
  { image: jguJan, href: JGU, alt: 'Janjatiya Garima Utsav 2026: Jan Bhagidaari — Sabse Door, Sabse Pehle. A tribal woman says PM-JANMAN and DAJGUA brought her village attention, awareness and outreach.', altHi: 'जनजातीय गरिमा उत्सव 2026: जन भागीदारी — सबसे दूर, सबसे पहले। एक जनजातीय महिला बताती हैं कि पीएम-जनमन और धरती आबा अभियान से उनके गांव तक ध्यान, जागरूकता और पहुंच आई।' },
  { image: jguBirsa, href: JGU, alt: "Janjatiya Garima Utsav 2026: Birsa Lives in New Bharat, with the Prime Minister's tribute to Bhagwan Birsa Munda on Janjatiya Gaurav Divas.", altHi: 'जनजातीय गरिमा उत्सव 2026: नए भारत में बिरसा, जनजातीय गौरव दिवस पर भगवान बिरसा मुंडा को प्रधानमंत्री की श्रद्धांजलि सहित।' },
  { image: jguClass, href: JGU, alt: 'Janjatiya Garima Utsav 2026: From Classroom to Confidence — EMRS, pre-matric, post-matric and overseas scholarships.', altHi: 'जनजातीय गरिमा उत्सव 2026: कक्षा से आत्मविश्वास तक — एकलव्य विद्यालय, मैट्रिक-पूर्व, मैट्रिकोत्तर और प्रवासी छात्रवृत्ति।' },
];

export interface Album {
  id: string;
  title: string;
  date: string;
  caption: string;
  image: ImageMetadata;
  alt: string;
}

export const albums: Album[] = [
  { id: 'janjatiya-garima-utsav-2026', title: 'Janjatiya Garima Utsav 2026', date: '2026', caption: 'A celebration of a journey of Viksit Bharat, with special emphasis on technology, livelihood, education and public participation.', image: jguThemes, alt: 'Four thematic weeks of Janjatiya Garima Utsav 2026.' },
  { id: 'tribal-business-conclave-2025', title: 'Tribal Business Conclave 2025', date: '12 Nov 2025', caption: 'A conclave on tribal enterprise and start-ups at Yashobhumi, New Delhi.', image: tbc, alt: 'Tribal Business Conclave 2025 poster, 12 November 2025 at Yashobhumi, New Delhi.' },
  { id: 'aadi-mahotsav-2025', title: 'Aadi Mahotsav 2025', date: '16–24 Feb 2025', caption: 'A celebration of tribal entrepreneurship, craft, culture, cuisine and commerce at Major Dhyan Chand National Stadium, New Delhi.', image: aadi, alt: 'Aadi Mahotsav 2025 poster, 16 to 24 February at Major Dhyan Chand National Stadium, India Gate.' },
  { id: 'janjatiya-gaurav-divas', title: 'Janjatiya Gaurav Divas', date: '15 November', caption: 'Floral tribute to Bhagwan Birsa Munda by the Hon’ble President of India, Smt. Droupadi Murmu, at Parliament premises.', image: jjgd, alt: 'Janjatiya Gaurav Divas: floral tribute to Bhagwan Birsa Munda by the President of India at Parliament premises.' },
  { id: 'sickle-cell', title: 'Towards eliminating sickle cell anaemia by 2047', date: '2025', caption: 'The Government of India is committed to eliminating sickle cell anaemia by 2047.', image: sickle, alt: 'Campaign creative: Government of India is committed to eliminate sickle cell anaemia by 2047.' },
  { id: 'world-sickle-cell-day', title: 'World Sickle Cell Day', date: '19 June', caption: 'Observed every year on 19 June, with awareness events at AIIMS New Delhi.', image: scd, alt: 'World Sickle Cell Day, 19 June, campaign creative.' },
  { id: 'pm-janman-manthan-shivir', title: 'Manthan Shivir 2023 — PM-JANMAN', date: '15 Dec 2023', caption: 'Reflections on the implementation of PM-JANMAN at Bharat Mandapam, New Delhi.', image: manthan, alt: 'Manthan Shivir 2023: reflections on implementation of PM-JANMAN, 15 December 2023, Bharat Mandapam.' },
  { id: 'republic-day-2026', title: 'Republic Day 2026', date: '26 Jan 2026', caption: 'The Ministry’s participation in the 77th Republic Day celebrations.', image: rdc, alt: 'Republic Day 2026 celebration creative of the Ministry of Tribal Affairs.' },
  { id: 'tribal-research-institute', title: 'Tribal research and heritage', date: '—', caption: 'Tribal Research Institutes preserve tribal cultural heritage and support evidence-based planning.', image: tri, alt: 'A Tribal Research Institute building and a museum gallery of tribal artefacts.' },
];

export const videos = [
  { title: 'Ministry of Tribal Affairs on YouTube', url: 'https://www.youtube.com/c/MinistryofTribalAffairs/videos', note: 'All videos of the Ministry, with captions where provided by YouTube.' },
];
