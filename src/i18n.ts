import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import tr from './locales/tr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import fa from './locales/fa.json';
import ku from './locales/ku.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
      tr: { translation: tr },
      de: { translation: de },
      es: { translation: es },
      fa: { translation: fa },
      ku: { translation: ku },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'alyam_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
