export interface ShopVendorServiceData {
  id: number;
  shop_id: number;
  vendor_service_id: number;
  shop?: { id: number; name: string | { ar?: string; en?: string } };
  vendor_service?: { id: number; name: string | { ar?: string; en?: string } };
  extra_details?: Record<string, any> | null;
  price: number;
  price_unit?: string;
  duration_minutes?: number;
  schedule?: Record<string, { open?: string; close?: string; closed?: boolean }>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ShopVendorServiceListResponse {
  status: boolean;
  message: string;
  data: {
    items: ShopVendorServiceData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ShopVendorServiceCreatePayload {
  shop_id: number;
  vendor_service_id: number;
  price: number;
  price_unit?: string;
  duration_minutes?: number;
  extra_details?: Record<string, any>;
  schedule?: Record<string, { open?: string; close?: string; closed?: boolean }>;
  is_active: boolean;
}

export interface ShopVendorServiceUpdatePayload {
  price: number;
  price_unit?: string;
  duration_minutes?: number;
  extra_details?: Record<string, any>;
  schedule?: Record<string, { open?: string; close?: string; closed?: boolean }>;
  is_active: boolean;
}
