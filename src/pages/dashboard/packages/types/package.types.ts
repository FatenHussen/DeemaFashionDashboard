// ----------------------------------------------------------------------

export interface PackageData {
  id: number;
  name: { ar?: string; en?: string } | string;
  price: number;
  duration_days: number;
  monthly_orders_limit: number;
  free_delivery_count: number;
  discount_percentage: number;
  points_bonus: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageListResponse {
  status: boolean;
  message: string;
  data: {
    items: PackageData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface PackageDetailsResponse {
  status: boolean;
  message: string;
  data: PackageData;
}

export interface PackageCreateUpdatePayload {
  name: { ar: string; en: string };
  price: number;
  duration_days: number;
  monthly_orders_limit: number;
  free_delivery_count: number;
  discount_percentage: number;
  points_bonus: number;
  is_active: boolean;
}
