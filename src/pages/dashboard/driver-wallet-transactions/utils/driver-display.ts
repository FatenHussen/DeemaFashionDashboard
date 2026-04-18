import { CONFIG } from 'src/global-config';

const IMAGE_KEYS = [
  'image_url',
  'image',
  'avatar_url',
  'avatar',
  'profile_image',
  'photo',
] as const;

export function pickDriverImageRaw(driver: Record<string, unknown> | null | undefined): string | null {
  if (!driver) return null;
  for (const key of IMAGE_KEYS) {
    const v = driver[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

export function resolveDriverImageUrl(
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
    if (parts.length === 1 && parts[0].toLowerCase() === 'storage') {
      return null;
    }
  } catch {
    return null;
  }

  return url;
}

export function initialsFromName(name: string | undefined): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function driverGradientFromName(name: string | undefined): { from: string; to: string; ring: string } {
  const s = name?.trim() || '?';
  let h = 200;
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
