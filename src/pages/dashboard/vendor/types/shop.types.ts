// ----------------------------------------------------------------------

import type { VendorData } from './vendor.types';

export interface ShopData {
  id: number;
  name: string;
  description?: string;
  logo_url?: string | null;
  is_active: boolean;
  average_rating: number;
  ratings_count: number;
  is_open_now: boolean;
  created_at: string;
  vendor: VendorData;
  // Additional fields that might be in POST/PUT but not in GET
  vendor_id?: number;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  mobile?: string;
  email?: string;
  working_hours?: WorkingHours;
  area_id?: number;
  service_ids?: Array<{ id: number }>;
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
