/**
 * Arabic UI language tag with Latin digits (0–9). Prevents mixed Eastern Arabic-Indic (١٣) and Western digits.
 * @see https://unicode.org/reports/tr35/#UnicodeNumberSystemIdentifier
 */
export const LOCALE_AR_LATIN_DIGITS = 'ar-u-nu-latn';

export function numberFormatLocaleForUi(language: string | undefined): string {
  const lng = language ?? 'en';
  if (lng === 'ar' || lng.startsWith('ar')) return LOCALE_AR_LATIN_DIGITS;
  return 'en-US';
}

/** U+0660–U+0669 (Arabic-Indic) and U+06F0–U+06F9 (Extended Arabic-Indic / Persian) → 0–9 */
export function normalizeIndicNumeralsToLatin(text: string | null | undefined): string {
  if (text == null) return '';
  return String(text)
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
