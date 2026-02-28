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
  name: string;
  color: string;
}

export interface ShopData {
  id: number;
  name: string | { ar: string; en: string };
  description?: string | { ar: string; en: string };
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
  phone?: string;
  mobile?: string;
  email?: string;
  working_hours?: WorkingHours;
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
  closed?: boolean;
}

export interface ShopCreateUpdatePayload {
  vendor_id: number;
  /** File for new upload, or string URL when keeping existing logo on update */
  logo?: File | string | null;
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
}
