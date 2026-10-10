import type { Bilingual } from './site';
import type { Fact, PersonaId } from './schemes';

// Our Divisions (DBIM "Our Groups"). One page per division, built from the
// division's description and the documents on its legacy page.

export interface Division {
  slug: string;
  title: Bilingual;
  icon: string;
  summary: Bilingual;
  about: string[];
  bullets?: string[];
  facts?: Fact[];
  factsNote?: string;
  schemes?: string[];
  portals?: { label: string; url: string }[];
  contacts?: { label: string; value: string }[];
  /** Work-area keyword used to list officers from the directory. */
  officerMatch?: RegExp;
  legacy?: { key: string; from?: RegExp; to?: RegExp; only?: RegExp; skip?: RegExp };
  personas: PersonaId[];
}

export const divisions: Division[] = [
  {
    slug: 'scholarship',
    title: { en: 'Scholarship', hi: 'छात्रवृत्ति' },
    icon: 'GraduationCap',
    summary: { en: 'Pre-matric, post-matric, top class, fellowship and overseas scholarships for about 30 lakh ST students every year.', hi: 'हर वर्ष लगभग 30 लाख अनुसूचित जनजाति छात्रों के लिए मैट्रिक-पूर्व, मैट्रिकोत्तर, टॉप क्लास, फ़ेलोशिप और प्रवासी छात्रवृत्तियां।' },
    about: [
      'The Scholarship Division provides financial assistance to States, individual beneficiaries and institutes as per scheme norms. Around 30 lakh ST students benefit under these scholarship schemes every year.',
      'The Ministry is committed to Direct Benefit Transfer (DBT): benefits are transferred directly to beneficiaries’ bank accounts, with the Public Financial Management System (PFMS) as the common platform. The National Fellowship, Top Class and National Overseas schemes are integrated with the DBT Bharat portal.',
    ],
    schemes: ['pre-matric-scholarship', 'post-matric-scholarship', 'top-class-scholarship', 'national-fellowship', 'national-overseas-scholarship'],
    portals: [
      { label: 'National Scholarship Portal', url: 'https://scholarships.gov.in/' },
      { label: 'DBT Tribal (Pre & Post Matric)', url: 'https://dbttribal.gov.in/' },
      { label: 'National Fellowship portal', url: 'https://fellowship.tribal.gov.in/' },
      { label: 'National Overseas Scholarship portal', url: 'https://overseas.tribal.gov.in/' },
    ],
    contacts: [
      { label: 'Top Class Scholarship helpdesk', value: 'edu-tribal[at]nic[dot]in' },
      { label: 'Fellowship & Overseas helpdesk', value: 'fellowship-tribal[at]nic[dot]in' },
    ],
    officerMatch: /scholarship|fellowship|overseas|DBT/i,
    legacy: { key: 'scholarship', only: /^DBT|^Guidelines & Amendments$|^Reports/i },
    personas: ['student', 'state'],
  },
  {
    slug: 'tri-research-media',
    title: { en: 'TRI, Research & Media', hi: 'टीआरआई, अनुसंधान और मीडिया' },
    icon: 'Library',
    summary: { en: 'Tribal Research Institutes, Centres of Excellence, research studies and the Ministry’s media and digital outreach.', hi: 'जनजातीय अनुसंधान संस्थान, उत्कृष्टता केंद्र, अनुसंधान अध्ययन और मंत्रालय का मीडिया व डिजिटल प्रसार।' },
    about: [
      'Tribal Research Institutes (TRIs) are the Ministry’s research bodies at State level, acting as think tanks for tribal development, preservation of cultural heritage, evidence-based planning, capacity building and awareness.',
      'Centres of Excellence of national or international repute undertake long-term, policy-oriented action research. Affirmative Action on the National Tribal Research Portal collects best practices from organisations working for tribal communities without Ministry funding.',
    ],
    facts: [
      { value: '27', label: { en: 'TRIs', hi: 'टीआरआई' } },
      { value: '38', label: { en: 'Centres of Excellence', hi: 'उत्कृष्टता केंद्र' } },
    ],
    schemes: ['support-to-tri'],
    portals: [
      { label: 'National Tribal Research Portal', url: 'https://tritribal.gov.in/' },
      { label: 'Tribal Digital Document Repository', url: 'https://repository.tribal.gov.in/' },
      { label: 'Adi Prasaran', url: 'https://adiprasaran.tribal.gov.in' },
    ],
    officerMatch: /Tribal Research Institute|TRI\b|Media|Center of Excellence/i,
    legacy: { key: 'tri-research-media' },
    personas: ['researcher', 'media'],
  },
  {
    slug: 'tribal-health',
    title: { en: 'Tribal Health', hi: 'जनजातीय स्वास्थ्य' },
    icon: 'HeartPulse',
    summary: { en: 'Health and nutrition policy for tribal communities, including the campaign to eliminate sickle cell anaemia by 2047.', hi: 'जनजातीय समुदायों के लिए स्वास्थ्य और पोषण नीति, 2047 तक सिकल सेल एनीमिया उन्मूलन अभियान सहित।' },
    about: [
      'Recognising the health challenges tribal people face due to geographical isolation, socio-economic disparities and cultural differences, the Tribal Health Cell (THC) works to bridge gaps in healthcare delivery and ensure equitable access to health services.',
      'The division guides policies tailored to tribal communities, drawing on their cultural practices, health-seeking behaviour and traditional knowledge systems. It leads awareness on Sickle Cell Disease, including the annual World Sickle Cell Day observance at AIIMS New Delhi.',
    ],
    portals: [
      { label: 'Swasthya — Tribal Health & Nutrition Portal', url: 'https://swasthya.tribal.gov.in' },
      { label: 'Sickle Cell IEC portal', url: 'https://scdiec.tribal.gov.in/' },
    ],
    officerMatch: /Tribal Health|THC/i,
    legacy: { key: 'tribal-health' },
    personas: ['citizen', 'researcher', 'ngo'],
  },
  {
    slug: 'emrs',
    title: { en: 'Eklavya Model Residential Schools', hi: 'एकलव्य मॉडल आवासीय विद्यालय' },
    icon: 'School',
    summary: { en: 'Residential schools for ST children in remote areas, on par with Navodaya Vidyalayas.', hi: 'दूरस्थ क्षेत्रों के अनुसूचित जनजाति बच्चों के लिए नवोदय विद्यालयों के समकक्ष आवासीय विद्यालय।' },
    about: [
      'EMRS started in 1997-98 to give ST children in remote areas quality education and access to higher and professional education and employment. Every block with more than 50% ST population and at least 20,000 tribal persons is to have an EMRS.',
    ],
    facts: [
      { value: '728', label: { en: 'Sanctioned', hi: 'स्वीकृत' } },
      { value: '511', label: { en: 'Functional', hi: 'कार्यरत' } },
      { value: '1,63,883', label: { en: 'Students', hi: 'छात्र' } },
    ],
    schemes: ['emrs'],
    portals: [{ label: 'NESTS', url: 'https://nests.tribal.gov.in/' }],
    officerMatch: /Eklavya|EMRS/i,
    legacy: { key: 'emrs', skip: /monitoring reports/i },
    personas: ['student', 'state'],
  },
  {
    slug: 'livelihood',
    title: { en: 'Livelihood', hi: 'आजीविका' },
    icon: 'Store',
    summary: { en: 'Tribal enterprise, minor forest produce, concessional credit and venture capital for ST entrepreneurs.', hi: 'जनजातीय उद्यम, लघु वनोपज, रियायती ऋण और अनुसूचित जनजाति उद्यमियों के लिए उद्यम पूंजी।' },
    about: [
      'The Livelihood Division runs Pradhan Mantri Janjatiya Vikas Mission (PMJVM), equity support to NSTFDC and State STFDCs for concessional loans, and the Venture Capital Fund for Scheduled Tribes.',
      'TRIFED (Tribal Cooperative Marketing Development Federation of India) and NSTFDC (National Scheduled Tribes Finance and Development Corporation) work under the Ministry in this area.',
    ],
    schemes: ['pmjvm', 'nstfdc-equity', 'vcf-st'],
    portals: [{ label: 'Tribes India (TRIFED)', url: 'https://www.tribesindia.com/' }, { label: 'NSTFDC', url: 'https://nstfdc.tribal.gov.in' }],
    officerMatch: /Livelihood|Entrepreneurship|VCF/i,
    legacy: { key: 'livelihood' },
    personas: ['entrepreneur', 'citizen'],
  },
  {
    slug: 'grants',
    title: { en: 'Grants & DAJGUA', hi: 'अनुदान और धरती आबा अभियान' },
    icon: 'HandCoins',
    summary: { en: 'Special Central Assistance (PMAAGY), Article 275(1) grants, PVTG development and Dharti Aaba Janjatiya Gram Utkarsh Abhiyan.', hi: 'विशेष केंद्रीय सहायता (पीएमएएजीवाई), अनुच्छेद 275(1) अनुदान, पीवीटीजी विकास और धरती आबा जनजातीय ग्राम उत्कर्ष अभियान।' },
    about: [
      'The Grants Division releases funds to States for tribal development under Special Central Assistance to Tribal Sub-Scheme (implemented as Pradhan Mantri Adi Adarsh Gram Yojana), grants under the Proviso to Article 275(1) of the Constitution, and the scheme for Development of PVTGs.',
      'Major infrastructure and basic amenities in tribal areas are delivered through these grants together with schemes of other Central Ministries and States, now converged under Dharti Aaba Janjatiya Gram Utkarsh Abhiyan.',
    ],
    schemes: ['pmaagy', 'article-275-1-grants', 'pvtg-development', 'da-jgua'],
    officerMatch: /Grants|DA ?-?JGUA|PMAAGY/i,
    legacy: { key: 'grants' },
    personas: ['state'],
  },
  {
    slug: 'ngo',
    title: { en: 'NGO Grants', hi: 'एनजीओ अनुदान' },
    icon: 'HandHeart',
    summary: { en: 'Grants to voluntary organisations for education, health and livelihood services in tribal areas.', hi: 'जनजातीय क्षेत्रों में शिक्षा, स्वास्थ्य और आजीविका सेवाओं हेतु स्वैच्छिक संगठनों को अनुदान।' },
    about: [
      'Voluntary organisations extend the reach of government schemes and fill critical gaps in service-deficient tribal areas. The Ministry funds them under “Grants-in-aid to Voluntary Organisations working for the welfare of STs” and “Strengthening Education among ST Girls in Low Literacy Districts”.',
    ],
    facts: [
      { value: '26', label: { en: 'States', hi: 'राज्य' } },
      { value: '5,81,900', label: { en: 'Beneficiaries', hi: 'लाभार्थी' } },
      { value: '₹60.48 cr', label: { en: 'Released', hi: 'जारी' } },
    ],
    factsNote: 'FY 2024-25 till 30 November 2024 (provisional).',
    schemes: ['ngo-grants'],
    portals: [{ label: 'NGO Grants portal', url: 'https://ngo.tribal.gov.in/' }, { label: 'NGO Darpan (NITI Aayog)', url: 'https://ngodarpan.gov.in/' }],
    contacts: [
      { label: 'Phone', value: '011-23383461, 011-23340053' },
      { label: 'Email', value: 'ngogrants-tribal[at]nic[dot]in' },
    ],
    officerMatch: /Non Gov|NGO/i,
    legacy: { key: 'ngo' },
    personas: ['ngo'],
  },
  {
    slug: 'forest-rights-act',
    title: { en: 'Forest Rights Act', hi: 'वन अधिकार अधिनियम' },
    icon: 'Trees',
    summary: { en: 'Recognition of the forest rights of forest-dwelling Scheduled Tribes and other traditional forest dwellers.', hi: 'वनवासी अनुसूचित जनजातियों और अन्य पारंपरिक वनवासियों के वन अधिकारों की मान्यता।' },
    about: [
      'The Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006 recognises the rights of forest-dwelling tribal communities and other traditional forest dwellers to forest resources on which they depend for livelihood, habitation and socio-cultural needs.',
      'The Act covers individual rights of self-cultivation and habitation, and community rights such as grazing, fishing, access to water bodies, habitat rights of PVTGs, seasonal resource access of nomadic and pastoral communities, and the right to protect, regenerate, conserve and manage community forest resources. The Gram Sabha is a highly empowered body under the Act.',
    ],
    bullets: [
      'To undo the historical injustice to forest-dwelling communities.',
      'To ensure land tenure, livelihood and food security of forest-dwelling STs and other traditional forest dwellers.',
      'To strengthen forest conservation by giving rights holders responsibility and authority for sustainable use, biodiversity conservation and ecological balance.',
    ],
    facts: [
      { value: '24,18,197', label: { en: 'Individual rights titles', hi: 'व्यक्तिगत अधिकार पत्र' } },
      { value: '1,24,162', label: { en: 'Community rights titles', hi: 'सामुदायिक अधिकार पत्र' } },
      { value: '55.0 lakh acres', label: { en: 'Area under individual rights', hi: 'व्यक्तिगत अधिकारों के अंतर्गत क्षेत्र' } },
      { value: '1.83 crore acres', label: { en: 'Area under community rights', hi: 'सामुदायिक अधिकारों के अंतर्गत क्षेत्र' } },
    ],
    factsNote: 'Figures as published on the Forest Rights Act division page.',
    portals: [{ label: 'Forest Rights Act portal', url: 'https://forestrights.nic.in/' }],
    officerMatch: /Forest Rights|FRA/i,
    legacy: { key: 'forest-rights-act' },
    personas: ['citizen', 'state', 'ngo', 'researcher'],
  },
  {
    slug: 'stc-monitoring',
    title: { en: 'STC Monitoring', hi: 'अनुसूचित जनजाति घटक निगरानी' },
    icon: 'ChartColumn',
    summary: { en: 'Monitoring the Development Action Plan for Scheduled Tribes across 41 Ministries and Departments.', hi: '41 मंत्रालयों और विभागों में अनुसूचित जनजातियों हेतु विकास कार्य योजना की निगरानी।' },
    about: [
      'The Tribal Sub-Plan, now the Development Action Plan for Scheduled Tribes (DAPST), was adopted in 1974-75 during the Fifth Five Year Plan as a strategy for developing Scheduled Tribes and areas of tribal concentration. Besides the Ministry of Tribal Affairs, 41 Ministries and Departments earmark a share of their scheme budgets for tribal development in education, health, agriculture, irrigation, roads, housing, electrification, employment and skills.',
      'DAPST aims to channel investment into tribal areas in proportion to population and to secure all-round development of tribal communities according to their needs. The Ministry monitors it online through STCMIS.',
    ],
    portals: [{ label: 'STCMIS', url: 'https://stcmis.gov.in/' }],
    officerMatch: /STC|Scheduled Tribe Component/i,
    legacy: { key: 'stc-monitoring', skip: /monitoring reports|related websites/i },
    personas: ['state', 'researcher'],
  },
  {
    slug: 'constitutional-legal-matters',
    title: { en: 'Constitutional & Legal Matters', hi: 'संवैधानिक और विधिक मामले' },
    icon: 'Gavel',
    summary: { en: 'Scheduling and de-scheduling of tribes, Scheduled Areas, PESA and related court cases.', hi: 'जनजातियों का अनुसूचीकरण और विअनुसूचीकरण, अनुसूचित क्षेत्र, पेसा और संबंधित न्यायालयी मामले।' },
    about: [
      'The division handles scheduling and de-scheduling of tribes and related court cases; the Task Force on Scheduling; Scheduled Areas; the Panchayats (Extension to the Scheduled Areas) Act; Panchayati Raj Institutions; Integrated Tribal Development Projects/Agencies; and MADA pockets and clusters.',
      'Under Article 244(1) and paragraph 6(1) of the Fifth Schedule, Scheduled Areas are areas the President declares by order after consulting the State Governor. The criteria are preponderance of tribal population, compactness and reasonable size, a viable administrative unit such as a district, block or taluk, and economic backwardness compared with neighbouring areas.',
    ],
    officerMatch: /Constitution|Legal|CLM/i,
    legacy: { key: 'constitutional-legal-matters' },
    personas: ['researcher', 'state', 'citizen'],
  },
  {
    slug: 'parliament-coordination',
    title: { en: 'Parliament & Coordination', hi: 'संसद और समन्वय' },
    icon: 'Vote',
    summary: { en: 'Parliament questions and answers, and the Ministry’s monthly summaries for the Cabinet.', hi: 'संसद प्रश्न और उत्तर, तथा मंत्रिमंडल हेतु मंत्रालय का मासिक सारांश।' },
    about: ['The division coordinates the Ministry’s parliamentary work, including replies to Parliament questions, and publishes the Monthly Summary of the Ministry’s principal activities.'],
    officerMatch: /Parliament|Coordination/i,
    legacy: { key: 'parliament-coordination' },
    personas: ['media', 'researcher'],
  },
  {
    slug: 'establishment',
    title: { en: 'Establishment', hi: 'स्थापना' },
    icon: 'Building2',
    summary: { en: 'Service matters of the Ministry’s officers and staff, and the Internal Complaints Committee.', hi: 'मंत्रालय के अधिकारियों और कर्मचारियों के सेवा मामले, तथा आंतरिक शिकायत समिति।' },
    about: [
      'The Establishment Division deals with all service matters of officers and staff of the Ministry: recruitment, promotion, pension, training nominations, leave travel concession, leave records, annual performance appraisal reports, immovable property returns, and framing and review of Recruitment Rules.',
    ],
    officerMatch: /Establishment|General Administration/i,
    legacy: { key: 'establishment' },
    personas: ['media'],
  },
  {
    slug: 'vigilance',
    title: { en: 'Vigilance', hi: 'सतर्कता' },
    icon: 'ShieldCheck',
    summary: { en: 'Vigilance administration of the Ministry and liaison with the Central Vigilance Commission.', hi: 'मंत्रालय का सतर्कता प्रशासन और केंद्रीय सतर्कता आयोग से समन्वय।' },
    about: [
      'The Ministry’s vigilance work is undertaken by the Joint Secretary (Admin), who acts as Chief Vigilance Officer and liaises with the Central Vigilance Commission (CVC), assisted by a Deputy Secretary (Admin). The Ministry observes Vigilance Awareness Week every year.',
    ],
    portals: [
      { label: 'Central Vigilance Commission', url: 'https://cvc.gov.in/' },
      { label: 'Lodge a complaint with CVC', url: 'https://portal.cvc.gov.in/' },
    ],
    officerMatch: /Vigilance/i,
    personas: ['citizen', 'media'],
  },
  {
    slug: 'statistics',
    title: { en: 'Statistics', hi: 'सांख्यिकी' },
    icon: 'ChartLine',
    summary: { en: 'Statistical profile of Scheduled Tribes, annual reports and other key reports.', hi: 'अनुसूचित जनजातियों की सांख्यिकीय रूपरेखा, वार्षिक रिपोर्ट और अन्य प्रमुख रिपोर्ट।' },
    about: ['The Statistics Division compiles data on Scheduled Tribes and publishes the Statistical Profile of STs and the Ministry’s Annual Reports.'],
    officerMatch: /Statistics/i,
    legacy: { key: 'statistics' },
    personas: ['researcher', 'media', 'student'],
  },
  {
    slug: 'finance',
    title: { en: 'Finance', hi: 'वित्त' },
    icon: 'IndianRupee',
    summary: { en: 'Integrated Finance Division: financial advice, budget, demands for grants and outcome monitoring.', hi: 'एकीकृत वित्त प्रभाग: वित्तीय सलाह, बजट, अनुदान मांगें और परिणाम निगरानी।' },
    about: [
      'The Integrated Finance (IF) Division is headed by the Joint Secretary & Financial Advisor, with a Deputy Secretary/Director and an Under Secretary supported by an Integrated Finance Unit.',
      'It tenders financial advice on all matters involving government expenditure, concurs in financial proposals of the Ministry, and prepares the Budget and related work for Grant No. 100 of the Ministry of Tribal Affairs.',
    ],
    officerMatch: /Integrated Financial|IFD|Budget/i,
    legacy: { key: 'finance' },
    personas: ['researcher', 'media', 'state'],
  },
  {
    slug: 'official-language',
    title: { en: 'Official Language', hi: 'राजभाषा' },
    icon: 'Languages',
    summary: { en: 'Translation and implementation of the Official Language Policy across the Ministry.', hi: 'मंत्रालय में अनुवाद और राजभाषा नीति का कार्यान्वयन।' },
    about: [
      'The Hindi Division is responsible for all translation work of the Ministry and for implementing the Official Language Policy of the Government of India in the Ministry and its attached and subordinate offices, as directed by the Department of Official Language.',
    ],
    portals: [{ label: 'Department of Official Language', url: 'https://rajbhasha.gov.in/' }],
    officerMatch: /Official Language|Office Language|\(OL\)/i,
    personas: ['media'],
  },
];

export function divisionBySlug(slug: string) {
  return divisions.find((d) => d.slug === slug);
}
