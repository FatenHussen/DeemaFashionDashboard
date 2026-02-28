// ----------------------------------------------------------------------

export type TranslatedValue = string | { ar?: string; en?: string } | null | undefined;

/**
 * Safely format a value that may be a string or { ar, en } object.
 * Returns a displayable string. Prefers 'en' then 'ar'.
 */
export function formatTranslated(value: TranslatedValue, fallback = '-'): string {
  if (value == null) return fallback;
  if (typeof value === 'string') return value || fallback;
  if (typeof value === 'object' && (value.ar != null || value.en != null)) {
    const obj = value as { ar?: string; en?: string };
    return obj.en || obj.ar || fallback;
  }
  return fallback;
}
