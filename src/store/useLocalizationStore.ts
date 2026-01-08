import { create } from 'zustand';

// ----------------------------------------------------------------------

interface LocalizationState {
  direction: 'ltr' | 'rtl';
  language: string;
  setDirection: (direction: 'ltr' | 'rtl') => void;
  setLanguage: (language: string) => void;
}

// ----------------------------------------------------------------------

export const useLocalizationStore = create<LocalizationState>((set) => ({
  direction: 'ltr',
  language: 'en',
  setDirection: (direction) => set({ direction }),
  setLanguage: (language) => set({ language }),
}));

