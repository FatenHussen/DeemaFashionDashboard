import { create } from 'zustand';

import { queryClient } from 'src/lib/query-client';
import i18n, { LANGUAGE_STORAGE_KEY } from 'src/lib/i18n';

// ----------------------------------------------------------------------

const RTL_LANGUAGES = ['ar'];

function getDirectionForLang(lang: string): 'ltr' | 'rtl' {
  return RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
}

function applyLangToDOM(lang: string) {
  const direction = getDirectionForLang(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = direction;
}

// ----------------------------------------------------------------------

interface LocalizationState {
  direction: 'ltr' | 'rtl';
  language: string;
  setDirection: (direction: 'ltr' | 'rtl') => void;
  setLanguage: (language: string) => void;
}

// ----------------------------------------------------------------------

const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'ar';

// Apply saved language to DOM immediately on store init
applyLangToDOM(savedLanguage);

// ----------------------------------------------------------------------

export const useLocalizationStore = create<LocalizationState>((set) => ({
  direction: getDirectionForLang(savedLanguage),
  language: savedLanguage,

  setDirection: (direction) => set({ direction }),

  setLanguage: (language) => {
    const direction = getDirectionForLang(language);

    // Persist to localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    // Update i18next
    i18n.changeLanguage(language);

    // Apply to DOM
    applyLangToDOM(language);

    set({ language, direction });

    // After the current task: i18n + React have applied; refetch uses getActiveLanguageCode() (localStorage-first)
    queueMicrotask(() => {
      queryClient.invalidateQueries();
    });
  },
}));
