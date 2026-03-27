import i18n, { LANGUAGE_STORAGE_KEY } from 'src/lib/i18n';

// ----------------------------------------------------------------------

/**
 * Single source for "which language is active" for API headers and {ar,en} display.
 * Prefer localStorage: it is updated synchronously in setLanguage before i18n finishes switching.
 */
export function getActiveLanguageCode(): string {
  const raw =
    localStorage.getItem(LANGUAGE_STORAGE_KEY) ||
    i18n.resolvedLanguage ||
    i18n.language ||
    'en';
  const code = String(raw).split(/[-_]/)[0]?.toLowerCase();
  return code && /^[a-z]{2,3}$/i.test(code) ? code : 'en';
}

export function isActiveLanguageArabic(): boolean {
  return getActiveLanguageCode() === 'ar';
}
