import { CONFIG } from 'src/global-config';

import { formatTranslated, type TranslatedValue } from '@/utils/format-translated';

// ----------------------------------------------------------------------

const COLOR_HEX_IN_LABEL = /Color:\s*(#[0-9A-Fa-f]{3,8})\b/i;

function linearizeChannel(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Hex from shop-variant API `label`, e.g. `(Color: #F0E68C | Size: …)`. */
export function shopVariantOptionColorHex(item: object): string | null {
  const r = item as Record<string, unknown>;
  const label = formatTranslated(r.label as TranslatedValue, '');
  const m = String(label).match(COLOR_HEX_IN_LABEL);
  return m ? m[1].toUpperCase() : null;
}

/** Expand `#RGB` to `#RRGGBB`; strip alpha if present (uses first 6 hex digits). */
export function normalizeHexColorForCss(hex: string): string {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  if (h.length >= 6) {
    h = h.slice(0, 6);
  }
  return `#${h}`;
}

export function relativeLuminanceFromHex(cssHex: string): number {
  const n = normalizeHexColorForCss(cssHex).replace('#', '');
  const r = linearizeChannel(parseInt(n.slice(0, 2), 16) / 255);
  const g = linearizeChannel(parseInt(n.slice(2, 4), 16) / 255);
  const b = linearizeChannel(parseInt(n.slice(4, 6), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function hexForegroundOnBackground(hex: string): string {
  return relativeLuminanceFromHex(hex) > 0.179 ? '#171717' : '#fafafa';
}

// ----------------------------------------------------------------------

/** Build absolute URL for storage paths from admin API (`variant_image`, product images, etc.). */
export function resolveStorageImageUrl(url: string | null | undefined): string | null {
  if (url == null || String(url).trim() === '') return null;
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const base = CONFIG.serverUrl?.replace(/\/$/, '') ?? '';
  if (!base) return s;
  return `${base}/${s.replace(/^\//, '')}`;
}

/**
 * Thumbnail URL for rows from `GET /admin/shop-product-variants` (spread preserves extra fields).
 * Primary key from API: `variant_image`.
 */
export function shopVariantOptionImage(item: object): string | null {
  const r = item as Record<string, unknown>;
  const raw =
    (r.variant_image as string | undefined) ??
    (r.image as string | undefined) ??
    (r.product_image as string | undefined) ??
    ((r.product as { image?: string } | undefined)?.image) ??
    (r.thumbnail as string | undefined);
  return resolveStorageImageUrl(raw);
}
