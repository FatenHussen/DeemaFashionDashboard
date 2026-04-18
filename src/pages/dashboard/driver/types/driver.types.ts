// ----------------------------------------------------------------------

import type { CityData } from '../../locations/types/city.types';

export interface DriverShopRef {
  id: number;
  name: string;
}

export interface DriverData {
  id: number;
  name?: string;
  phone: string;
  address: string;
  status: string;
  is_active: number | boolean;
  image?: string | null;
  rate_per_order: number | string;
  vehicle_name?: string | null;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
  /** Vehicle photo URL from API */
  vehicle_image?: string | null;
  average_rating?: number;
  total_orders?: number;
  completed_orders?: number;
  total_earnings?: number;
  created_at: string;
  /** Shops linked to this driver (list + details). */
  shops?: DriverShopRef[];
}

export interface DriverDetailsData extends DriverData {
  cities: CityData[];
}

export interface DriverListResponse {
  status: boolean;
  message: string;
  data: {
    items: DriverData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface DriverDetailsResponse {
  status: boolean;
  message: string;
  data: DriverDetailsData;
}

export interface DriverCreateUpdatePayload {
  name: string;
  phone: string;
  password?: string;
  address: string;
  city_ids: Array<{ id: number }>;
  rate_per_order?: number | string;
  vehicle_name?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  /** Operational availability: available, busy, inactive — optional on partial updates */
  status?: string;
  /** Account enabled — optional on partial updates */
  is_active?: number | boolean;
  /** New profile image file only; omit to keep the existing photo */
  image?: File | null;
  /** New vehicle image file only; omit on update to keep existing vehicle photo */
  vehicle_image?: File | null;
  /**
   * Optional shop links, each item `{ id }`.
   * On update: omit entirely to keep existing links; send `[]` to clear all; send new list to replace.
   */
  shop_ids?: Array<{ id: number }>;
}

