import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './en.json';
import translationHI from './hi.json';

// Resources for i18next
const resources = {
  en: {
    translation: translationEN
  },
  hi: {
    translation: translationHI
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n; 