# Project overview: the new tribal.gov.in

For anyone who needs the picture: what the project is, who is involved and where it stands.
Position on **6 Oct 2026**.

## 1. Purpose

The website of the Ministry of Tribal Affairs, tribal.gov.in, is being rebuilt to the
Guidelines for Indian Government Websites and Apps (GIGW 3.0) and the Digital Brand Identity
Manual (DBIM v3).

tribal.gov.in is the pilot. What works here is packaged as common components, so the
Ministry's other portals can follow the same standard while keeping their own identity.

## 2. Scope

**In scope:**
- **DBIM structure** for Central Ministries: header, footer, navigation, typography,
  colours, accessibility controls and phone layout.
- **The present home page carried over:** every component and link, placed where DBIM
  expects it.
- **Every page in English and Hindi.**
- **A component kit** for other MoTA portals.
- **Assessment** against GIGW 3.0 and DBIM: the main website, and separately the 21 sister
  portals, before any change to them.
- **Migration:**
  - every old page address redirects to its new page;
  - documents keep their addresses;
  - lists held in the old database are imported from a NIC export.
- **Readiness** for the security audit, Safe-to-Host and the STQC evaluation.

**Not in scope:**
- changing the sister portals;
- a separate DBIM certification, unless it is prescribed;
- the hosting itself, which is NIC's.

No compliance or certification is claimed: STQC decides that through its own process.

## 3. The new website at a glance

| Item | Details |
|---|---|
| Main menu | Ministry · Offerings · Documents · Media · Connect (the DBIM information architecture), with Website Policies, Help and Sitemap in the footer |
| Pages | 114 in English and 114 in Hindi; each page has its counterpart in the other language |
| Home page | In DBIM order: banners (the central campaign banner first), announcements, "I want to…" quick actions, the Prime Minister's quote, the Ministry and its Ministers, statistics, key offerings, What's New, personas, divisions, initiatives, important links, social media, central posts, photo gallery and related portals |
| Accessibility | Skip link; text size; standard, dark and high-contrast themes; invert colours; low saturation; highlight links; text spacing; readable font; stop animations; hide images; big cursor; full keyboard use |
| Search | Whole-site search in English and Hindi, with filters; voice input where the browser supports it |
| Chat assistant | "Jago", on the Ministry's TriBot service, answering in 11 languages; it falls back to the site search |
| Privacy | Cookie notice; social media posts load only after consent; a notice before leaving for another website |
| Look | DBIM colour group 9 (terracotta), Noto Sans, DBIM line icons and Warli artwork |

How it is built, and the technology used: [TECHNOLOGY.md](TECHNOLOGY.md).

## 4. Who is involved

| Who | Role |
|---|---|
| Ministry of Tribal Affairs: competent authority, Web Information Manager | Approves the components, the policies and the release; owns the STQC evaluation |
| Ministry: divisions, OL Division, Media cell, MoTA IT Cell | Content and documents; vetting of the Hindi; banners and videos; security audit and Safe-to-Host |
| NIC | Hosting, staging, TLS, the IIS proxy, the content export and a current copy of the documents |
| Web team | Builds and tests the site and the component kit; keeps these documents |
| Owners of the sister portals | Fix their portals' urgent issues; adopt the kit after approval |
| STQC; a CERT-In empanelled auditor | Website certification; security audit |

Each open task, with its owner and target date, is in the
[review package](GIGW_DBIM_Standardisation/6_Submit/Review_Package.md) §3.

## 5. Status and next steps

- **Built and tested on a local UAT stand-in.** Nothing has been deployed.
- **Review:** the submission is due on 20 Oct 2026. Each step's status is in the
  [task README](GIGW_DBIM_Standardisation/README.md).
- **Then, in order:**
  1. NIC staging;
  2. security audit and Safe-to-Host;
  3. production after approval;
  4. the STQC evaluation after go-live.

## 6. Where things are

The repository holds the new site and the component kit, with their instructions at the root
([README.md](../README.md)), and the project documents and test evidence in `docs/`
([README.md](README.md)).
