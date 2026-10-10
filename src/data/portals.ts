import type { Bilingual } from './site';
import type { PersonaId } from './schemes';

// Online services and portals of the Ministry (from the legacy "Portals" menu),
// shown on Offerings > Portals and in the home page "Important Links" section.

export interface Portal {
  name: Bilingual;
  url: string;
  icon: string;
  desc: string;
  personas: PersonaId[];
  featured?: boolean;
}

export const portals: Portal[] = [
  { name: { en: 'DBT Tribal — Pre & Post Matric', hi: 'डीबीटी ट्राइबल — मैट्रिक-पूर्व व मैट्रिकोत्तर' }, url: 'https://dbttribal.gov.in/', icon: 'BadgeIndianRupee', desc: 'State-wise DBT data and fund release for pre and post matric scholarships.', personas: ['student', 'state'], featured: true },
  { name: { en: 'National Fellowship', hi: 'राष्ट्रीय फ़ेलोशिप' }, url: 'https://fellowship.tribal.gov.in/', icon: 'Microscope', desc: 'Apply for and manage M.Phil/Ph.D. fellowships.', personas: ['student', 'researcher'], featured: true },
  { name: { en: 'National Overseas Scholarship', hi: 'राष्ट्रीय प्रवासी छात्रवृत्ति' }, url: 'https://overseas.tribal.gov.in/', icon: 'Plane', desc: 'Apply for scholarships to study abroad.', personas: ['student'], featured: true },
  { name: { en: 'NGO Grants', hi: 'एनजीओ अनुदान' }, url: 'https://ngo.tribal.gov.in/', icon: 'HandHeart', desc: 'Online proposals and progress reports for voluntary organisations.', personas: ['ngo'], featured: true },
  { name: { en: 'Forest Rights Act', hi: 'वन अधिकार अधिनियम' }, url: 'https://forestrights.nic.in/', icon: 'Trees', desc: 'FRA information, progress and resources.', personas: ['citizen', 'state'], featured: true },
  { name: { en: 'Performance Dashboard', hi: 'प्रदर्शन डैशबोर्ड' }, url: 'https://dashboard.tribal.gov.in/', icon: 'ChartColumn', desc: 'Real-time performance of the Ministry’s schemes.', personas: ['media', 'researcher', 'state'], featured: true },
  { name: { en: 'National Tribal Research Portal', hi: 'राष्ट्रीय जनजातीय अनुसंधान पोर्टल' }, url: 'https://tritribal.gov.in/', icon: 'Library', desc: 'TRIs, Centres of Excellence and research studies.', personas: ['researcher'], featured: true },
  { name: { en: 'Swasthya Portal', hi: 'स्वास्थ्य पोर्टल' }, url: 'https://swasthya.tribal.gov.in', icon: 'Stethoscope', desc: 'Tribal health and nutrition data and knowledge.', personas: ['researcher', 'citizen', 'ngo'], featured: true },
  { name: { en: 'STCMIS', hi: 'एसटीसीएमआईएस' }, url: 'https://stcmis.gov.in/', icon: 'ChartLine', desc: 'Scheduled Tribe Component monitoring across Ministries.', personas: ['state', 'researcher'] },
  { name: { en: 'State TSP', hi: 'राज्य टीएसपी' }, url: 'https://statetsp.tribal.gov.in/', icon: 'Map', desc: 'State Tribal Sub-Plan monitoring.', personas: ['state'] },
  { name: { en: 'ADIGRAMS', hi: 'आदिग्राम्स' }, url: 'https://grants.tribal.gov.in/', icon: 'HandCoins', desc: 'Grants management and monitoring system.', personas: ['state'] },
  { name: { en: 'SCD-IEC', hi: 'एससीडी-आईईसी' }, url: 'https://scdiec.tribal.gov.in/', icon: 'HeartPulse', desc: 'Sickle cell disease awareness materials.', personas: ['citizen', 'ngo'] },
  { name: { en: 'Tribal Digital Document Repository', hi: 'जनजातीय डिजिटल दस्तावेज़ भंडार' }, url: 'https://repository.tribal.gov.in/', icon: 'FolderOpen', desc: 'Research reports, books and documents on tribal communities.', personas: ['researcher', 'student'] },
  { name: { en: 'Tribal Repository', hi: 'जनजातीय रिपॉज़िटरी' }, url: 'https://tribal.nic.in/repository/', icon: 'Archive', desc: 'Earlier repository of documents on tribal communities and development.', personas: ['researcher'] },
  { name: { en: 'Janjatiya Garima Utsav 2026 (JJGU)', hi: 'जनजातीय गरिमा उत्सव 2026 (जेजीयू)' }, url: 'https://adiprasaran.tribal.gov.in/jjgu/', icon: 'PartyPopper', desc: 'Four weeks, four pillars: the 2026 campaign on technology, jan bhagidaari, Bhagwan Birsa Munda and education.', personas: ['citizen', 'media', 'state'] },
  { name: { en: 'Janjatiya Gaurav Divas (JJGD)', hi: 'जनजातीय गौरव दिवस (जेजीडी)' }, url: 'https://adiprasaran.tribal.gov.in/jjgd/', icon: 'Flag', desc: 'Janjatiya Gaurav Varsh: events, campaign material, photo and video galleries, and registration for volunteers and CSR partners.', personas: ['citizen', 'media', 'state'] },
  { name: { en: 'Adi Prasaran', hi: 'आदि प्रसारण' }, url: 'https://adiprasaran.tribal.gov.in', icon: 'Radio', desc: 'Digital content and outreach of the Ministry.', personas: ['media', 'citizen'] },
  { name: { en: 'Adi Karmayogi', hi: 'आदि कर्मयोगी' }, url: 'https://adiprasaran.tribal.gov.in/adikarmayogi/', icon: 'Users', desc: 'Responsive governance programme for tribal villages.', personas: ['state', 'citizen'] },
  { name: { en: 'NESTS', hi: 'नेस्ट्स' }, url: 'https://nests.tribal.gov.in/', icon: 'School', desc: 'Eklavya Model Residential Schools administration.', personas: ['student', 'state'] },
  { name: { en: 'Shram Shakti (Tribal Migration)', hi: 'श्रम शक्ति (जनजातीय प्रवास)' }, url: 'https://shramshakti.tribal.gov.in', icon: 'Route', desc: 'Data on tribal migration for planning support.', personas: ['state', 'researcher'] },
  { name: { en: 'TribeX', hi: 'ट्राइबएक्स' }, url: 'https://tribexdigital.org.in/', icon: 'Palette', desc: 'Courses and archive on tribal arts and culture.', personas: ['student', 'entrepreneur'] },
  { name: { en: '1000 Springs', hi: '1000 झरने' }, url: 'https://thespringsportal.org/', icon: 'Droplets', desc: 'GIS atlas of springs in tribal areas.', personas: ['researcher'] },
  { name: { en: 'Document Management System', hi: 'दस्तावेज़ प्रबंधन प्रणाली' }, url: 'https://tribal.gov.in/mtad/', icon: 'Files', desc: 'Ministry document management (for officials).', personas: ['state'] },
];

/** Government of India platforms GIGW asks every site to link prominently. */
export const governmentPortals = [
  { name: 'National Portal of India', url: 'https://www.india.gov.in/', logo: '/images/partners/india-gov.webp' },
  { name: 'MyGov', url: 'https://www.mygov.in/', logo: '/images/partners/mygov.webp' },
  { name: 'Open Government Data', url: 'https://data.gov.in/', logo: '/images/partners/data-gov.webp' },
  { name: 'Digital India', url: 'https://www.digitalindia.gov.in/', logo: '/images/partners/digital-india.webp' },
  { name: 'Press Information Bureau', url: 'https://pib.gov.in/', logo: '/images/partners/pib.webp' },
  { name: 'National Commission for Scheduled Tribes', url: 'https://www.ncst.nic.in/', logo: '/images/partners/ncst.webp' },
  { name: 'NSTFDC', url: 'https://nstfdc.tribal.gov.in', logo: '/images/partners/nstfdc.webp' },
  { name: 'Tribes India', url: 'https://www.tribesindia.com/', logo: '/images/partners/tribes-india.webp' },
  { name: 'NGO Darpan', url: 'https://ngodarpan.gov.in/', logo: '/images/partners/ngo-darpan.webp' },
  { name: 'India Code', url: 'https://www.indiacode.nic.in/', logo: '/images/partners/india-code.webp' },
  { name: 'Voters’ Service Portal', url: 'https://voters.eci.gov.in/', logo: '/images/partners/nvsp.webp' },
  { name: 'Utsav', url: 'https://utsav.gov.in/', logo: '/images/partners/utsav.webp' },
  { name: 'Bhuvan', url: 'https://bhuvan.nrsc.gov.in/', logo: '/images/partners/bhuvan.webp' },
  { name: 'DIAL.gov', url: 'https://dial.gov.in/', logo: '/images/partners/dial-gov.webp' },
];
