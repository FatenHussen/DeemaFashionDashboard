import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enNav from '../locales/en/nav.json';
import arNav from '../locales/ar/nav.json';
import enTable from '../locales/en/table.json';
import arTable from '../locales/ar/table.json';
import enValidation from '../locales/en/validation.json';
import arValidation from '../locales/ar/validation.json';

// ----------------------------------------------------------------------

const LANGUAGE_STORAGE_KEY = 'app-language';

const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';

// ----------------------------------------------------------------------

i18n.use(initReactI18next).init({
  resources: {
    en: {
      table: enTable,
      nav: enNav,
      validation: enValidation,
    },
    ar: {
      table: arTable,
      nav: arNav,
      validation: arValidation,
    },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export { LANGUAGE_STORAGE_KEY };

export default i18n;
