/**
 * Some multipart APIs use Laravel `required` on `description[en|ar]`, so truly empty
 * strings fail. We send a single zero‑width / format char when both are empty so
 * the field is “present and non-empty”, while the UI can still show optional fields.
 * Strip the same on load from the API.
 */
const INVISIBLE_PLACEHOLDER = '\u200C';

/** For FormData: both empty → two placeholders; else trimmed values. */
export function toApiBilingualDescription(en: string, ar: string): { en: string; ar: string } {
  const e = (en ?? '').trim();
  const a = (ar ?? '').trim();
  if (e === '' && a === '') {
    return { en: INVISIBLE_PLACEHOLDER, ar: INVISIBLE_PLACEHOLDER };
  }
  return { en: e, ar: a };
}

const INVISIBLES = /[\u200B-\u200D\uFEFF]/g;

/** When filling forms from API, treat placeholder-only as empty for display. */
export function stripBilingualDescriptionForForm(value: string | undefined | null): string {
  if (value == null) return '';
  return value.replace(INVISIBLES, '').trim();
}
