import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { permissionTranslationsAr, permissionTranslationsEn } from '../locales/permission-translations';

// ----------------------------------------------------------------------

export const LANGUAGE_STORAGE_KEY = 'app-language';

const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';

// ----------------------------------------------------------------------

i18n.use(initReactI18next).init({
  resources: {
    en: {
      nav: en.nav,
      table: en.table,
      validation: en.validation,
      common: {
        ...en.common,
        ...permissionTranslationsEn,
      },
    },
    ar: {
      nav: ar.nav,
      table: ar.table,
      validation: ar.validation,
      common: {
        ...ar.common,
        ...permissionTranslationsAr,
      },
    },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  defaultNS: 'table',
  ns: ['table', 'nav', 'validation', 'common'],
  interpolation: {
    escapeValue: false,
  },
});

// Keep persistence aligned with i18n so axios and the next page load use the same code.
i18n.on('languageChanged', (lng) => {
  const code = String(lng).split(/[-_]/)[0]?.toLowerCase() || 'en';
  localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
});

export default i18n;
