// Chat assistant settings and content: the Ministry's "Jago" chat widget, rebuilt in the
// site's DBIM design. The service behind it is the Ministry's TriBot service
// (tribot.tribal.gov.in). Markup: src/components/TriBot.astro. Behaviour:
// packages/dbim-kit/src/js/tribot.ts. Edit here to rename the assistant, change the
// suggested questions or the languages offered.

import type { Bilingual } from './site';

export interface AssistantLanguage {
  /** Code the TriBot service expects in the `language` field. */
  code: string;
  en: string;
  hi: string;
  /** Name in the language itself, shown in brackets (as on the original widget). */
  native: string;
  /** BCP 47 tag set as `lang` on answers, so screen readers pick the right voice (WCAG 3.1.2). */
  tag: string;
  /** Locale for voice input (browser speech recognition). */
  speech: string;
}

export const assistant = {
  /** Name shown to visitors. Change both languages together. */
  name: { en: 'Jago', hi: 'जागो' } as Bilingual,

  /**
   * Same-origin path. IIS forwards /tribot-api/* to https://tribot.tribal.gov.in/api/v1/*
   * (docs/DEPLOYMENT.md). The browser cannot call the service directly: in Oct 2026 it
   * rejected cross-origin requests from tribal.gov.in. No API key is used in the browser.
   */
  endpoint: '/tribot-api/chat',

  /** The service took 11–17 s per answer in Oct 2026; give up after this many seconds. */
  timeoutSeconds: 60,

  /** Mascot artwork from the Ministry's chat widget, pre-sized WebP (public/images/assistant/).
   *  Source: src/assets/assistant/jago-mascot-source.png (1202 × 1309 PNG). To make new sizes:
   *  sharp(source).resize({ width, height: width, fit: 'contain', background: transparent }).webp({ quality: 82 }). */
  avatar: { small: '/images/assistant/jago-96.webp', large: '/images/assistant/jago-160.webp' },

  /** Answer languages offered by the TriBot service (as on the original widget). */
  languages: [
    { code: 'eng', en: 'English', hi: 'अंग्रेज़ी', native: 'English', tag: 'en', speech: 'en-IN' },
    { code: 'hin', en: 'Hindi', hi: 'हिन्दी', native: 'हिन्दी', tag: 'hi', speech: 'hi-IN' },
    { code: 'gnd', en: 'Gondi', hi: 'गोंडी', native: 'गोंडी', tag: 'gon', speech: 'hi-IN' },
    { code: 'sat', en: 'Santali', hi: 'संथाली', native: 'ᱥᱟᱱᱛᱟᱲᱤ', tag: 'sat', speech: 'sat-IN' },
    { code: 'mun', en: 'Mundari', hi: 'मुंडारी', native: 'मुंडारी', tag: 'unr', speech: 'hi-IN' },
    { code: 'bhili', en: 'Bhili', hi: 'भीली', native: 'भीली', tag: 'bhb', speech: 'hi-IN' },
    { code: 'bettakuruba', en: 'Bettakuruba', hi: 'बेट्टा कुरुबा', native: 'ಬೆಟ್ಟ ಕುರುಬ', tag: 'xub', speech: 'kn-IN' },
    { code: 'garo', en: 'Garo', hi: 'गारो', native: 'A·chik', tag: 'grt', speech: 'en-IN' },
    { code: 'kokborok', en: 'Kokborok', hi: 'कोकबोरोक', native: 'Tripuri', tag: 'trp', speech: 'bn-IN' },
    { code: 'koya', en: 'Koya', hi: 'कोया', native: 'కోయ', tag: 'kff', speech: 'te-IN' },
    { code: 'kui', en: 'Kui', hi: 'कुई', native: 'କୁଇ', tag: 'kxu', speech: 'or-IN' },
  ] satisfies AssistantLanguage[],

  /** Suggested questions shown before the first message. */
  suggestions: [
    { en: 'What is PM-JANMAN?', hi: 'पीएम-जनमन क्या है?' },
    { en: 'How do I apply for a scholarship?', hi: 'छात्रवृत्ति के लिए आवेदन कैसे करें?' },
    { en: 'FRA claims process', hi: 'वन अधिकार दावा प्रक्रिया' },
  ] as Bilingual[],
};
