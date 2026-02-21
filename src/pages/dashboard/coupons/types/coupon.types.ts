// ----------------------------------------------------------------------

export type CouponType = 'general' | 'product' | 'vendor';

export interface CouponDiscount {
  type: 'percentage' | 'fixed';
  value: string;
}

export interface CouponItem {
  id: number;
  name: string;
  code: string;
  discount: CouponDiscount;
  start_at: string;
  end_at: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  is_expired: boolean;
  is_valid: boolean;
  city_id: number | null;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CouponListResponse {
  status: boolean;
  message: string;
  data: {
    items: CouponItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CouponDetailsData {
  id: number;
  name: string;
  code: string;
  discount: CouponDiscount;
  start_at: string;
  end_at: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  is_expired: boolean;
  is_valid: boolean;
  city_id: number | null;
  user_id: number | null;
  products: Array<{ id: number; name: string; [key: string]: any }>;
  categories: Array<{ id: number; name: string; [key: string]: any }>;
  vendors: Array<{ id: number; name: string; [key: string]: any }>;
  created_at: string;
  updated_at: string;
}

export interface CouponDetailsResponse {
  status: boolean;
  message: string;
  data: CouponDetailsData;
}

export interface CouponCreateUpdatePayload {
  name: { en: string; ar: string };
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  start_at: string;
  end_at: string;
  max_uses: number;
  is_active: boolean;
  products?: Array<{ id: number }>;
  vendors?: Array<{ id: number }>;
}
