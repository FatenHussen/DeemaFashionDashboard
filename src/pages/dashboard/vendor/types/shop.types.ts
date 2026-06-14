// ----------------------------------------------------------------------

import type { VendorData } from './vendor.types';

export interface ShopGovernorate {
  id: number;
  name?: { ar: string; en: string };
  created_at?: string;
}

export interface ShopCity {
  id: number;
  name?: { ar: string; en: string };
  governorate?: ShopGovernorate;
  created_at?: string;
}

export interface ShopArea {
  id: number;
  name?: { ar: string; en: string };
  lat?: number | string | null;
  lng?: number | string | null;
  base_fee?: number;
  created_at?: string;
  city?: ShopCity;
}

export interface ShopService {
  id: number;
  name?: { ar: string; en: string };
}

export interface ShopBadge {
  id?: number;
  name?: string;
  color?: string;
  position?: string;
  postion?: string;
}

/** Classifies shops for admin and app filters (API: `shop_type`). */
export type ShopType = 'restaurant' | 'service_provider' | 'store';

/** Price positioning for discovery (API: `pricing_tier`; legacy: `price_level`). */
export type ShopPriceLevel = 'cheap' | 'medium' | 'expensive';

/** Allowed payment method values (API: `payment_methods.*` in: cash, online). */
export type ShopPaymentMethod = 'cash' | 'online';

export interface ShopCouponRef {
  id: number;
  name?: string;
  code?: string;
}

export interface ShopData {
  id: number;
  name: string | { ar: string; en: string };
  /** API may return `[]` when empty */
  description?: string | { ar: string; en: string } | unknown[];
  address?: string | { ar: string; en: string };
  logo_url?: string | null;
  is_active: boolean;
  average_rating?: number;
  ratings_count?: number;
  is_open_now?: boolean;
  created_at?: string;
  vendor?: VendorData;
  vendor_id?: number;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  /** Per-day schedule and/or compact keys e.g. `{ "sat-sun": "08:00-20:00" }` */
  working_hours?: WorkingHours | Record<string, string>;
  area_id?: number;
  area?: ShopArea;
  services?: ShopService[];
  service_ids?: Array<{ id: number }>;
  badges?: ShopBadge[];
  updated_at?: string;
  /** Primary classification; may be derived from legacy flags when missing. */
  shop_type?: ShopType | string;
  is_restaurant?: boolean;
  is_service_provider?: boolean;
  payment_methods?: string[];
  /** Preferred API field */
  pricing_tier?: ShopPriceLevel | string;
  price_level?: ShopPriceLevel | string;
  is_recommended?: boolean;
  recommended?: boolean;
  coupons?: ShopCouponRef[];
  coupon_ids?: number[];
  /** Many-to-many category IDs (admin create/update). */
  category_ids?: number[];
  /** Resolved category rows from API. */
  categories?: Array<{ id: number; name: string | { ar: string; en: string } }>;
}

/** Resolves `shop_type` from API (explicit enum or legacy booleans). */
export function normalizeShopTypeFromApi(
  shop: Pick<ShopData, 'shop_type' | 'is_restaurant' | 'is_service_provider'>
): ShopType {
  const raw = String(shop.shop_type ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (raw === 'restaurant' || raw === 'service_provider' || raw === 'store') return raw;
  if (raw === 'serviceprovider' || raw === 'provider' || raw === 'service') {
    return 'service_provider';
  }
  if (raw === 'shop') return 'store';
  if (shop.is_restaurant) return 'restaurant';
  if (shop.is_service_provider) return 'service_provider';
  return 'store';
}

export function normalizeShopPriceLevelFromApi(
  shop: Pick<ShopData, 'price_level' | 'pricing_tier'>
): ShopPriceLevel {
  const v = String(shop.pricing_tier ?? shop.price_level ?? '').toLowerCase();
  if (v === 'cheap' || v === 'low') return 'cheap';
  if (v === 'medium' || v === 'mid') return 'medium';
  if (v === 'expensive' || v === 'high') return 'expensive';
  return 'medium';
}

export function paymentMethodsFromShop(shop: ShopData): ShopPaymentMethod[] {
  const raw = shop.payment_methods;
  if (!Array.isArray(raw)) return [];
  const allowed: ShopPaymentMethod[] = ['cash', 'online'];
  return raw
    .map(String)
    .filter((m): m is ShopPaymentMethod => allowed.includes(m as ShopPaymentMethod));
}

export function couponIdsFromShop(shop: ShopData): number[] {
  if (Array.isArray(shop.coupon_ids) && shop.coupon_ids.length) {
    return shop.coupon_ids.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  }
  if (Array.isArray(shop.coupons)) {
    return shop.coupons.map((c) => c.id).filter((n) => Number.isFinite(n) && n > 0);
  }
  return [];
}

export interface ShopListResponse {
  status: boolean;
  message: string;
  data: {
    items: ShopData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface WorkingHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  open?: string;
  close?: string;
  /** API may send boolean, 0/1, or string flags. */
  closed?: boolean | number | string;
}

export interface ShopCreateUpdatePayload {
  vendor_id: number;
  /** New image file only. Omit (undefined) on update to keep the current logo — do not send the old URL as text. */
  logo?: File | null;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  address: {
    ar: string;
    en: string;
  };
  lat?: number;
  lng?: number;
  phone: string;
  mobile: string;
  email: string;
  working_hours: WorkingHours;
  is_active: boolean;
  area_id: number;
  service_ids: Array<{ id: number }>;
  badges?: number[];
  is_restaurant: boolean;
  payment_methods: ShopPaymentMethod[];
  pricing_tier: ShopPriceLevel;
  is_recommended: boolean;
  category_ids?: number[];
}
