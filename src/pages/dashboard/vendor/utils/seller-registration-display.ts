/**
 * API may send `country` as a string (`country_id` legacy) or as a nested
 * resource `{ id, name, code }`.
 */
export function formatSellerRegistrationCountry(country: unknown): string {
  if (country == null) return '';
  if (typeof country === 'string' || typeof country === 'number') return String(country);
  if (typeof country === 'object' && country !== null) {
    const o = country as Record<string, unknown>;
    if (typeof o.name === 'string' && o.name.trim()) return o.name.trim();
    if (typeof o.code === 'string' && o.code.trim()) return o.code.trim();
    if (o.id != null) return String(o.id);
  }
  return '';
}
