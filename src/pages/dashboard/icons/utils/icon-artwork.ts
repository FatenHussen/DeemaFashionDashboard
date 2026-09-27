import { resolveStorageImageUrl } from '@/utils/shop-variant-image';

function trimmedUrl(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Pull a URL out of a string or `{ url | path | full_url }`. */
export function iconUrlFrom(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const row = value as Record<string, unknown>;
  for (const key of ['url', 'full_url', 'original_url', 'path', 'src']) {
    if (typeof row[key] === 'string' && row[key].trim()) return row[key].trim();
  }
  return '';
}

function cacheVersion(url?: string | null): string {
  const query = trimmedUrl(url).split('?')[1]?.split('#')[0] ?? '';
  if (!query) return '';
  return new URLSearchParams(query).get('v') ?? '';
}

/** Storage path without `?v=` or hash. */
export function iconStoragePath(url?: string | null): string {
  const raw = trimmedUrl(url).split(/[?#]/)[0]?.replace(/\/api\/storage\//, '/storage/') ?? '';
  if (!raw) return '';
  try {
    return decodeURIComponent(new URL(raw, 'https://icons.local').pathname).replace(/\/+$/, '');
  } catch {
    return raw;
  }
}

/**
 * The upload landed when the stored path changed, or the same file came back with a new `?v=`
 * (the server replaced the bytes in place and cache-busted the URL).
 */
export function iconImageWasReplaced(
  previousUrl: string | null | undefined,
  nextUrl: string | null | undefined,
  sentFile: boolean
): boolean {
  if (!sentFile) return false;
  const nextPath = iconStoragePath(nextUrl);
  if (!nextPath) return false;
  if (nextPath !== iconStoragePath(previousUrl)) return true;
  const nextVersion = cacheVersion(nextUrl);
  return nextVersion !== '' && nextVersion !== cacheVersion(previousUrl);
}

/** Keep the response URL, including `?v=`, for preview and lists. */
export function iconPreviewUrl(url?: string | null): string | null {
  const resolved = resolveStorageImageUrl(trimmedUrl(url) || null);
  if (!resolved) return null;
  return resolved.replace(/\/api\/storage\//, '/storage/');
}

/**
 * `image` and `icon` are the same file after a real replace.
 * Prefer `image`. Use the copy that carries `?v=` only when both point at that same file.
 */
export function pickIconFileUrl(image?: string | null, icon?: string | null): string {
  const imageUrl = trimmedUrl(image);
  const iconUrl = trimmedUrl(icon);
  const imagePath = iconStoragePath(imageUrl);
  const iconPath = iconStoragePath(iconUrl);
  const sameFile = Boolean(imagePath) && imagePath === iconPath;
  if (sameFile) {
    return [imageUrl, iconUrl].find((url) => /[?&]v=/.test(url)) || imageUrl || iconUrl;
  }
  return imageUrl || iconUrl;
}

export function iconArtworkSrc(item: {
  icon?: string | null;
  image?: string | null;
} | null | undefined): string | null {
  if (!item) return null;
  return iconPreviewUrl(pickIconFileUrl(item.image, item.icon));
}
