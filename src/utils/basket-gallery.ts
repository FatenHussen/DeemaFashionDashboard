import { formatTranslated } from '@/utils/format-translated';
import { resolveStorageImageUrl } from '@/utils/shop-variant-image';

/**
 * Prefer `images` from API; if empty, fall back to single `image` (legacy).
 * URLs are passed through storage base resolution so relative paths render correctly.
 */
export function resolveBasketGalleryUrls(source: {
  image?: string | null;
  images?: string[] | null;
}): string[] {
  const fromGallery = Array.isArray(source.images)
    ? source.images
        .map((u) => (typeof u === 'string' ? resolveStorageImageUrl(u) : null))
        .filter((u): u is string => u != null && u.trim() !== '')
    : [];
  if (fromGallery.length > 0) return fromGallery;
  const primary = resolveStorageImageUrl(source.image);
  return primary != null && primary.trim() !== '' ? [primary] : [];
}

/** Normalize API `brand` or `product.brand` for display (string or nested name). */
export function formatBasketBrandLabel(brand: unknown): string | null {
  if (brand == null) return null;
  if (typeof brand === 'string') return brand.trim() || null;
  if (typeof brand === 'object' && brand !== null && 'name' in brand) {
    const n = (brand as { name?: unknown }).name;
    if (typeof n === 'string') return n.trim() || null;
    if (n && typeof n === 'object') {
      return formatTranslated(n as Parameters<typeof formatTranslated>[0]) || null;
    }
  }
  return null;
}
