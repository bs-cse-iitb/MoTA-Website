# Step 3 output: reusable components and the Hindi/English prototype

Position on **6 Oct 2026**. DBIM means DBIM v3 (January 2025).

## 1. Components

34 components built to DBIM v3:

- **Header for Central Ministries:**
  - Government of India strip;
  - accessibility tools and language selector;
  - logo lockup with the State Emblem;
  - search;
  - at most two co-branding logos.
- **Navigation:** Ministry, Offerings, Documents, Media and Connect, with a mega menu and a phone menu.
- **Footer** in the key colour.
- **Typography:** Noto Sans and Noto Sans Devanagari, on the DBIM type scale.
- **Colours:** DBIM colour groups 1–10 and neutral. MoTA uses group 9 (terracotta).
- **Other parts:**
  - line icons;
  - accessibility controls;
  - cookie consent;
  - the inner page;
  - the chat assistant "Jago".

Where to find them:
- **Component list:** [COMPONENTS.md](../../Component-Kit/COMPONENTS.md) gives the DBIM
  section and page and the WCAG reference for each component, with a column to record approval.
- **Code:** `packages/dbim-kit/`.
- **Guide for other portals:** [Component-Kit/](../../Component-Kit/README.md).

**Status.** The components pass the automated tests on the local UAT: kit 13 of 13 and site
21 of 21 ([test report](../5_Verify/Test_Report.md)). **None has been approved** by the
competent authority yet. Approval is needed before production use and before other portals
adopt them.

## 2. Prototype on UAT

- **Hindi and English:** 114 pages in each language. Each page has its counterpart at
  `/hi/…`, and there is a bilingual 404 page.
- **Desktop and phone:** one responsive layout, tested at 320, 390, 768, 1366 and 1920 px
  wide, in standard, dark and high-contrast themes.
- **Where to see it:** on the local UAT stand-in.
  1. In the repository root, run `npm run build`, then `npm run serve:uat`.
  2. Open English at http://127.0.0.1:4322/ and Hindi at http://127.0.0.1:4322/hi/.

  It is not on NIC staging yet: there is no staging server (T-06).

Screenshots from the test run of 6 Oct 2026:

| | |
|---|---|
| [Home, English, desktop](Screenshots/01_Home_English_desktop.jpg) | [Home, English, phone](Screenshots/02_Home_English_phone.jpg) |
| [Home, Hindi, desktop](Screenshots/03_Home_Hindi_desktop.jpg) | [Home, Hindi, phone](Screenshots/04_Home_Hindi_phone.jpg) |
| [Dark theme](Screenshots/05_Home_dark_theme.jpg) | [High contrast](Screenshots/06_Home_high_contrast.jpg) |
| [Scheme page, English, desktop](Screenshots/07_Scheme_page_English_desktop.jpg) | [Scheme page, Hindi, phone](Screenshots/08_Scheme_page_Hindi_phone.jpg) |
| [Main menu](Screenshots/09_Main_menu_open.jpg) | [Phone menu](Screenshots/10_Phone_menu_open.jpg) |
| [Accessibility panel](Screenshots/11_Accessibility_panel.jpg) | [Language menu](Screenshots/12_Language_menu.jpg) |
| [Chat assistant, English](Screenshots/13_Chat_assistant_English_desktop.png) | [Chat assistant, Hindi](Screenshots/14_Chat_assistant_Hindi_desktop.png) |
| [Chat assistant, phone](Screenshots/15_Chat_assistant_phone.png) | |

The final test run's 75 screenshots (16 pages in both languages, desktop and phone, and
seven interactions) are in `docs/Evidence/runs/2026-10-10-final/uat/screenshots/`. They are
kept locally and not committed to the repository.

## 3. Following DBIM, not copying MeitY

- **Structure:** taken from the DBIM template for Ministry websites (Annexure A). That covers
  the information architecture, the home-page sections in DBIM order, Header 1 and the footer.
- **Colours:** DBIM colour group 9, chosen to match the Ministry's identity, not MeitY's colours.
- **Identity:** the Ministry keeps its own within what DBIM allows:
  - Warli art;
  - at most two campaign logos;
  - its own photographs;
  - the Jago mascot.

Next steps for the components are in the plan ([review package](../6_Submit/Review_Package.md) §3):
- approval (T-15);
- NIC staging (T-06);
- the State Emblem artwork from the DBIM toolkit (T-14);
- the manual accessibility review (T-16).
