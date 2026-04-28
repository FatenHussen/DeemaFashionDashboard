import { isActiveLanguageArabic } from 'src/lib/language-code';

// ----------------------------------------------------------------------

export type TranslatedValue =
  | string
  | { ar?: string; en?: string }
  | null
  | undefined
  | unknown[];

/**
 * Safely format a value that may be a string or { ar, en } object.
 * Picks `ar` or `en` based on the active UI language (i18n).
 */
export function formatTranslated(value: TranslatedValue, fallback = '-'): string {
  if (value == null) return fallback;
  if (Array.isArray(value)) return fallback;
  if (typeof value === 'string') return value || fallback;
  if (typeof value === 'object' && (value.ar != null || value.en != null)) {
    const obj = value as { ar?: string; en?: string };
    if (isActiveLanguageArabic()) {
      return obj.ar || obj.en || fallback;
    }
    return obj.en || obj.ar || fallback;
  }
  return fallback;
}
