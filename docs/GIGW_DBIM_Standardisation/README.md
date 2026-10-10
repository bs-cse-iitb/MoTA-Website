# GIGW 3.0 and DBIM standardisation of tribal.gov.in

**The task:** standardise tribal.gov.in according to GIGW 3.0 and the applicable DBIM
requirements, in six steps. This folder holds the output of each step.

Position on **6 Oct 2026**. The review submission is due on 20 Oct 2026. Reviewers should
start with [6_Submit/Review_Package.md](6_Submit/Review_Package.md).

## The six steps

| Step | Output | Status, 6 Oct 2026 |
|---|---|---|
| 1 Collect | [Access and security status](1_Collect/Access_and_Security_Status.md) | **Partly done.** Source code and backups received, but the code copy is incomplete and the backups are not restored. UAT runs on a local stand-in only. No audit report or Safe-to-Host record received |
| 2 Assess | Gap matrix: [main website](2_Assess/Gap_Matrix_Main_Website.md), [sister portals](2_Assess/Gap_Matrix_Sister_Portals.md) | **First pass done.** Main website: 26 issues, 3 fixed. Sister portals: 21 listed, 14 assessed, 7 still to check. No status is recorded yet for each of the 88 GIGW checkpoints |
| 3 Build | [Components and the Hindi/English prototype](3_Build/Components_and_Prototype.md) | **Done on the local UAT.** 34 components, not yet approved |
| 4 Implement | [Changes on the UAT website](4_Implement/Changes_on_UAT.md) | **In progress.** Main fixes are in; content migration, dates, language choice, feedback and the dependency upgrade are open |
| 5 Verify | [Test report](5_Verify/Test_Report.md), [compliance-readiness checklist](5_Verify/Compliance_Readiness_Checklist.md), [BHASHINI feasibility](5_Verify/BHASHINI_Feasibility.md) | **Automated tests pass**, and all of the old home page's navigation is accounted for. Manual accessibility review and staging tests are pending |
| 6 Submit | [Review package](6_Submit/Review_Package.md) | **Ready for review** |

## How the key points are applied

| Key point | How |
|---|---|
| Follow DBIM specifications; do not merely copy MeitY's appearance | Built from DBIM v3 and its Annexure A template for Ministry websites, in colour group 9. The MeitY website was a visual reference only ([3_Build](3_Build/Components_and_Prototype.md) §3) |
| Assess sister portals before modifying them | Assessed separately and passively. **No sister portal has been changed** |
| Maintain DBIM compliance evidence; separate DBIM certification is not a deliverable unless prescribed | Evidence is kept in `docs/Evidence/` and mapped in the [component list](../Component-Kit/COMPONENTS.md). DBIM certification is described for information only ([checklist](5_Verify/Compliance_Readiness_Checklist.md) §4) |
| Prepare for STQC evaluation; certification depends on the external process | A readiness checklist. **No compliance or certification is claimed** on the site or in these documents |
| Deploy major changes only after UAT review and production approval | **Nothing has been deployed.** The order is staging, security audit, Safe-to-Host, then production after approval ([DEPLOYMENT.md](../DEPLOYMENT.md)) |

## Conventions

- **Statuses** are used as follows:
  - *Verified* only when the recorded evidence supports it.
  - Otherwise *Failed*, *Not tested*, *Pending manual review*, *Blocked* (with the reason)
    or *Not applicable* (with the reason).
  - Automated tests alone never make an accessibility item *Verified*.
- **IDs:**
  - "row n" is a row of the [main-website gap matrix](2_Assess/Gap_Matrix_Main_Website.md);
  - T-… are plan items ([review package](6_Submit/Review_Package.md) §3);
  - S-… are STQC prerequisites ([checklist](5_Verify/Compliance_Readiness_Checklist.md) §2);
  - A-… are security findings in the old code ([1_Collect](1_Collect/Access_and_Security_Status.md) §2).
- **Sources** are GIGW 3.0 (edition of 27 Jul 2026) and DBIM v3 (January 2025). Editions and
  checksums are in [GIGW_DBIM_Guidelines/README.md](../GIGW_DBIM_Guidelines/README.md).
- **Evidence paths** are relative to `docs/Evidence/`.
