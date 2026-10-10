# Guideline sources

Reference copies of the official documents used for the tribal.gov.in project. They were
checked against the publishers' websites on 6 Oct 2026. The documents that cite them are in
[GIGW_DBIM_Standardisation/](../GIGW_DBIM_Standardisation/README.md), mainly the
[main-website gap matrix](../GIGW_DBIM_Standardisation/2_Assess/Gap_Matrix_Main_Website.md).
The PDFs are not for the repository (`.gitignore`).

| File | Title, version and date | Parts used | Published at | SHA-256 (first 16) | Status |
|---|---|---|---|---|---|
| `GIGW/GIGW3.0_rev-2026-07-27.pdf` | Guidelines for Indian Government Websites and Apps (GIGW) 3.0. No date printed; PDF created 16 Dec 2023, revised 27 Jul 2026. 121 pages | Annexure II, *Matrix to check conformity*, pp. 100–115: 88 checkpoints (Quality 25, Accessibility 50, Security 3, Lifecycle 10); guideline 5.4, p. 96 | https://guidelines.india.gov.in/ ("Manual 3.0", page last updated 5 Oct 2026) → https://cdnbbsr.s3waas.gov.in/s3c92a10324374fac681719d63979d00fe/uploads/2026/07/2026072438.pdf | `8e3dc8c9c48e6958` | **Current. Use this one** |
| `GIGW/GIGW_Compliance_Certification_Handbook_2023-12.pdf` | GIGW Compliance & Certification Handbook (NIC), Dec 2023. 62 pages | §3 (certification checkpoints), §4 (what STQC asks for) | https://cdnbbsr.s3waas.gov.in/s3c92a10324374fac681719d63979d00fe/uploads/2023/12/2023122166.pdf | `be1f3a5e5266916d` | Current |
| `DBIM_Compliance_Certification/DBIM Manual V 3.0.pdf` | Digital Brand Identity Manual, Version 3, January 2025 (MeitY, Digital Governance Division). 176 pages | Annexure A, template for Ministry websites (A.1, p. 82); Annexure F, *Compliance Matrix*: F.1 generic (43 items) and F.2 Ministry websites (34 items), printed pp. 143–151 (PDF pp. 163–171) | https://www.stqc.gov.in/sites/default/files/2025-06/DBIM%20Manual%20V%203.0.pdf | `cdbca897dc6d8cbc` | Current (identical to the STQC copy) |
| `DBIM_Compliance_Certification/Rule and Procedure.pdf` | STQC/DBIM/D01 Rules and Procedures for DBIM Compliance Certification, Issue 01, 10 Jun 2025. 24 pages | §14 (what to submit); p. 22 (validity) | https://www.stqc.gov.in/en/dbim-compliance-certification | `f495d55df3eb0c2e` | Current. The PDF's internal title still reads "Draft" |
| `DBIM_Compliance_Certification/Application.pdf` | STQC/DBIM/F01 Application for DBIM Compliance Certification, Issue 01 | — | same page | `8ec0cd1b31a4bf6f` | Current |
| `DBIM_Compliance_Certification/Agreement.pdf` | Certification agreement (F02) | — | same page | `23607bdc07ed737b` | Current |

The earlier revision of GIGW 3.0 (PDF modified 15 Feb 2025, SHA-256 starting
`23a4fd00d21ac24d`) was removed on 6 Oct 2026 as superseded. How it differs is described below.

Online references without a downloadable version:

- **GIGW introduction:** https://guidelines.india.gov.in/introduction/ (last updated 25 Sep 2026).
- **DBIM toolkit:** https://dbimtoolkit.digifootprint.gov.in/ (no version or date shown).
- **DBIM certification:** https://www.stqc.gov.in/en/dbim-compliance-certification. Last
  updated 6 Oct 2026. Fee Rs 3.5 lakh through Bharatkosh; certificate valid 3 years with
  annual surveillance.
- **WCAG 2.1 (W3C):** the accessibility standard cited by GIGW Annexure II,
  https://www.w3.org/TR/WCAG21/.
- **Visual reference only:** https://www.meity.gov.in/. Not evidence of compliance; its own
  meta description is placeholder text.

## Differences from the earlier GIGW 3.0 revision

The 27 Jul 2026 revision changes three pages: PDF pp. 91, 96 and 115. The change that
matters is in guideline 5.4 (lifecycle management) and Annexure II, Lifecycle S/N 10, which
now add: *"Users shall be provided with an option to select their preferred language (e.g.
through a pop up) prior to entering the website."* The other changes are numbering and
punctuation.
