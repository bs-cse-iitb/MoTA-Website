import type { Bilingual } from './site';

// Schemes and Services (DBIM A.5.2.1): L2 listing + one L3 page per scheme.
// Text is taken from the Ministry's existing scheme pages; figures carry the
// "as on" date published there. Document lists are pulled from the legacy page
// named in `legacy` (see src/lib/legacy.ts).

export type SchemeCategory = 'education' | 'livelihood' | 'development' | 'research' | 'partnership';
export type PersonaId = 'student' | 'citizen' | 'researcher' | 'ngo' | 'state' | 'entrepreneur' | 'media';

export interface Fact { value: string; label: Bilingual; }

export interface Scheme {
  slug: string;
  title: Bilingual;
  short: string;
  summary: Bilingual;
  category: SchemeCategory;
  type: 'Centrally Sponsored' | 'Central Sector' | 'Mission' | 'Grant' | 'Special Area Programme';
  icon: string;
  personas: PersonaId[];
  facts?: Fact[];
  factsNote?: string;
  overview: string[];
  features?: string[];
  apply?: { label: string; url: string };
  portals?: { label: string; url: string }[];
  legacy?: { key: string; from?: RegExp; to?: RegExp; only?: RegExp; skip?: RegExp };
  division?: string;
}

export const categoryLabels: Record<SchemeCategory, Bilingual> = {
  education: { en: 'Education & Scholarships', hi: 'शिक्षा और छात्रवृत्ति' },
  livelihood: { en: 'Livelihood & Entrepreneurship', hi: 'आजीविका और उद्यमिता' },
  development: { en: 'Area & Infrastructure Development', hi: 'क्षेत्र और अवसंरचना विकास' },
  research: { en: 'Research, Culture & Health', hi: 'अनुसंधान, संस्कृति और स्वास्थ्य' },
  partnership: { en: 'Partnerships & Grants', hi: 'भागीदारी और अनुदान' },
};

const SCHOLARSHIP_NOTE = 'Figures: amount released and beneficiaries till 31 March 2025, as published by the Scholarship Division.';

export const schemes: Scheme[] = [
  {
    slug: 'pm-janman',
    title: { en: 'PM Janjati Adivasi Nyaya Maha Abhiyan (PM-JANMAN)', hi: 'प्रधानमंत्री जनजाति आदिवासी न्याय महा अभियान (पीएम-जनमन)' },
    short: 'PM-JANMAN',
    summary: {
      en: 'Saturating Particularly Vulnerable Tribal Group (PVTG) families and habitations with housing, water, roads, health, education, power and livelihoods.',
      hi: 'विशेष रूप से कमज़ोर जनजातीय समूहों (पीवीटीजी) के परिवारों और बस्तियों को आवास, पानी, सड़क, स्वास्थ्य, शिक्षा, बिजली और आजीविका से संतृप्त करना।',
    },
    category: 'development',
    type: 'Mission',
    icon: 'Tent',
    personas: ['citizen', 'state'],
    facts: [
      { value: '75', label: { en: 'PVTG communities', hi: 'पीवीटीजी समुदाय' } },
      { value: '18 + 1', label: { en: 'States and UT', hi: 'राज्य और केंद्र शासित प्रदेश' } },
      { value: '11', label: { en: 'Interventions', hi: 'हस्तक्षेप' } },
      { value: '9', label: { en: 'Line Ministries', hi: 'संबद्ध मंत्रालय' } },
    ],
    overview: [
      "During FY 2023-24, Hon'ble Prime Minister launched the Pradhan Mantri Janjati Adivasi Nyaya Maha Abhiyan (PM-JANMAN) for the socio-economic development of 75 PVTG communities residing in 18 States and one Union Territory.",
      'The mission aims to provide basic facilities such as safe housing, clean drinking water, improved access to education, health and nutrition, road and telecom connectivity, electrification of unelectrified households and sustainable livelihood opportunities in three years, through 11 interventions implemented by 9 line Ministries.',
    ],
    features: [
      'Saturation of PVTG families and habitations with basic facilities and services.',
      'Convergence of schemes of line Ministries such as Rural Development (PMAY-G housing, PMGSY roads), Jal Shakti, Health & Family Welfare and New & Renewable Energy.',
      'Progress tracked on the PM-JANMAN dashboard and PM Gati Shakti portal.',
    ],
    legacy: { key: 'pm-janman' },
  },
  {
    slug: 'da-jgua',
    title: { en: 'Dharti Aaba Janjatiya Gram Utkarsh Abhiyan (DAJGUA)', hi: 'धरती आबा जनजातीय ग्राम उत्कर्ष अभियान' },
    short: 'DAJGUA',
    summary: {
      en: 'Whole-of-government mission to close infrastructure and service gaps in 63,843 tribal-majority villages through 25 interventions of 17 Ministries.',
      hi: '17 मंत्रालयों के 25 हस्तक्षेपों के माध्यम से 63,843 जनजातीय बहुल गांवों में अवसंरचना और सेवाओं की कमी दूर करने का संपूर्ण-सरकार मिशन।',
    },
    category: 'development',
    type: 'Mission',
    icon: 'Sprout',
    personas: ['citizen', 'state'],
    facts: [
      { value: '63,843', label: { en: 'Villages', hi: 'गांव' } },
      { value: '5 crore+', label: { en: 'Tribal people to benefit', hi: 'लाभान्वित जनजातीय लोग' } },
      { value: '25', label: { en: 'Interventions', hi: 'हस्तक्षेप' } },
      { value: '17', label: { en: 'Line Ministries', hi: 'संबद्ध मंत्रालय' } },
    ],
    overview: [
      "Hon'ble Prime Minister launched the Dharti Aaba Janjatiya Gram Utkarsh Abhiyan on 2 October 2024. It comprises 25 interventions implemented by 17 line Ministries and aims to saturate infrastructural gaps in 63,843 villages, improve access to health, education and Anganwadi facilities, and provide livelihood opportunities benefiting more than 5 crore tribal people in 549 districts and 2,911 blocks across 30 States/UTs in five years.",
      'The Abhiyan follows a multi-sectoral approach, using existing schemes and funds under the Development Action Plan for Scheduled Tribes (DAPST) through convergence, with each Ministry allocated budget and targets for its intervention.',
    ],
    features: [
      'Covers villages with a population of 500 or more and at least 50% tribal residents, and villages in Aspirational Districts with a tribal population of 50 or more.',
      'Saturation through convergence and outreach.',
      'Five-year mission with Ministry-wise budgets and targets.',
    ],
    legacy: { key: 'da-jgua' },
    division: 'grants',
  },
  {
    slug: 'emrs',
    title: { en: 'Eklavya Model Residential Schools (EMRS)', hi: 'एकलव्य मॉडल आवासीय विद्यालय (ईएमआरएस)' },
    short: 'EMRS',
    summary: {
      en: 'Quality residential schooling for ST children in remote areas, on par with Navodaya Vidyalayas, with focus on academics, sports and culture.',
      hi: 'दूरस्थ क्षेत्रों के अनुसूचित जनजाति बच्चों के लिए नवोदय विद्यालयों के समकक्ष गुणवत्तापूर्ण आवासीय शिक्षा।',
    },
    category: 'education',
    type: 'Central Sector',
    icon: 'School',
    personas: ['student', 'citizen', 'state'],
    facts: [
      { value: '728', label: { en: 'Schools sanctioned', hi: 'स्वीकृत विद्यालय' } },
      { value: '511', label: { en: 'Schools functional', hi: 'कार्यरत विद्यालय' } },
      { value: '1,63,883', label: { en: 'Students enrolled', hi: 'नामांकित छात्र' } },
      { value: '83,159', label: { en: 'Girls enrolled', hi: 'नामांकित छात्राएं' } },
    ],
    factsNote: 'Figures as published on the EMRS division page.',
    overview: [
      'EMRS started in 1997-98 to impart quality education to ST children in remote areas, enabling them to access opportunities in higher and professional education and employment in various sectors. The schools focus not only on academics but on the all-round development of students.',
      'Every block with more than 50% ST population and at least 20,000 tribal persons is to have an EMRS. Eklavya schools are on par with Navodaya Vidyalayas and have special facilities for preserving local art and culture and for training in sports and skill development.',
    ],
    features: [
      'Eklavya Model Day Boarding Schools (EMDBS) in sub-districts with 90% or more ST population.',
      'Centres of Excellence for Sports with specialised facilities for one identified individual sport and one team sport.',
      'Implemented through the National Education Society for Tribal Students (NESTS).',
    ],
    portals: [{ label: 'NESTS portal', url: 'https://nests.tribal.gov.in/' }],
    legacy: { key: 'emrs', skip: /monitoring reports|grievances/i },
    division: 'emrs',
  },
  {
    slug: 'post-matric-scholarship',
    title: { en: 'Post Matric Scholarship for ST Students', hi: 'अनुसूचित जनजाति छात्रों के लिए मैट्रिकोत्तर छात्रवृत्ति' },
    short: 'Post Matric Scholarship',
    summary: {
      en: 'Financial support to ST students studying beyond Class X, paid directly to their bank accounts through DBT.',
      hi: 'कक्षा 10 के बाद पढ़ रहे अनुसूचित जनजाति छात्रों को डीबीटी के माध्यम से सीधे बैंक खाते में वित्तीय सहायता।',
    },
    category: 'education',
    type: 'Centrally Sponsored',
    icon: 'GraduationCap',
    personas: ['student', 'state'],
    facts: [
      { value: '₹2,598.34 cr', label: { en: 'Released', hi: 'जारी राशि' } },
      { value: '15,75,449', label: { en: 'Beneficiaries', hi: 'लाभार्थी' } },
      { value: '30', label: { en: 'States/UTs funded', hi: 'अनुदान प्राप्त राज्य/संघ राज्य क्षेत्र' } },
    ],
    factsNote: SCHOLARSHIP_NOTE,
    overview: [
      'A Centrally Sponsored Scheme implemented through States/UTs, who invite applications online through the State portal or the National Scholarship Portal, verify eligibility and disburse the scholarship directly to the bank accounts of eligible ST students through DBT.',
      'Funds are released by the Ministry to State Governments/UTs based on proposals comprising the Statement of Expenditure, Utilisation Certificate and beneficiary data uploaded on the DBT portal.',
    ],
    apply: { label: 'Apply on the National Scholarship Portal', url: 'https://scholarships.gov.in/' },
    portals: [{ label: 'DBT Tribal portal (for States)', url: 'https://dbttribal.gov.in/' }],
    legacy: { key: 'scholarship', from: /^Post Matric/i, to: /^National Scholarship Scheme/i },
    division: 'scholarship',
  },
  {
    slug: 'pre-matric-scholarship',
    title: { en: 'Pre Matric Scholarship for ST Students', hi: 'अनुसूचित जनजाति छात्रों के लिए मैट्रिक-पूर्व छात्रवृत्ति' },
    short: 'Pre Matric Scholarship',
    summary: {
      en: 'Scholarship for ST students of Classes IX and X whose parental income is up to ₹2.5 lakh a year.',
      hi: 'कक्षा 9 और 10 के अनुसूचित जनजाति छात्रों के लिए छात्रवृत्ति, जिनके माता-पिता की वार्षिक आय ₹2.5 लाख तक है।',
    },
    category: 'education',
    type: 'Centrally Sponsored',
    icon: 'BookOpen',
    personas: ['student', 'state'],
    facts: [
      { value: '₹163.69 cr', label: { en: 'Released', hi: 'जारी राशि' } },
      { value: '4,92,227', label: { en: 'Beneficiaries', hi: 'लाभार्थी' } },
      { value: '15', label: { en: 'States/UTs funded', hi: 'अनुदान प्राप्त राज्य/संघ राज्य क्षेत्र' } },
    ],
    factsNote: SCHOLARSHIP_NOTE,
    overview: [
      'A Centrally Sponsored Scheme implemented through States/UTs, who invite applications online through the State portal or the National Scholarship Portal, verify eligibility and pay the scholarship directly into students’ bank accounts through DBT.',
    ],
    features: [
      'For students studying in Classes IX and X.',
      'Parental income from all sources should not exceed ₹2.50 lakh per annum.',
      'Paid at ₹225 per month for day scholars and ₹525 per month for hostellers, for 10 months a year.',
      'Funds shared 75:25 between the Centre and States/UTs; 90:10 for North Eastern and special category States/UTs (UT of Jammu & Kashmir, Himachal Pradesh and Uttarakhand); 100% central grant for UTs without legislature.',
    ],
    apply: { label: 'Apply on the National Scholarship Portal', url: 'https://scholarships.gov.in/' },
    portals: [{ label: 'DBT Tribal portal (for States)', url: 'https://dbttribal.gov.in/' }],
    legacy: { key: 'scholarship', from: /^Pre Matric/i, to: /^Post Matric/i },
    division: 'scholarship',
  },
  {
    slug: 'top-class-scholarship',
    title: { en: 'National Scholarship (Top Class) for Higher Education of ST Students', hi: 'अनुसूचित जनजाति छात्रों की उच्च शिक्षा हेतु राष्ट्रीय छात्रवृत्ति (टॉप क्लास)' },
    short: 'Top Class Scholarship',
    summary: {
      en: 'Full support for ST students admitted to premier institutes such as IITs, AIIMS, IIMs and NITs identified by the Ministry.',
      hi: 'मंत्रालय द्वारा चिन्हित आईआईटी, एम्स, आईआईएम और एनआईटी जैसे प्रमुख संस्थानों में प्रवेश लेने वाले अनुसूचित जनजाति छात्रों को सहायता।',
    },
    category: 'education',
    type: 'Central Sector',
    icon: 'Award',
    personas: ['student'],
    facts: [
      { value: '₹95.38 cr', label: { en: 'Released', hi: 'जारी राशि' } },
      { value: '7,013', label: { en: 'Beneficiaries', hi: 'लाभार्थी' } },
    ],
    factsNote: SCHOLARSHIP_NOTE,
    overview: [
      'A Central Sector Scheme fully funded and implemented by the Central Government. The scholarship is given to ST students pursuing higher studies in prescribed courses at premier institutes of the country, such as IITs, AIIMS, IIMs and NITs, identified by the Ministry. Preference is given to girls, Divyang students and PVTGs.',
    ],
    apply: { label: 'Apply on the National Scholarship Portal', url: 'https://scholarships.gov.in/' },
    legacy: { key: 'scholarship', from: /^National Scholarship Scheme/i, to: /^National Fellowship/i },
    division: 'scholarship',
  },
  {
    slug: 'national-fellowship',
    title: { en: 'National Fellowship for Higher Education of ST Students', hi: 'अनुसूचित जनजाति छात्रों की उच्च शिक्षा हेतु राष्ट्रीय फ़ेलोशिप' },
    short: 'National Fellowship',
    summary: {
      en: 'Fellowships for ST students pursuing M.Phil and Ph.D., managed end to end on the National Fellowship portal.',
      hi: 'एम.फिल और पीएच.डी. करने वाले अनुसूचित जनजाति छात्रों के लिए फ़ेलोशिप, राष्ट्रीय फ़ेलोशिप पोर्टल के माध्यम से।',
    },
    category: 'education',
    type: 'Central Sector',
    icon: 'Microscope',
    personas: ['student', 'researcher'],
    facts: [
      { value: '₹144.62 cr', label: { en: 'Released', hi: 'जारी राशि' } },
      { value: '2,698', label: { en: 'Beneficiaries', hi: 'लाभार्थी' } },
    ],
    factsNote: SCHOLARSHIP_NOTE,
    overview: [
      'A Central Sector Scheme fully funded and implemented by the Central Government for ST students pursuing M.Phil and Ph.D.',
      'Students and universities register on the National Fellowship portal, which has a built-in module for queries and grievances. Help is also available by email at fellowship-tribal[at]nic[dot]in.',
    ],
    apply: { label: 'Go to the National Fellowship portal', url: 'https://fellowship.tribal.gov.in/' },
    legacy: { key: 'scholarship', from: /^National Fellowship/i, to: /^National Overseas/i },
    division: 'scholarship',
  },
  {
    slug: 'national-overseas-scholarship',
    title: { en: 'National Overseas Scholarship for ST Students', hi: 'अनुसूचित जनजाति छात्रों के लिए राष्ट्रीय प्रवासी छात्रवृत्ति' },
    short: 'National Overseas Scholarship',
    summary: {
      en: 'Financial assistance for selected ST students to pursue Master’s, Ph.D. and post-doctoral study abroad.',
      hi: 'चयनित अनुसूचित जनजाति छात्रों को विदेश में स्नातकोत्तर, पीएच.डी. और पोस्ट-डॉक्टरल अध्ययन हेतु वित्तीय सहायता।',
    },
    category: 'education',
    type: 'Central Sector',
    icon: 'Plane',
    personas: ['student'],
    facts: [
      { value: '₹6.00 cr', label: { en: 'Released', hi: 'जारी राशि' } },
      { value: '58', label: { en: 'Beneficiaries', hi: 'लाभार्थी' } },
    ],
    factsNote: SCHOLARSHIP_NOTE,
    overview: [
      'The scheme provides financial assistance to selected ST students to pursue post-graduation, Ph.D. and post-doctoral study abroad. Applications, selection and grievances are handled on the National Overseas Scholarship portal.',
    ],
    apply: { label: 'Go to the National Overseas portal', url: 'https://overseas.tribal.gov.in/' },
    legacy: { key: 'scholarship', from: /^National Overseas/i, to: /^DBT$/i },
    division: 'scholarship',
  },
  {
    slug: 'pmjvm',
    title: { en: 'Pradhan Mantri Janjatiya Vikas Mission (PMJVM)', hi: 'प्रधानमंत्री जनजातीय विकास मिशन (पीएमजेवीएम)' },
    short: 'PMJVM',
    summary: {
      en: 'Strengthens tribal entrepreneurship and livelihoods built on minor forest produce, farm and non-farm products. TRIFED is the nodal agency.',
      hi: 'लघु वनोपज, कृषि और गैर-कृषि उत्पादों पर आधारित जनजातीय उद्यमिता और आजीविका को सुदृढ़ करना। ट्राइफेड नोडल एजेंसी है।',
    },
    category: 'livelihood',
    type: 'Central Sector',
    icon: 'Store',
    personas: ['entrepreneur', 'citizen', 'state'],
    overview: [
      'Formulated by merging two earlier schemes for tribal livelihoods: “Mechanism for Marketing of Minor Forest Produce (MFP) through Minimum Support Price (MSP) and Development of Value Chain for MFP” and “Institutional Support for Development and Marketing of Tribal Products/Produce”.',
      'From 2021-22 to 2025-26, PMJVM aims to strengthen tribal entrepreneurship and facilitate livelihood opportunities by promoting efficient, equitable, self-managed and optimum use of natural resources and MFP, farm and non-farm, tribal product-based enterprises. TRIFED is the nodal implementing agency.',
    ],
    portals: [{ label: 'Tribes India (TRIFED)', url: 'https://www.tribesindia.com/' }],
    legacy: { key: 'livelihood', skip: /^(archives)$/i },
    division: 'livelihood',
  },
  {
    slug: 'vcf-st',
    title: { en: 'Venture Capital Fund for Scheduled Tribes (VCF-ST)', hi: 'अनुसूचित जनजातियों के लिए उद्यम पूंजी कोष (वीसीएफ-एसटी)' },
    short: 'VCF-ST',
    summary: {
      en: 'Concessional finance and incubation support for start-up ideas by ST youth, managed by IFCI Venture Capital Funds Ltd.',
      hi: 'अनुसूचित जनजाति युवाओं के स्टार्ट-अप विचारों हेतु रियायती वित्त और इन्क्यूबेशन सहायता, आईएफसीआई वेंचर कैपिटल फंड्स लि. द्वारा प्रबंधित।',
    },
    category: 'livelihood',
    type: 'Central Sector',
    icon: 'Rocket',
    personas: ['entrepreneur', 'student'],
    overview: [
      'Approved in 2021-22, the scheme promotes entrepreneurship among Scheduled Tribes and provides concessional finance to them. It is a social sector initiative to support and incubate start-up ideas by ST youth, managed by IFCI Venture Capital Funds Ltd.',
    ],
    legacy: { key: 'livelihood', only: /venture|vcf/i },
    division: 'livelihood',
  },
  {
    slug: 'nstfdc-equity',
    title: { en: 'Equity Support to NSTFDC and State STFDCs', hi: 'एनएसटीएफडीसी और राज्य एसटीएफडीसी को इक्विटी सहायता' },
    short: 'Concessional loans (NSTFDC)',
    summary: {
      en: 'Equity from the Ministry funds concessional loans to eligible STs through NSTFDC and State channelising agencies.',
      hi: 'मंत्रालय की इक्विटी से एनएसटीएफडीसी और राज्य चैनलाइज़िंग एजेंसियों के माध्यम से पात्र अनुसूचित जनजातियों को रियायती ऋण।',
    },
    category: 'livelihood',
    type: 'Central Sector',
    icon: 'IndianRupee',
    personas: ['entrepreneur', 'citizen'],
    overview: [
      'The Ministry releases funds as equity share capital to NSTFDC and State Scheduled Tribes Finance and Development Corporations (STFDCs), which is deployed to give concessional loans to eligible members of Scheduled Tribes.',
      'NSTFDC lends through State Channelising Agencies nominated by State Governments, certain public sector and co-operative banks, Regional Rural Banks, NCDC, Stree Nidhi, NEDFi and NABKISAN Finance Ltd. Its schemes include Term Loan, Adivasi Mahila Sashaktikaran Yojana, Adivasi Shiksha Rinn Yojana (education loans) and micro-credit for ST self-help groups.',
    ],
    portals: [{ label: 'NSTFDC website', url: 'https://nstfdc.tribal.gov.in' }],
    legacy: { key: 'nstfdc' },
    division: 'livelihood',
  },
  {
    slug: 'pmaagy',
    title: { en: 'Pradhan Mantri Adi Adarsh Gram Yojana (PMAAGY)', hi: 'प्रधानमंत्री आदि आदर्श ग्राम योजना (पीएमएएजीवाई)' },
    short: 'PMAAGY',
    summary: {
      en: 'Integrated development of villages with significant tribal population, implemented under Special Central Assistance to Tribal Sub-Scheme.',
      hi: 'उल्लेखनीय जनजातीय आबादी वाले गांवों का एकीकृत विकास, जनजातीय उप-योजना हेतु विशेष केंद्रीय सहायता के अंतर्गत।',
    },
    category: 'development',
    type: 'Special Area Programme',
    icon: 'House',
    personas: ['state', 'citizen'],
    overview: [
      'Special Central Assistance to Tribal Sub-Scheme (SCA to TSS) is part of the Umbrella Scheme for Development of Scheduled Tribes, a “core of the core” scheme. It supplements the efforts of State Governments for the development and welfare of tribal people.',
      'Grants are released to States with notified STs, based on proposals received, and are implemented as Pradhan Mantri Adi Adarsh Gram Yojana for the integrated development of villages with significant tribal population.',
    ],
    legacy: { key: 'grants', from: /^Special Central/i, to: /^Grants-in-aid/i },
    division: 'grants',
  },
  {
    slug: 'article-275-1-grants',
    title: { en: 'Grants under Proviso to Article 275(1) of the Constitution', hi: 'संविधान के अनुच्छेद 275(1) के परंतुक के अंतर्गत अनुदान' },
    short: 'Article 275(1) Grants',
    summary: {
      en: '100% annual grants to States to bridge the development gap between Scheduled Tribes and others.',
      hi: 'अनुसूचित जनजातियों और अन्य के बीच विकास अंतर को पाटने हेतु राज्यों को 100% वार्षिक अनुदान।',
    },
    category: 'development',
    type: 'Grant',
    icon: 'Scale',
    personas: ['state'],
    overview: [
      'Grants-in-aid under the Proviso to Article 275(1) of the Constitution of India are 100% annual grants from the Government of India to States, charged to the Consolidated Fund of India (except grants for North Eastern States, which are a voted item).',
      'Programmes funded with these grants aim to bridge the gap between the ST population and others by accelerating the development of STs. The grants are an addition to State efforts for tribal development and must address critical gaps.',
    ],
    legacy: { key: 'grants', from: /^Grants-in-aid/i, to: /^Scheme for Development of PVTG/i },
    division: 'grants',
  },
  {
    slug: 'pvtg-development',
    title: { en: 'Development of Particularly Vulnerable Tribal Groups (PVTGs)', hi: 'विशेष रूप से कमज़ोर जनजातीय समूहों (पीवीटीजी) का विकास' },
    short: 'PVTG Development',
    summary: {
      en: 'Need-based, comprehensive development of PVTGs living in remote, scattered habitats while retaining their culture and heritage.',
      hi: 'दूरस्थ, बिखरी बस्तियों में रहने वाले पीवीटीजी का उनकी संस्कृति और विरासत को बनाए रखते हुए आवश्यकता-आधारित व्यापक विकास।',
    },
    category: 'development',
    type: 'Central Sector',
    icon: 'Footprints',
    personas: ['state', 'citizen', 'researcher'],
    overview: [
      'PVTGs are the most vulnerable section among tribal communities and largely live in isolated, remote and difficult areas in small, scattered hamlets. The scheme plans their socio-economic development comprehensively while retaining their culture and heritage.',
      'It follows a need-based strategy that optimises resources available under various programmes and aims at specific outcomes, funding activities such as housing, education, health, livelihood and connectivity.',
    ],
    legacy: { key: 'grants', from: /^Scheme for Development of PVTG/i },
    division: 'grants',
  },
  {
    slug: 'ngo-grants',
    title: { en: 'Grants-in-aid to Voluntary Organisations working for STs', hi: 'अनुसूचित जनजातियों हेतु कार्यरत स्वैच्छिक संगठनों को सहायता अनुदान' },
    short: 'NGO Grants',
    summary: {
      en: 'Support to voluntary organisations delivering education, health and livelihood services in service-deficient tribal areas.',
      hi: 'सेवा-अभाव वाले जनजातीय क्षेत्रों में शिक्षा, स्वास्थ्य और आजीविका सेवाएं देने वाले स्वैच्छिक संगठनों को सहायता।',
    },
    category: 'partnership',
    type: 'Grant',
    icon: 'HandHeart',
    personas: ['ngo', 'state'],
    facts: [
      { value: '26', label: { en: 'States sanctioned', hi: 'स्वीकृत राज्य' } },
      { value: '5,81,900', label: { en: 'Beneficiaries', hi: 'लाभार्थी' } },
      { value: '₹60.48 cr', label: { en: 'Amount', hi: 'राशि' } },
      { value: '235 / 156', label: { en: 'Projects / NGOs', hi: 'परियोजनाएं / एनजीओ' } },
    ],
    factsNote: 'FY 2024-25 till 30 November 2024 (provisional), as published by the NGO Division.',
    overview: [
      'Voluntary organisations play an important role in extending the reach of government schemes and filling critical gaps in service-deficient tribal areas. The Ministry supports them, through State Societies and VOs/NGOs, under “Grants-in-aid to Voluntary Organisations working for the welfare of Scheduled Tribes” and “Strengthening Education among ST Girls in Low Literacy Districts”.',
      'Each partner organisation is expected to deliver quality services. Applications and progress reports are submitted on the NGO Grants portal.',
    ],
    apply: { label: 'Go to the NGO Grants portal', url: 'https://ngo.tribal.gov.in/' },
    legacy: { key: 'ngo' },
    division: 'ngo',
  },
  {
    slug: 'support-to-tri',
    title: { en: 'Support to Tribal Research Institutes (TRIs)', hi: 'जनजातीय अनुसंधान संस्थानों को सहायता' },
    short: 'Support to TRIs',
    summary: {
      en: 'Funding State Tribal Research Institutes and Centres of Excellence as think tanks for evidence-based tribal development.',
      hi: 'साक्ष्य-आधारित जनजातीय विकास हेतु राज्य जनजातीय अनुसंधान संस्थानों और उत्कृष्टता केंद्रों को वित्तीय सहायता।',
    },
    category: 'research',
    type: 'Central Sector',
    icon: 'Library',
    personas: ['researcher', 'state'],
    facts: [
      { value: '27', label: { en: 'Tribal Research Institutes', hi: 'जनजातीय अनुसंधान संस्थान' } },
      { value: '38', label: { en: 'Centres of Excellence', hi: 'उत्कृष्टता केंद्र' } },
      { value: '₹60 cr', label: { en: 'Released in 2021-22', hi: '2021-22 में जारी' } },
    ],
    factsNote: 'Figures as published on the TRI, Research & Media division page.',
    overview: [
      'Tribal Research Institutes are the research bodies of the Ministry at State level. They work as think tanks for tribal development, preserve tribal cultural heritage, give States inputs for evidence-based planning and legislation, build capacity, and disseminate information.',
      'Centres of Excellence are institutes of national or international repute recognised by the Ministry to undertake long-term, policy-oriented action research. Research studies are awarded only to reputed institutions, universities, State TRIs, UGC/AICTE-affiliated institutes and State/UT-recommended NGOs.',
    ],
    portals: [
      { label: 'National Tribal Research Portal', url: 'https://tritribal.gov.in/' },
      { label: 'Tribal Digital Document Repository', url: 'https://repository.tribal.gov.in/' },
    ],
    legacy: { key: 'tri-research-media' },
    division: 'tri-research-media',
  },
];

export function schemeBySlug(slug: string) {
  return schemes.find((s) => s.slug === slug);
}
