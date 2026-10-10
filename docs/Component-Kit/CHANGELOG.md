# Changelog

Paths are inside `packages/dbim-kit/`.

## Unreleased

- Removed the "GIGW 3.0 / DBIM 3.0 / WCAG 2.1 AA" badges from the footer: conformance can be claimed only after a formal STQC assessment and a completed manual accessibility audit.
- Footer template: the last-updated date is now the placeholder `{{UPDATED}}` / `{{UPDATED_ISO}}` instead of the pilot's build date.
- New `expiry.ts`: hides items marked `data-valid-till="yyyy-mm-dd"` (the STQC badge) once the date has passed, even if the site is not rebuilt.
- Chat assistant rebuilt from the Ministry's "Jago" widget in the DBIM design: Jago mascot (`assets/jago-96.webp`, `jago-160.webp`), the service's 11 answer languages, its request format (`messages`, `language` codes such as `eng`/`hin`/`gnd`, `top_k`, `session_id`), list and table answers, Copy answer, voice input that fills the question box, the conversation kept for the browser tab, a 60-second time-out. Answers are written as text only. Theme-aware colours fix low contrast of the old notice in the dark theme.
- All kit scripts are ES modules (`export {}`), which removes 24 TypeScript errors caused by names shared across scripts.
- Chat assistant: optional `data-search-url`, the address of the website's search page, for pages without the site's search index. When it is set and the service fails, the assistant links to that page and does not search. Used by the standalone `chat_popup/` page at the repository root (`npm run chat:build`).

## 1.1.0 — UAT (October 2026)

- TriBot chat assistant as an optional template (`templates/<lang>/tribot.html`, `tribot.ts`). It posts `{query, chat_history, language}` to a same-origin endpoint, and answers from the site search when the service is unreachable.
- Header co-branding slot filled from site settings (two logos at most, DBIM 5.4).
- Footer: FAQ and Web Information Manager links, visitor counter and STQC badge (both shown only when configured and valid).
- Back-to-top button moved above the TriBot button; the footer leaves room under its last line.
- Fixed: the dialogs template came out empty once the footer carried its own script; templates are now cut up to `</body>` with scripts removed.

## 1.0.0 — UAT (October 2026)

First release for review, generated from the tribal.gov.in pilot.

- DBIM colour groups 1–10 and neutral through `data-dbim-group`. The footer and top bar use the key colour.
- Noto Sans and Noto Sans Devanagari, self-hosted. DBIM type scale 36/24/20/16/14/12 (desktop) and 24/20/16/14/12/10 (mobile).
- Header 1 with logo lockup 2, search, user controls, a language selector and an optional co-branding slot (maximum two).
- Global Information Architecture menu: Ministry, Offerings, Documents, Media, Connect.
- Accessibility panel matching the DBIM template: text size, themes, invert, low saturation, highlight links, spacing, readable font, stop animations, hide images and big cursor.
- Cookie consent (DPDP Act 2023) and external-link notice.
- English and Hindi templates, an inner page shell and a component gallery.
- Fixed: the mobile drawer's first item was hidden under the brand bar when the page was not scrolled.
- Fixed: 4 px horizontal scroll at 320 px caused by the top bar.
- Fixed: the print/share script was emitted after `</html>` on inner pages (invalid HTML). It is now part of `dbim.js`.
