import { CONFIG } from 'src/global-config';

/**
 * List/detail payloads may send `affiliate_id` as a plain string or as an embedded
 * resource object (e.g. `{ id, name, code }`).
 */
export function normalizeAffiliateId(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw);
  if (typeof raw === 'object' && raw !== null) {
    const o = raw as Record<string, unknown>;
    if (typeof o.code === 'string' && o.code.trim()) return o.code.trim();
    if (typeof o.name === 'string' && o.name.trim()) return o.name.trim();
    if (o.id != null) return String(o.id);
  }
  return '';
}

/** API may send the image under any of these keys. */
const IMAGE_KEYS = [
  'image_url',
  'image',
  'avatar_url',
  'avatar',
  'profile_image',
  'photo',
] as const;

export function pickAffiliateImageRaw(affiliate: Record<string, unknown> | null | undefined): string | null {
  if (!affiliate) return null;
  for (const key of IMAGE_KEYS) {
    const v = affiliate[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

/**
 * Returns a URL suitable for <img src>, or null when the API only sent a storage root
 * (e.g. `https://host/storage`) or an empty relative path — those are not loadable images.
 */
export function resolveAffiliateImageUrl(
  raw: string | null | undefined,
  serverBase: string = CONFIG.serverUrl
): string | null {
  if (raw == null || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;

  let url = t;
  if (!/^https?:\/\//i.test(url)) {
    const base = (serverBase || '').replace(/\/$/, '') || (typeof window !== 'undefined' ? window.location.origin : '');
    if (!base) return null;
    if (url.startsWith('//')) url = `https:${url}`;
    else if (url.startsWith('/')) url = `${base}${url}`;
    else url = `${base}/${url}`;
  }

  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    // e.g. /storage only — Laravel disk root, not a file
    if (parts.length === 1 && parts[0].toLowerCase() === 'storage') {
      return null;
    }
  } catch {
    return null;
  }

  return url;
}

/** Deterministic gradient for placeholder avatars (no external services). */
export function initialsFromName(name: string | undefined): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function affiliateGradientFromName(name: string | undefined): { from: string; to: string; ring: string } {
  const s = name?.trim() || '?';
  let h = 210;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) % 360;
  }
  const h2 = (h + 42) % 360;
  return {
    from: `hsl(${h} 72% 46%)`,
    to: `hsl(${h2} 68% 36%)`,
    ring: `hsla(${h}, 85%, 70%, 0.45)`,
  };
}
