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
  lat: number;
  lng: number;
  phone: string;
  mobile: string;
  email: string;
  working_hours: WorkingHours;
  is_active: boolean;
  area_id: number;
  service_ids: Array<{ id: number }>;
  badges?: Array<{ id: number; position: 'top' | 'bottom' }>;
}
