import { resolveStorageImageUrl } from '@/utils/shop-variant-image';

function trimmedUrl(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * `image` and `icon` are the same file. Prefer the URL that carries `?v=`
 * so a replaced file is not shown from the browser cache.
 */
export function iconArtworkSrc(item: {
  icon?: string | null;
  image?: string | null;
} | null | undefined): string | null {
  if (!item) return null;
  const image = trimmedUrl(item.image);
  const icon = trimmedUrl(item.icon);
  const versioned = [image, icon].find((url) => /[?&]v=/.test(url));
  const resolved = resolveStorageImageUrl(versioned || icon || image || null);
  if (!resolved) return null;
  // Relative storage paths must not sit under `/api`.
  return resolved.replace(/\/api\/storage\//, '/storage/');
}
