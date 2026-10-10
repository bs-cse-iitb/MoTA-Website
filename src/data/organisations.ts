import type { Bilingual } from './site';

// Our Organisations (DBIM A.5.1.3): bodies attached to or working under the Ministry.

export interface Organisation {
  slug: string;
  name: Bilingual;
  short: string;
  type: Bilingual;
  icon: string;
  logo?: string;
  about: string[];
  url: string;
  /** Legacy page with documents, rendered on an L3 page when present. */
  legacy?: string;
}

export const organisations: Organisation[] = [
  {
    slug: 'ncst',
    name: { en: 'National Commission for Scheduled Tribes', hi: 'राष्ट्रीय अनुसूचित जनजाति आयोग' },
    short: 'NCST',
    type: { en: 'Constitutional body (Article 338A)', hi: 'संवैधानिक निकाय (अनुच्छेद 338क)' },
    icon: 'Scale',
    logo: '/images/partners/ncst.webp',
    about: [
      'The National Commission for Scheduled Tribes was established under Article 338A of the Constitution to investigate and monitor the safeguards provided for Scheduled Tribes and to advise on their socio-economic development.',
      'The Ministry lays the Commission’s reports before Parliament with action taken. NCST reports, constitutional provisions and related notifications are listed below.',
    ],
    url: 'https://www.ncst.nic.in/',
    legacy: 'ncst',
  },
  {
    slug: 'nstfdc',
    name: { en: 'National Scheduled Tribes Finance and Development Corporation', hi: 'राष्ट्रीय अनुसूचित जनजाति वित्त एवं विकास निगम' },
    short: 'NSTFDC',
    type: { en: 'Central Public Sector Enterprise', hi: 'केंद्रीय सार्वजनिक क्षेत्र उद्यम' },
    icon: 'IndianRupee',
    logo: '/images/partners/nstfdc.webp',
    about: [
      'NSTFDC, an apex organisation under the Ministry since 2001, works for the economic upliftment of Scheduled Tribes by extending concessional financial assistance.',
      'Its schemes include Term Loan, Adivasi Mahila Sashaktikaran Yojana for ST women, Adivasi Shiksha Rinn Yojana (education loans), Micro Credit for ST self-help groups, the Tribal Forest Dwellers Empowerment Scheme and the Teak Growers Scheme.',
    ],
    url: 'https://nstfdc.tribal.gov.in',
    legacy: 'nstfdc',
  },
  {
    slug: 'trifed',
    name: { en: 'Tribal Cooperative Marketing Development Federation of India', hi: 'भारतीय जनजातीय सहकारी विपणन विकास परिसंघ' },
    short: 'TRIFED',
    type: { en: 'National-level cooperative body', hi: 'राष्ट्रीय स्तर की सहकारी संस्था' },
    icon: 'Store',
    logo: '/images/partners/tribes-india.webp',
    about: [
      'TRIFED markets tribal products and minor forest produce and is the nodal implementing agency for Pradhan Mantri Janjatiya Vikas Mission. It runs the Tribes India retail network and the Aadi Mahotsav national tribal festival.',
    ],
    url: 'https://trifed.tribal.gov.in/',
  },
  {
    slug: 'nests',
    name: { en: 'National Education Society for Tribal Students', hi: 'राष्ट्रीय जनजातीय छात्र शिक्षा समिति' },
    short: 'NESTS',
    type: { en: 'Autonomous society', hi: 'स्वायत्त संस्था' },
    icon: 'School',
    about: ['NESTS establishes, manages and monitors Eklavya Model Residential Schools across the country.'],
    url: 'https://nests.tribal.gov.in/',
  },
  {
    slug: 'tribal-research-institutes',
    name: { en: 'Tribal Research Institutes', hi: 'जनजातीय अनुसंधान संस्थान' },
    short: 'TRIs',
    type: { en: 'State research bodies supported by the Ministry', hi: 'मंत्रालय द्वारा समर्थित राज्य अनुसंधान निकाय' },
    icon: 'Library',
    about: ['State Tribal Research Institutes work as think tanks for tribal development, preserve cultural heritage and support evidence-based planning. They are networked on the National Tribal Research Portal.'],
    url: 'https://tritribal.gov.in/',
  },
];
