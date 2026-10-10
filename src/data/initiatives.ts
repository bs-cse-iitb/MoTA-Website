import type { Bilingual } from './site';
import type { PersonaId } from './schemes';

// Initiatives (DBIM A.1: Offerings > Initiatives). Text from the Ministry's existing initiative pages.

export interface Initiative {
  slug: string;
  title: Bilingual;
  icon: string;
  partner?: string;
  summary: Bilingual;
  about: string[];
  highlights?: string[];
  portal?: { label: string; url: string };
  legacy?: string;
  personas: PersonaId[];
}

export const initiatives: Initiative[] = [
  {
    slug: 'adi-karmayogi',
    title: { en: 'Adi Karmayogi Abhiyan', hi: 'आदि कर्मयोगी अभियान' },
    icon: 'Users',
    summary: { en: 'Responsive governance programme building a cadre of 20 lakh change leaders across 1 lakh tribal villages.', hi: '1 लाख जनजातीय गांवों में 20 लाख परिवर्तनकारी नेतृत्वकर्ताओं का कैडर तैयार करने वाला उत्तरदायी शासन कार्यक्रम।' },
    about: [
      'Adi Karmayogi Abhiyan, a Responsive Governance Programme under the Dharti Aaba Janbhagidari Abhiyan, is described by the Ministry as the world’s largest tribal grassroots leadership movement. It is building a cadre of 20 lakh committed change leaders — officers of many departments, women of self-help groups and tribal youth — towards Viksit Bharat @2047.',
      'It covers about 1 lakh tribal villages in 30 States/UTs, 550 districts and 3,000 blocks. Each village co-creates a Tribal Village Vision 2030, and Adi Sewa Kendras serve as single-window centres with a weekly Adi Sewa Hour and village-led grievance redressal.',
    ],
    highlights: ['20 lakh change leaders', '1 lakh tribal villages', '1 lakh Adi Sewa Kendras', 'Tribal Village Vision 2030'],
    portal: { label: 'Adi Karmayogi portal', url: 'https://adiprasaran.tribal.gov.in/adikarmayogi/' },
    personas: ['citizen', 'state'],
  },
  {
    slug: 'tribex',
    title: { en: 'TribeX', hi: 'ट्राइबएक्स' },
    icon: 'Palette',
    summary: { en: 'Digital learning platform with UGC-recognised courses on tribal arts, handloom, artefacts and music.', hi: 'जनजातीय कला, हथकरघा, शिल्प और संगीत पर यूजीसी-मान्यता प्राप्त पाठ्यक्रमों वाला डिजिटल लर्निंग प्लेटफ़ॉर्म।' },
    about: [
      'TribeX is a digital learning platform launched by the Ministry of Tribal Affairs to preserve and globally commercialise India’s diverse tribal traditional culture and knowledge.',
      'It offers UGC-recognised diploma programmes and certification courses on tribal paintings, handloom, artefacts and musical instruments, and a heritage archive of audio, video and literature documenting tribal festivals, socio-cultural practices and oral traditions.',
    ],
    portal: { label: 'TribeX portal', url: 'https://tribexdigital.org.in/' },
    legacy: 'initiative:tribex',
    personas: ['student', 'researcher', 'entrepreneur'],
  },
  {
    slug: 'sickle-cell',
    title: { en: 'Sickle Cell Disease Support Corner', hi: 'सिकल सेल रोग सहायता केंद्र' },
    icon: 'HeartPulse',
    summary: { en: 'Patient-powered registration, real-time data and information on sickle cell disease in tribal regions.', hi: 'जनजातीय क्षेत्रों में सिकल सेल रोग पर रोगी पंजीकरण, वास्तविक समय डेटा और जानकारी।' },
    about: [
      'Sickle Cell Disease (SCD) is a genetic condition widespread among tribal populations in India, where about 1 in 86 births among STs have SCD. Early detection and care are essential.',
      'The Ministry launched the Sickle Cell Disease Support Corner to bridge the gap between patients and health services in tribal areas: a web-based, patient-powered registration system with a real-time dashboard, self-registration and a knowledge repository on the disease and government initiatives.',
    ],
    portal: { label: 'Swasthya portal — SCD corner', url: 'https://swasthya.tribal.gov.in' },
    legacy: 'initiative:sickle-cell',
    personas: ['citizen', 'researcher', 'ngo'],
  },
  {
    slug: 'swasthya-portal',
    title: { en: 'Swasthya — Tribal Health & Nutrition Portal', hi: 'स्वास्थ्य — जनजातीय स्वास्थ्य एवं पोषण पोर्टल' },
    icon: 'Stethoscope',
    partner: 'Piramal Swasthya (Centre of Excellence for Knowledge Management)',
    summary: { en: 'One-stop portal for data, research and practice on tribal health and nutrition.', hi: 'जनजातीय स्वास्थ्य और पोषण पर डेटा, शोध और प्रथाओं का एकल पोर्टल।' },
    about: [
      'There is a wide gap between the health outcomes of India’s tribal and non-tribal populations, made worse by scarce data on the health and nutrition of tribal communities.',
      'The Centre of Excellence for Knowledge Management curates data, learnings and practices from partner Ministries, TRIs, NGOs and community organisations. Its milestones include Swasthya, the National Tribal Health Portal, and ALEKH, a newsletter on tribal health.',
    ],
    portal: { label: 'Swasthya portal', url: 'https://swasthya.tribal.gov.in' },
    legacy: 'initiative:swasthya-portal',
    personas: ['researcher', 'ngo', 'citizen'],
  },
  {
    slug: 'performance-dashboard',
    title: { en: 'Performance Dashboard', hi: 'प्रदर्शन डैशबोर्ड' },
    icon: 'ChartColumn',
    partner: 'NIC Centre of Excellence for Data Analytics',
    summary: { en: '“Empowering Tribals, Transforming India” — real-time performance of the Ministry’s schemes.', hi: '“जनजातीय सशक्तिकरण, भारत परिवर्तन” — मंत्रालय की योजनाओं का वास्तविक समय प्रदर्शन।' },
    about: [
      'The performance dashboard “Empowering Tribals, Transforming India” is part of the Digital India initiative. It is an interactive platform showing real-time details of the Ministry’s schemes and initiatives, including five scholarship schemes, functional EMRS, and the Scheduled Tribe Component spending of 41 Ministries.',
    ],
    portal: { label: 'Open the dashboard', url: 'https://dashboard.tribal.gov.in/' },
    legacy: 'initiative:performance-dashboard',
    personas: ['media', 'researcher', 'state'],
  },
  {
    slug: 'goal',
    title: { en: 'GOAL — Going Online as Leaders', hi: 'गोल — गोइंग ऑनलाइन ऐज़ लीडर्स' },
    icon: 'Laptop',
    partner: 'Meta (Facebook)',
    summary: { en: 'Digital skilling and mentorship for tribal youth by leaders from industry and public life.', hi: 'उद्योग और सार्वजनिक जीवन के नेतृत्वकर्ताओं द्वारा जनजातीय युवाओं का डिजिटल कौशल और मार्गदर्शन।' },
    about: [
      'Going Online as Leaders (GOAL) was launched by the Ministry with Facebook on 15 May 2020 to digitally skill and empower 5,000 tribal youth over five years, mentored by accomplished people from industry, policy and public life.',
      'A pilot in 2019 mentored 100 tribal girls through 25 women leaders across Madhya Pradesh, Jharkhand, West Bengal, Odisha and Maharashtra.',
    ],
    portal: { label: 'GOAL portal', url: 'https://goal.tribal.gov.in/' },
    legacy: 'initiative:goal',
    personas: ['student', 'entrepreneur'],
  },
  {
    slug: 'geet',
    title: { en: 'GEET — GIS-Enabled Entitlement Tracking', hi: 'गीत — जीआईएस-सक्षम पात्रता ट्रैकिंग' },
    icon: 'Map',
    partner: 'UNDP',
    summary: { en: 'Maps households to the welfare entitlements they are eligible for, on a single platform.', hi: 'परिवारों को उनकी पात्र कल्याणकारी सुविधाओं से एक ही मंच पर जोड़ता है।' },
    about: [
      'Many tribal households miss welfare benefits for lack of information on eligibility. GEET, a joint initiative of UNDP and the Ministry, connects beneficiaries with their eligible entitlements across Central and State schemes, and lets administrators track outreach.',
    ],
    legacy: 'initiative:geet',
    personas: ['citizen', 'state', 'ngo'],
  },
  {
    slug: '1000-springs',
    title: { en: '1000 Springs Initiative', hi: '1000 झरने पहल' },
    icon: 'Droplets',
    partner: 'UNDP',
    summary: { en: 'Harnessing perennial springs to bring safe water to remote tribal habitations.', hi: 'दूरस्थ जनजातीय बस्तियों तक सुरक्षित पानी पहुंचाने के लिए बारहमासी झरनों का उपयोग।' },
    about: [
      'Many tribal communities, especially PVTGs, live in hilly terrain where water is scarce. The 1000 Springs Initiative of the Ministry and UNDP harnesses perennial springs to meet their water needs.',
      'More than 400 springs in four tribal-majority districts of Odisha have been mapped into an online GIS Spring Atlas. The initiative is being scaled up to tribal regions of Jharkhand, Chhattisgarh and Madhya Pradesh in the Eastern Ghats.',
    ],
    portal: { label: 'Springs portal', url: 'https://thespringsportal.org/' },
    legacy: 'initiative:1000-springs',
    personas: ['citizen', 'researcher', 'ngo'],
  },
  {
    slug: 'ice-stupa',
    title: { en: 'Ice Stupa', hi: 'आइस स्तूप' },
    icon: 'Snowflake',
    partner: "Students' Educational and Cultural Movement of Ladakh (SECMOL)",
    summary: { en: 'Artificial glaciers that store winter water for spring irrigation in Ladakh’s cold desert.', hi: 'लद्दाख के ठंडे रेगिस्तान में वसंत की सिंचाई हेतु शीतकालीन पानी संचित करने वाले कृत्रिम हिमनद।' },
    about: [
      'Ladakh is a trans-Himalayan cold desert with about 100 mm of annual precipitation, leaving villages short of water in April and May when newly sown fields need it most.',
      'With SECMOL, the Ministry started a two-year action research project to build Ice Stupas in 50 villages. These dome-shaped ice structures store unused winter water, which melts in summer to feed farms and households.',
    ],
    legacy: 'initiative:ice-stupa',
    personas: ['citizen', 'researcher'],
  },
  {
    slug: 'model-village',
    title: { en: 'Model Village (Aadarsh Gram)', hi: 'आदर्श ग्राम' },
    icon: 'House',
    partner: 'BAIF Development Research Foundation',
    summary: { en: 'Holistic village development under Saansad Adarsh Gram Yojana in a tribal gram panchayat.', hi: 'सांसद आदर्श ग्राम योजना के अंतर्गत एक जनजातीय ग्राम पंचायत का समग्र विकास।' },
    about: [
      'The Holistic Village Development Programme under Saansad Adarsh Gram Yojana transforms an adopted village through work on water, agriculture, livestock, health, gender and livelihoods.',
      'In the Malsamot group gram panchayat of Narmada district, Gujarat — ten villages with a 98% tribal population — the programme strengthens land and forest-based livelihoods, soil and water conservation, alternative income and value chains, and tribal heritage systems.',
    ],
    legacy: 'initiative:model-village',
    personas: ['citizen', 'ngo', 'state'],
  },
  {
    slug: 'telemedicine',
    title: { en: 'Tribal Healers & Telemedicine', hi: 'जनजातीय चिकित्सक और टेलीमेडिसिन' },
    icon: 'Hospital',
    partner: 'AIIMS Jodhpur',
    summary: { en: 'Tele-consultation for remote tribal areas of Sirohi, Rajasthan, working with traditional healers.', hi: 'पारंपरिक चिकित्सकों के साथ राजस्थान के सिरोही के दूरस्थ जनजातीय क्षेत्रों में टेली-परामर्श।' },
    about: [
      'AIIMS Jodhpur, as a Centre of Excellence, started tele-consultation at the tribal-dominated Community Health Centre at Abu Road, Sirohi district, Rajasthan.',
      'From June to November 2020 the team met more than 513 traditional healers (bhopas) across 153 villages and surveyed 989 tribal people to plan an extension to seven more tribal districts of the State.',
    ],
    legacy: 'initiative:telemedicine',
    personas: ['citizen', 'researcher'],
  },
  {
    slug: 'pri-awareness',
    title: { en: 'PRI Awareness Programme', hi: 'पंचायती राज संस्था जागरूकता कार्यक्रम' },
    icon: 'Vote',
    partner: 'IIPA, UNDP and SCSTRTI Odisha',
    summary: { en: 'Capacity building of tribal Panchayati Raj representatives on rights, schemes and decision-making.', hi: 'अधिकारों, योजनाओं और निर्णय-प्रक्रिया पर जनजातीय पंचायती राज प्रतिनिधियों का क्षमता निर्माण।' },
    about: [
      'The Ministry launched a capacity building and awareness programme to strengthen the decision-making of tribal Panchayati Raj representatives, with a focus on the constitutional and legal provisions that protect tribal rights.',
      'The national training framework and modules were developed with the Indian Institute of Public Administration, UNDP and SCSTRTI Odisha.',
    ],
    legacy: 'initiative:pri-awareness',
    personas: ['citizen', 'state', 'ngo'],
  },
  {
    slug: 'atmanirbhar-bharat',
    title: { en: 'Aatmanirbhar Bharat — Tribal Enterprise', hi: 'आत्मनिर्भर भारत — जनजातीय उद्यम' },
    icon: 'Sprout',
    summary: { en: 'Natural farming and entrepreneurship programmes that make tribal farmers and enterprises self-reliant.', hi: 'जनजातीय किसानों और उद्यमों को आत्मनिर्भर बनाने वाले प्राकृतिक खेती और उद्यमिता कार्यक्रम।' },
    about: [
      'With the Sri Sri Institute of Agricultural Sciences and Technology, the Ministry set up a Centre of Excellence for natural farming to train 10,000 tribal farmers and link them to markets.',
      'On 2 October 2020 the Ministry and ASSOCHAM launched a three-year Tribal Entrepreneurship Development Programme for the socio-economic development of tribal groups.',
    ],
    legacy: 'initiative:atmanirbhar-bharat',
    personas: ['entrepreneur', 'citizen'],
  },
  {
    slug: 'gap-analysis',
    title: { en: 'Gap Analysis (Mission Antyodaya)', hi: 'अंतर विश्लेषण (मिशन अंत्योदय)' },
    icon: 'ChartBar',
    summary: { en: 'Village-level gap analysis of infrastructure and services using Mission Antyodaya survey data.', hi: 'मिशन अंत्योदय सर्वेक्षण डेटा से गांव-स्तरीय अवसंरचना और सेवाओं का अंतर विश्लेषण।' },
    about: [
      'Mission Antyodaya is an accountability and convergence framework for resources of 27 Ministries and Departments for rural development. Its annual Gram Panchayat survey gives infrastructure, facilities, ranking and score-card reports.',
      'The Ministry uses this data to identify gaps in tribal villages and plan convergent action.',
    ],
    legacy: 'initiative:gap-analysis',
    personas: ['state', 'researcher'],
  },
];

export function initiativeBySlug(slug: string) {
  return initiatives.find((i) => i.slug === slug);
}
