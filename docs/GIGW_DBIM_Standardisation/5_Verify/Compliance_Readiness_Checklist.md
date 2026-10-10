# Step 5 output: compliance-readiness checklist

How ready tribal.gov.in is for the external **STQC evaluation under GIGW 3.0**, and what DBIM
evidence is kept. STQC decides certification through its own process; this checklist tracks
only what the Ministry can prepare. **No compliance or certification is claimed.**

Position on 6 Oct 2026. Owners and target dates are in the plan
([review package](../6_Submit/Review_Package.md) §3).

## 1. Gates before the new site goes live

| # | Gate | Status | Evidence |
|---|---|---|---|
| 1 | UAT review of the prototype and of the review package | Pending | [Review package](../6_Submit/Review_Package.md) |
| 2 | Every P1 gap closed, or accepted by the competent authority | Open | [Main-website gap matrix](../2_Assess/Gap_Matrix_Main_Website.md) |
| 3 | Migration blockers cleared: `npm run check:release` reports "Ready" | Not ready | `Evidence/runs/2026-10-10-final/check-release.txt` |
| 4 | Deployed and re-tested on NIC staging | Not started: no staging server | — |
| 5 | Security audit of the staging build by a CERT-In empanelled auditor; observations closed | Not started | — |
| 6 | Safe-to-Host certificate | Not started | — |
| 7 | Production approval by the competent authority | Pending | — |

## 2. STQC prerequisites

STQC asks for the following (GIGW Compliance & Certification Handbook, NIC, Dec 2023, §4):
- a Website Quality Manual in the prescribed format;
- a Web Information Manager (WIM) at Joint Secretary level;
- approved website policies;
- the security audit report and the Safe-to-Host certificate;
- the application form and the certification agreement.

STQC then reviews the documents, tests the website and audits the back-end processes that the
manual describes.

| ID | Prerequisite | Status, 6 Oct 2026 | Plan |
|---|---|---|---|
| S-01 | Security audit report of the current site, with its pending observations | Not received | T-09 |
| S-02 | Security audit of the new build on staging by a CERT-In empanelled auditor | Not started; needs staging | T-11 |
| S-03 | Safe-to-Host certificate for the new build | Not started; follows the audit | T-11 |
| S-04 | STQC Certified Quality Website (CQW) status | The previous certificate (GIGW 2018, Quality Level I, with 3 exemptions) was valid from 13 Feb 2023 to 12 Feb 2026, subject to surveillance audits. It has expired | T-20 |
| S-05 | GIGW 3.0 self-assessment against the 88 checkpoints | Known gaps are in the gap matrix; no status is recorded yet for each checkpoint | T-37 |
| S-06 | Website Quality Manual and website policy document | Policies drafted on the site in both languages; the manual is not compiled | T-36 |
| S-07 | Website policies approved by the competent authority (CAP, CMAP, CRP, hyperlinking, copyright, privacy, terms, security, contingency, monitoring) | Drafts. Some describe practice that is not in place yet (gap matrix row 24) | T-15 |
| S-08 | Web Information Manager nominated and named on the site | Not confirmed | T-15 |
| S-09 | Hosting details: NIC data centre, network, backup and disaster recovery | Not received | T-35 |
| S-10 | Accessibility statement and conformance evidence | Statement rewritten on 6 Oct to say "not yet assessed"; automated evidence only; manual tests pending | T-16 |
| S-11 | STQC application and fee (Bharatkosh) | After Safe-to-Host and go-live | T-20 |

## 3. GIGW 3.0 checkpoints

GIGW 3.0 Annexure II has 88 checkpoints:
- Quality, 25;
- Accessibility, 50 (WCAG 2.1 A and AA);
- Security, 3;
- Lifecycle, 10.

These are in the edition of 27 Jul 2026, pp. 100–115. The known gaps are in the
[main-website gap matrix](../2_Assess/Gap_Matrix_Main_Website.md). A status for each of the 88
checkpoints, with its evidence, is **not recorded yet** (T-37).

## 4. DBIM evidence

- **Kept as evidence:** the components and pages built to DBIM v3. Each component's DBIM
  section is given in [COMPONENTS.md](../../Component-Kit/COMPONENTS.md). Mapping them to the
  numbered checklists of DBIM Annexure F (F.1 generic, 43 items; F.2 Ministry websites, 34
  items; printed pp. 143–151) is still to do (T-37).
- **Separate DBIM certification is not a deliverable** of this task unless it is prescribed.
  For information only, STQC/DBIM/D01 (Issue 01, 10 Jun 2025, §14) asks for:
  - the application (F01) and the certification agreement (F02);
  - the fee: Rs 3.5 lakh through Bharatkosh, according to the STQC page;
  - a compliance matrix;
  - the number and addresses of the pages.

  The DBIM certificate is valid for three years, with annual surveillance (D01, p. 22).
