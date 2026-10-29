/** Circle color while a category color value has a name but no shade yet. */
export const UNLINKED_SHADE_SWATCH = 'rgb(161, 161, 170)';

/** Catalog hex is `#RRGGBB`, stored uppercase. Anything else is not a swatch. */
export function normalizeCatalogHex(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const match = raw.trim().match(/^#?([0-9A-Fa-f]{6})$/);
  if (!match) return null;
  return `#${match[1].toUpperCase()}`;
}
