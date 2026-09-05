import type { ScheduleItem, ScheduleImageRef, ScheduleBadgeInput } from '../types/schedule.types';

import { resolveStorageImageUrl } from '@/utils/shop-variant-image';

export type ScheduleMediaItem = { id?: number; url: string };

function urlFileKey(url: string): string {
  const path = url.split('?')[0];
  const parts = path.split('/');
  return (parts[parts.length - 1] || path).toLowerCase();
}

function sameMediaUrl(a: string, b: string): boolean {
  if (a === b) return true;
  return urlFileKey(a) === urlFileKey(b) && urlFileKey(a) !== '';
}

function mediaUrl(raw: ScheduleImageRef | null | undefined): string | null {
  if (raw == null) return null;
  if (typeof raw === 'string') return resolveStorageImageUrl(raw) || raw;
  const u = raw.url ?? raw.original_url ?? raw.full_url;
  if (typeof u !== 'string' || !u.trim()) return null;
  return resolveStorageImageUrl(u) || u;
}

function mediaId(raw: unknown): number | undefined {
  if (raw && typeof raw === 'object' && 'id' in raw) {
    const n = Number((raw as { id: unknown }).id);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

function normalizeMediaList(raw: unknown): ScheduleMediaItem[] {
  if (!Array.isArray(raw)) return [];
  const out: ScheduleMediaItem[] = [];
  for (const item of raw) {
    const url = mediaUrl(item as ScheduleImageRef);
    if (!url) continue;
    out.push({ id: mediaId(item), url });
  }
  return out;
}

/** Primary card image + extra rotation images (for edit previews / `deleted_image_ids`). */
export function splitScheduleMedia(item: ScheduleItem): {
  primary: ScheduleMediaItem | null;
  extras: ScheduleMediaItem[];
} {
  const gallery = [...normalizeMediaList(item.images), ...normalizeMediaList(item.media)];
  const primaryUrl = mediaUrl(item.image) ?? gallery[0]?.url ?? null;
  if (!primaryUrl) return { primary: null, extras: gallery };

  const fromGallery = gallery.find((g) => sameMediaUrl(g.url, primaryUrl));
  const primary: ScheduleMediaItem = {
    url: primaryUrl,
    id: mediaId(item.image) ?? fromGallery?.id,
  };
  const extras = gallery.filter((g) => !sameMediaUrl(g.url, primaryUrl));
  return { primary, extras };
}

export function schedulePrimaryImageUrl(item: Pick<ScheduleItem, 'image' | 'images'>): string | null {
  const fromImage = mediaUrl(item.image);
  if (fromImage) return fromImage;
  const first = Array.isArray(item.images) ? item.images[0] : null;
  return mediaUrl(first as ScheduleImageRef);
}

export function bilingualFromApi(value: unknown): { en: string; ar: string } {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const o = value as { en?: string; ar?: string };
    return { en: o.en ?? '', ar: o.ar ?? '' };
  }
  if (typeof value === 'string') return { en: value, ar: value };
  return { en: '', ar: '' };
}

export function badgesFormValueFromSchedule(source: ScheduleItem): ScheduleBadgeInput[] {
  const map = new Map<number, ScheduleBadgeInput>();

  const push = (id: number, position: 'top' | 'bottom') => {
    if (!Number.isFinite(id) || id <= 0) return;
    map.set(id, { id, position });
  };

  for (const b of source.top_badges ?? []) {
    push(Number(b.id), b.position === 'bottom' ? 'bottom' : 'top');
  }
  for (const b of source.bottom_badges ?? []) {
    push(Number(b.id), b.position === 'top' ? 'top' : 'bottom');
  }
  if (map.size > 0) return [...map.values()];

  for (const b of source.badges ?? []) {
    const id = Number(b.id);
    const position = b.position === 'bottom' ? 'bottom' : 'top';
    push(id, position);
  }
  return [...map.values()];
}
