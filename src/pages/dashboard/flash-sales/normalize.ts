import type { FlashSaleModel, FlashSaleListItem, FlashSaleDiscountType } from './types';

/** API may return `discount` as a decimal string (e.g. `"0.00"`). */
export function parseFlashSaleDiscountValue(raw: unknown): number {
  if (raw == null || raw === '') return 0;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const n = parseFloat(String(raw).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Map API variants to `percent` | `fixed`. */
export function normalizeFlashSaleDiscountType(raw: unknown): FlashSaleDiscountType {
  if (raw == null || raw === '') return 'percent';
  const s = String(raw).toLowerCase().trim().replace(/-/g, '_');
  if (s === 'percentage' || s === 'percent' || s === 'pct') return 'percent';
  if (s === 'fixed' || s === 'amount' || s === 'fixed_amount') return 'fixed';
  return 'percent';
}

/** List row after parsing API fields (e.g. `discount` as `"0.00"` string). */
export function normalizeFlashSaleListItem(raw: Record<string, unknown>): FlashSaleListItem {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    end_date: String(raw.end_date ?? ''),
    is_active: Boolean(raw.is_active),
    discount: parseFlashSaleDiscountValue(raw.discount),
    discount_type: normalizeFlashSaleDiscountType(raw.discount_type),
  };
}

/** Parse `products` or `product_ids` from API (IDs only or `{ id }` objects). */
export function parseFlashSaleProductIds(raw: Record<string, unknown>): number[] {
  const fromProducts = raw.products;
  const fromIds = raw.product_ids;
  const arr = Array.isArray(fromProducts)
    ? fromProducts
    : Array.isArray(fromIds)
      ? fromIds
      : [];
  const ids = arr
    .map((x) => {
      if (typeof x === 'number' && Number.isFinite(x)) return x;
      if (typeof x === 'string' && x.trim() !== '') return Number(x);
      if (x != null && typeof x === 'object' && 'id' in (x as object)) {
        const id = Number((x as { id: unknown }).id);
        return Number.isFinite(id) ? id : NaN;
      }
      return NaN;
    })
    .filter((n) => Number.isFinite(n) && n > 0);
  return [...new Set(ids)];
}

/** Normalize a flash-sale record from list/show/update responses. */
export function normalizeFlashSaleRecord(raw: Record<string, unknown>): FlashSaleModel {
  const base = normalizeFlashSaleListItem(raw);
  const product_ids = parseFlashSaleProductIds(raw);
  return {
    ...base,
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
    ...(product_ids.length > 0 ? { product_ids } : {}),
  };
}
