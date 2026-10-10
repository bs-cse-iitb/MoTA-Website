import type { Bilingual } from './site';

// Time-bound content: announcements, What's New, tenders, vacancies and archives.
// Items are seeded from the live site (dates taken from the posting date or the
// date in the file name). In production these come from the CMS.

export interface Update {
  title: Bilingual | string;
  url: string;
  date?: string; // ISO yyyy-mm-dd
  category: 'Notice' | 'Scholarship' | 'Tender' | 'Report' | 'Document' | 'Event' | 'Guideline' | 'Result';
  format?: string;
  size?: string;
  isNew?: boolean;
}

export const announcements: { text: Bilingual; url: string }[] = [
  { text: { en: 'Last date extended: apply for the National Overseas Scholarship (NOS) for ST candidates 2026-27. New deadline 31 July 2026, 5:30 PM, at overseas.tribal.gov.in', hi: 'अंतिम तिथि बढ़ाई गई: अनुसूचित जनजाति अभ्यर्थियों हेतु राष्ट्रीय प्रवासी छात्रवृत्ति (एनओएस) 2026-27 के लिए आवेदन करें। नई अंतिम तिथि 31 जुलाई 2026, सायं 5:30 बजे, overseas.tribal.gov.in पर' }, url: 'https://overseas.tribal.gov.in/' },
  { text: { en: 'Janjatiya Garima Utsav 2026 — celebrating a journey of Viksit Bharat', hi: 'जनजातीय गरिमा उत्सव 2026 — विकसित भारत की यात्रा का उत्सव' }, url: '/media/photos/#janjatiya-garima-utsav-2026' },
  { text: { en: 'Updated list of Eklavya Model Residential Schools in India (31.07.2026)', hi: 'भारत में एकलव्य मॉडल आवासीय विद्यालयों की अद्यतन सूची (31.07.2026)' }, url: 'https://tribal.gov.in/downloads/EMRS/ListEMRSSchinIndia31072026.pdf' },
  { text: { en: 'Hiring of Social Media and PR Management Agency — GeM Bid No. GEM/2026/B/7541452', hi: 'सोशल मीडिया एवं पीआर प्रबंधन एजेंसी की नियुक्ति — जेम बोली सं. GEM/2026/B/7541452' }, url: '/offerings/tenders/' },
  { text: { en: 'National Overseas Scholarship: amended eligibility criteria and courses from 2026-27', hi: 'राष्ट्रीय प्रवासी छात्रवृत्ति: 2026-27 से पात्रता मानदंड और पाठ्यक्रमों में संशोधन' }, url: 'https://tribal.gov.in/downloads/guidelines/NOS/Amendment_NOS-2627.pdf' },
  { text: { en: "Revised Citizen's / Client's Charter of the Ministry (19.05.2026)", hi: 'मंत्रालय का संशोधित नागरिक/ग्राहक चार्टर (19.05.2026)' }, url: 'https://tribal.gov.in/DivisionsFiles/CitizensCharter19052026.pdf' },
  { text: { en: 'Janjatiya Gaurav Divas is observed on 15 November, the birth anniversary of Bhagwan Birsa Munda', hi: 'भगवान बिरसा मुंडा की जयंती 15 नवंबर को जनजातीय गौरव दिवस मनाया जाता है' }, url: '/whats-new/' },
];

export const whatsNew: Update[] = [
  { title: 'Work allocation among officers of the Ministry', url: 'https://tribal.gov.in/downloads/Tribal/Workallocation31072026.pdf', date: '2026-07-31', category: 'Notice', format: 'PDF', isNew: true },
  { title: 'List of Eklavya Model Residential Schools in India', url: 'https://tribal.gov.in/downloads/EMRS/ListEMRSSchinIndia31072026.pdf', date: '2026-07-31', category: 'Document', format: 'PDF', size: '578 KB', isNew: true },
  { title: "Citizen's / Client's Charter", url: 'https://tribal.gov.in/DivisionsFiles/CitizensCharter19052026.pdf', date: '2026-05-19', category: 'Document', format: 'PDF', size: '782 KB' },
  { title: 'Hiring of Social Media and PR Management Agency vide Bid No. GEM/2026/B/7541452 dated 15.05.2026', url: 'https://tribal.gov.in/WriteReadData/Highlights/Documents/202605260947211208025Combined_Info_GeMBid_Corrigendum.pdf', date: '2026-05-15', category: 'Tender', format: 'PDF' },
  { title: 'NGO Division: letter on Annual Report and audited accounts for Parliament', url: 'https://tribal.gov.in/downloads/NGO/Latter-Notice/annualReportAuditedAccount13042026.pdf', date: '2026-04-13', category: 'Notice', format: 'PDF', size: '98 KB' },
  { title: 'Scheduled Area List', url: 'https://tribal.gov.in/downloads/NGO/Latter-Notice/scheduledAreaList10032026.pdf', date: '2026-03-10', category: 'Document', format: 'PDF', size: '879 KB' },
  { title: 'Nodal Grievance Resolution Officer', url: 'https://tribal.gov.in/DivisionsFiles/GrievanceOfficer24022026.pdf', date: '2026-02-24', category: 'Notice', format: 'PDF', size: '113 KB' },
  { title: 'Amended list of provisionally selected candidates for 2025-26 under National Overseas Scholarship Scheme', url: 'https://tribal.gov.in/downloads/scholarship/NOS/AmendedListofProvisionallyselectedcandidatesNOS2526.pdf', date: '2026-02-12', category: 'Result', format: 'PDF', size: '303 KB' },
  { title: 'Organisational chart of the Ministry', url: 'https://tribal.gov.in/downloads/Tribal/Orgchart19122025.pdf', date: '2025-12-19', category: 'Document', format: 'PDF' },
  { title: 'Extension of last date for online applications — National Fellowship for ST Students 2025-26', url: 'https://tribal.gov.in/writereaddata/News/202509301100027960713ExtenLastDate4OnlineSubmissionApplications15102025.pdf', date: '2025-09-30', category: 'Scholarship', format: 'PDF', size: '324 KB' },
  { title: 'State-wise list of Scheduled Tribes in India', url: 'https://tribal.gov.in/downloads/statistics/ListScheduledTribes26092025.pdf', date: '2025-09-26', category: 'Document', format: 'PDF', size: '1.0 MB' },
  { title: 'Tribal Health: PAC minutes of 19.09.2025 on Centres of Competence', url: 'https://tribal.gov.in/downloads/thc/Minutes/PACMoM19092025CoC.pdf', date: '2025-09-19', category: 'Notice', format: 'PDF', size: '2.8 MB' },
];

export const tenders: (Update & { ref?: string; portal?: string })[] = [
  {
    title: 'Hiring of Social Media and PR Management Agency for the Ministry of Tribal Affairs',
    ref: 'GEM/2026/B/7541452',
    url: 'https://tribal.gov.in/WriteReadData/Highlights/Documents/202605260947211208025Combined_Info_GeMBid_Corrigendum.pdf',
    portal: 'https://gem.gov.in/',
    date: '2026-05-15',
    category: 'Tender',
    format: 'PDF',
  },
];

export const archives: Update[] = [
  { title: 'Last date extended to 31 July 2026: apply for National Overseas Scholarship 2026-27', url: 'https://tribal.gov.in/downloads/scholarship/NOS/Advertisement4InvitingApplicationsNOS2026-27.pdf', date: '2026-07-31', category: 'Scholarship', format: 'PDF', size: '581 KB' },
  { title: 'Har Ghar Tiranga, 9–17 August 2026', url: '/media/photos/', date: '2026-08-17', category: 'Event' },
  { title: 'NGO portal open for proposals of ongoing projects for FY 2026-27 (1–30 April 2026)', url: 'https://tribal.gov.in/downloads/NGO/Latter-Notice/ngoPortalOpen202627.pdf', date: '2026-04-30', category: 'Notice', format: 'PDF', size: '1.6 MB' },
  { title: 'Ministry invites online applications for National Fellowship 2025-26', url: 'https://tribal.gov.in/downloads/circulars/Inviteapplications4NFS202526.pdf', date: '2025-10-15', category: 'Scholarship', format: 'PDF', size: '182 KB' },
  { title: 'Meeting held on 04.09.2025 with State Governments / UTs (NGO grants)', url: 'https://tribal.gov.in/downloads/NGO/Latter-Notice/meeting04092025.pdf', date: '2025-09-04', category: 'Notice', format: 'PDF', size: '103 KB' },
];

/** Sanction orders by financial year (live pages on the current server). */
export const sanctionYears = ['2026-27', '2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21', '2019-20', '2018-19', '2017-18'].map((fy) => {
  const code = fy === '2017-18' ? '' : fy.replace(/^20(\d\d)-(\d\d)$/, '$1$2');
  return { fy, url: `https://tribal.gov.in/PFMS_SentionDtSchemewise${code}.aspx` };
});
