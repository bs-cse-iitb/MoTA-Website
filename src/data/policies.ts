// Website policies required by GIGW 3.0 (Lifecycle Management) and DBIM 5.6.
// Terms, privacy, copyright, hyperlinking and disclaimer reuse the Ministry's
// existing wording. Policies the legacy site did not have follow the standard
// GIGW structure and must be approved by the Web Information Manager before go-live.

export interface PolicyBlock { heading?: string; paras?: string[]; list?: string[] }
export interface Policy { slug: string; title: string; intro?: string; blocks: PolicyBlock[] }

export const policies: Policy[] = [
  {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    blocks: [
      { paras: [
        'This website is designed, developed and maintained by the National Informatics Centre (NIC), Ministry of Electronics & Information Technology, Government of India. The content on this website is provided by the Ministry of Tribal Affairs.',
        'Though all efforts have been made to ensure the accuracy and currency of the content on this website, it should not be construed as a statement of law or used for any legal purposes. In case of any ambiguity or doubt, users are advised to verify with the Ministry of Tribal Affairs and/or other sources and to obtain appropriate professional advice.',
        'Under no circumstances will the Ministry be liable for any expense, loss or damage, including indirect or consequential loss or damage, or any expense, loss or damage whatsoever arising from use, or loss of use, of data arising out of or in connection with the use of this website.',
        'These terms and conditions shall be governed by and construed in accordance with Indian law. Any dispute arising under these terms and conditions shall be subject to the jurisdiction of the courts of India.',
      ] },
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    blocks: [
      { paras: ['As a general rule, this website does not collect personal information about you when you visit the site. You can generally visit the site without revealing personal information, unless you choose to provide such information.'] },
      { heading: 'Site visit data', paras: ['This website records your visit and logs the following information for statistical purposes: your server’s address; the name of the top-level domain from which you access the Internet (for example .gov, .com, .in); the type of browser you use; the date and time you access the site; the pages you have accessed and the documents downloaded; and the previous Internet address from which you linked directly to the site.', 'We will not identify users or their browsing activities, except when a law enforcement agency exercises a warrant to inspect the service provider’s logs.'] },
      { heading: 'Cookies', paras: ['This website uses essential cookies to remember your language, accessibility and cookie choices, and optional cookies only with your consent. See the Cookie Policy for details.'] },
      { heading: 'Email management', paras: ['Your email address will only be recorded if you choose to send a message. It will only be used for the purpose for which you provided it and will not be added to a mailing list or disclosed without your consent.'] },
      { heading: 'Collection of personal information', paras: ['If you are asked for any other personal information, you will be told how it will be used if you choose to give it. Personal data is processed in accordance with the Digital Personal Data Protection Act, 2023 and stored within India. If you believe the principles in this statement have not been followed, please write to the Web Information Manager through the Contact Us page.'] },
    ],
  },
  {
    slug: 'hyperlinking-policy',
    title: 'Hyperlinking Policy',
    blocks: [
      { heading: 'Links to external websites and portals', paras: ['At many places on this website you will find links to other websites and portals, placed for your convenience. The Ministry of Tribal Affairs is not responsible for the contents and reliability of linked websites and does not necessarily endorse the views expressed in them. The mere presence of a link or its listing on this website should not be taken as endorsement of any kind. We cannot guarantee that these links will work all the time, and we have no control over the availability of linked pages.', 'Links to external websites open in a new browser tab, and you are told before you leave this website.'] },
      { heading: 'Links to this website from other websites', paras: ['We do not object to you linking directly to the information hosted on this website and no prior permission is required. However, please inform us of any links so that we can tell you of changes or updates to the linked pages. We do not permit our pages to be loaded into frames on your site; pages of this website must load in a newly opened browser window.'] },
    ],
  },
  {
    slug: 'copyright-policy',
    title: 'Copyright Policy',
    blocks: [
      { paras: [
        'Material featured on this website may be reproduced free of charge in any format or media without requiring specific permission, subject to the material being reproduced accurately and not used in a derogatory manner or in a misleading context. Where the material is published or issued to others, the source must be prominently acknowledged.',
        'The permission to reproduce this material does not extend to any material identified as the copyright of a third party. Authorisation to reproduce such material must be obtained from the departments or copyright holders concerned.',
      ] },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    intro: 'Cookies are small data files stored on your device. This policy follows the Digital Brand Identity Manual (DBIM 3.0, section 7.6) and the Digital Personal Data Protection Act, 2023.',
    blocks: [
      { heading: 'Essential cookies (always on)', list: [
        'Language preference — remembers whether you chose English or Hindi.',
        'Accessibility preferences — text size, contrast and spacing choices.',
        'Cookie consent — remembers the choices you made in the cookie banner.',
      ], paras: ['These are stored in your browser’s local storage, contain no personal data and stay until you clear them or press “Reset all” in the accessibility options.'] },
      { heading: 'Optional cookies (only with your consent)', list: [
        'Analytics — anonymous statistics about visits used to improve the website.',
        'Social media — embedded posts from X, Facebook, Instagram and YouTube, which may set their own cookies.',
      ] },
      { heading: 'Changing your choices', paras: ['You can change your choices at any time using the “Cookie settings” link in the footer. Rejecting optional cookies does not affect your ability to use any part of this website.'] },
    ],
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    blocks: [
      { paras: [
        'Information is made available on this website purely as a measure of public facilitation. While every effort has been made to ensure that the information hosted on this website is accurate and up to date, the Ministry of Tribal Affairs does not hold itself liable for any consequences, legal or otherwise, arising out of the use of any such information.',
        'Links to other websites are provided for public convenience. The Ministry is not responsible for the content or reliability of linked websites and does not necessarily endorse the views expressed in them.',
      ] },
    ],
  },
  {
    slug: 'accessibility-statement',
    title: 'Accessibility Statement',
    intro: 'The Ministry of Tribal Affairs is committed to making this website accessible to everyone, including persons with disabilities, in line with the Rights of Persons with Disabilities Act, 2016.',
    // Keep this statement to what the evidence shows (docs/GIGW_DBIM_Standardisation/2_Assess/Gap_Matrix_Main_Website.md). Do not claim
    // conformance until a manual audit and the STQC assessment are complete.
    blocks: [
      { heading: 'Standard', paras: ['We aim to meet the Guidelines for Indian Government Websites and Apps (GIGW 3.0), which adopt the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.'] },
      { heading: 'Conformance status', paras: ['This website has not yet been assessed for conformance. Automated accessibility checks are run on the main types of page in English and Hindi. Testing with screen readers and an independent audit are not complete yet. This statement will be updated with their results.'] },
      { heading: 'What you can do on this website', list: [
        'Navigate with a keyboard; a “Skip to main content” link is the first item on every page.',
        'Change text size, switch to high contrast or dark mode, increase text spacing, highlight links, use a more readable font and stop animations from the Accessibility options button in the top bar.',
        'Read the website in English or Hindi.',
        'Pause the banner slideshow and the announcements ticker.',
      ] },
      { heading: 'Known limitations', paras: ['Many documents published before this website, especially older PDF files, may not be accessible. Some are scanned images that screen readers cannot read. If you need a document in an accessible format, please contact the Web Information Manager listed on the Contact Us page.'] },
      { heading: 'Feedback', paras: ['If you face any difficulty in using this website, please tell the Web Information Manager (see Contact Us), mentioning the page address and the problem.', 'This statement was prepared on 6 October 2026.'] },
    ],
  },
  {
    slug: 'content-archival-policy',
    title: 'Content Archival Policy',
    blocks: [
      { paras: ['Content on this website is reviewed against an expiry date. Expired content is removed from the main sections and moved to the Archives, from where it remains available to the public.'] },
      { list: [
        'Announcements, tenders, vacancies and events are archived after their closing date or event date.',
        'Circulars, notifications and orders remain in their sections while in force and are archived when superseded.',
        'Scheme content remains while the scheme is active and is archived when the scheme closes.',
        'Archived items show the date on which they were archived.',
      ] },
    ],
  },
  {
    slug: 'cmap',
    title: 'Content Contribution, Moderation & Approval Policy (CMAP)',
    blocks: [
      { paras: ['Content is contributed by the divisions of the Ministry. Each division nominates a content contributor and a content moderator. Every item passes a workflow of at least two levels — contribution and moderation/approval — before publication (DBIM A.5.6).'] },
      { list: [
        'Contributors prepare content in English and Hindi with title, summary, document metadata (format, size, language), personas and content-type tags.',
        'Moderators check accuracy, language (no spelling or grammatical errors, no Hinglish) and compliance with GIGW and DBIM.',
        'The Web Information Manager has overall responsibility for content published on the website.',
      ] },
    ],
  },
  {
    slug: 'content-review-policy',
    title: 'Content Review Policy',
    blocks: [
      { paras: ['Content is reviewed regularly so that it stays accurate and current. Review frequency by content type:'] },
      { list: [
        'Home page, What’s New and announcements — daily.',
        'Tenders and vacancies — weekly.',
        'Schemes, divisions, directory and contact details — monthly.',
        'Acts, policies, reports and publications — quarterly.',
        'Website policies — yearly, or when guidelines change.',
      ] },
    ],
  },
  {
    slug: 'security-policy',
    title: 'Security Policy',
    blocks: [
      { paras: ['This website is hosted by NIC on a secured environment and follows the cybersecurity guidelines of GIGW 3.0 and advisories of CERT-In.'] },
      { list: [
        'All pages are served only over HTTPS with HTTP Strict Transport Security.',
        'Security headers (Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) are applied on every response.',
        'The website is audited by a CERT-In empanelled auditor and carries a “safe to host” certificate before go-live and after major changes.',
        'Unauthorised attempts to upload or change information, or otherwise cause damage, are prohibited and may be punishable under the Information Technology Act, 2000.',
      ] },
    ],
  },
  {
    slug: 'contingency-management-plan',
    title: 'Contingency Management Plan',
    blocks: [
      { paras: ['The website must be available at all times. A contingency plan is in place for content vandalism, data corruption, natural disasters and other incidents.'] },
      { list: [
        'Defacement or hacking: the website is restored from the last clean backup within the shortest possible time and the incident is reported to CERT-In.',
        'Data corruption: content is restored from daily backups maintained by NIC.',
        'Hardware or hosting failure: services move to the disaster recovery site.',
        'The Web Information Manager coordinates the response with NIC and the Ministry’s IT division.',
      ] },
    ],
  },
  {
    slug: 'website-monitoring-policy',
    title: 'Website Monitoring Policy',
    blocks: [
      { paras: ['The website is monitored to keep it fast, accessible and correct.'] },
      { list: [
        'Performance: page load and Core Web Vitals checked monthly.',
        'Functional and broken links: checked weekly with an automated link checker.',
        'Accessibility: automated checks on every release and a manual audit every six months.',
        'Compatibility: tested on current versions of Chrome, Edge, Firefox and Safari, and on Android and iOS devices.',
        'Security: vulnerability scanning and patching as per CERT-In advisories.',
        'User feedback: reviewed weekly and acted upon.',
      ] },
    ],
  },
];
