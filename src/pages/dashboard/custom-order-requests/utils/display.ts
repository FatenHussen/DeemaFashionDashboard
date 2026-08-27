import type { CustomOrderRequestListItem } from '../types/custom-order-request.types';

import { resolveStorageImageUrl } from '@/utils/shop-variant-image';

export function getCustomOrderRequestText(item: CustomOrderRequestListItem): string {
  const raw =
    item.description ??
    item.text ??
    item.content ??
    item.note ??
    (typeof item.message === 'string' ? item.message : null);
  return (raw && String(raw).trim()) || '—';
}

export function getCustomOrderRequestAddress(item: CustomOrderRequestListItem): string {
  if (typeof item.address_text === 'string' && item.address_text.trim()) {
    return item.address_text.trim();
  }
  if (typeof item.address === 'string' && item.address.trim()) {
    return item.address.trim();
  }
  if (item.address && typeof item.address === 'object') {
    const a = item.address;
    const parts = [
      a.full_address,
      a.address,
      a.street,
      a.building,
      a.floor,
      a.notes,
    ].filter((p) => typeof p === 'string' && p.trim());
    if (parts.length) return parts.join(' · ');
  }
  return '—';
}

export function getCustomOrderRequestExpectedTime(item: CustomOrderRequestListItem): string {
  const raw = item.expected_delivery_time ?? item.expected_at ?? item.delivery_time;
  return (raw && String(raw).trim()) || '—';
}

export function getCustomOrderRequestImageUrls(item: CustomOrderRequestListItem): string[] {
  const images = item.images;
  if (!Array.isArray(images) || images.length === 0) return [];

  return images
    .map((img) => {
      if (typeof img === 'string') return resolveStorageImageUrl(img);
      if (img && typeof img === 'object') {
        return resolveStorageImageUrl(img.url ?? img.path ?? img.image ?? null);
      }
      return null;
    })
    .filter((url): url is string => Boolean(url));
}

export function getLinkedOrderId(item: CustomOrderRequestListItem): number | null {
  if (typeof item.order_id === 'number' && item.order_id > 0) return item.order_id;
  if (item.order?.id != null && Number(item.order.id) > 0) return Number(item.order.id);
  return null;
}
