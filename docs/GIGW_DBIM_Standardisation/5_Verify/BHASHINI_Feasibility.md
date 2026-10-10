# Step 5 output: BHASHINI feasibility (examined separately)

Whether BHASHINI, the Government's language-translation platform, should be used on
tribal.gov.in. As the task requires, this is examined separately from the main work. It is
**not a go-live dependency**. Position on 6 Oct 2026.

## 1. What the guidelines say

| Source | What it says |
|---|---|
| GIGW 3.0, Annexure II Lifecycle S/N 10 (27 Jul 2026 edition, PDF p. 115) | The website is bilingual (Hindi and English), with a prominent language selection link and Unicode text. The new edition adds a choice of language before the visitor enters the site |
| DBIM v3 §7.5 (printed pp. 56–60) | Content "is required to be available in all official languages", using translation technology; on-the-fly translation for all languages (§7.5.2 ii); uniform translation of terms; distinct URLs and sitemaps per language; a way for users to report translation errors |
| DBIM Annexure F (checklists F.1 and F.2, pp. 143–151) | No checkpoint about languages beyond the language selector and content quality |
| BHASHINI by name | Not mentioned in GIGW 3.0 or in DBIM v3 |

**Reading.** Hindi and English are required now: both are on the new site, and the Hindi
still needs vetting by the OL Division. DBIM's text expects more languages through
translation technology, but its compliance checklists do not test for them and neither
guideline names BHASHINI. Using BHASHINI is therefore a Ministry decision. Machine translation
cannot replace the vetted Hindi pages. (This corrects the statement of 5 Oct 2026 that other
languages are only "recommended".)

## 2. Options

| Option | How it works | For | Against |
|---|---|---|---|
| A. BHASHINI website-translation plugin | A visitor picks another language; the plugin translates the page in the browser. Load it only on request, from the language menu | Quick; many languages | A third-party script on the site (Content-Security-Policy change, in scope of the security audit); quality of scheme, legal and financial terms; accessibility of the plugin's own controls; page weight |
| B. Translation at build time, with human review | Use BHASHINI translation services while building pages, then have each language reviewed before publishing | Quality controlled; pages stay static and fast; a separate URL per language, as DBIM §7.5.2 asks | Effort and reviewers for each language |
| C. Chat assistant in tribal languages | Already available: the TriBot service answers in 11 languages, including Gondi, Santali, Mundari, Bhili, Bettakuruba, Garo, Kokborok, Koya and Kui | No change to the pages | Answers only, not the site; AI quality (the sample Hindi answer on 6 Oct read as machine translation) |

## 3. Fit with the new site

Good. Pages are static HTML with real text, not text inside images; every page declares its
language; English and Hindi already have separate URLs. Option A needs the plugin's hosts in
the Content-Security-Policy, without `'unsafe-inline'` or `'unsafe-eval'`. Content that must
not be translated (the Ministry's name, the emblem lockup, scheme names, document titles) can
be marked to be skipped. The technical steps are in
[Component-Kit/INTEGRATION.md](../../Component-Kit/INTEGRATION.md) §5.

## 4. Recommendation

1. **Go live** with vetted Hindi and English.
2. **After go-live, run a pilot on staging** (plan T-27, P3):
   - **Languages:** two or three, chosen from where the Ministry's users are. Scheduled Tribe
     communities are concentrated in states whose official languages include Odia, Bengali,
     Marathi, Gujarati, Telugu, Kannada and Assamese, and Santali is a scheduled language.
     Check which of these BHASHINI supports at the time of onboarding.
   - **Pages:** a few busy ones: schemes, scholarships and the Forest Rights Act.
3. **Measure, then decide:** translation quality (with native speakers), accessibility, speed
   and the privacy terms of the service.

**Decision needed** from the competent authority: approve the pilot, and choose option A or B.
