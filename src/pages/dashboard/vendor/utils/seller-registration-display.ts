import { normalizeShopTypeFromApi, type ShopType } from '../types/shop.types';

/**
 * API may send `country` as a string (`country_id` legacy) or as a nested
 * resource `{ id, name, code }`.
 */
export function formatSellerRegistrationCountry(country: unknown): string {
  if (country == null) return '';
  if (typeof country === 'string' || typeof country === 'number') return String(country);
  if (typeof country === 'object' && country !== null) {
    const o = country as Record<string, unknown>;
    if (typeof o.name === 'string' && o.name.trim()) return o.name.trim();
    if (typeof o.code === 'string' && o.code.trim()) return o.code.trim();
    if (o.id != null) return String(o.id);
  }
  return '';
}

/** Maps registration fields to the same shop-type enum used elsewhere in the dashboard. */
export function normalizeSellerRegistrationShopType(item: {
  seller_type?: string | null;
  is_restaurant?: boolean | null;
  is_service_provider?: boolean | null;
}): ShopType {
  return normalizeShopTypeFromApi({
    shop_type: item.seller_type ?? '',
    is_restaurant: Boolean(item.is_restaurant),
    is_service_provider: Boolean(item.is_service_provider),
  });
}
