// ----------------------------------------------------------------------

export interface ScheduledBasketSchedule {
  id?: number;
  title: { en: string; ar: string } | string;
  number_of_days: number;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  is_active: boolean;
  is_default?: boolean;
  created_at?: string;
}

export interface ScheduledBasketItemAlternative {
  product_id?: number;
  shop_product_variant_id: number;
  name?: string;
  image_url?: string;
  price?: number;
  discount?: number | null;
  price_after_discount?: number | null;
  brand?: string | { name?: string | { ar?: string; en?: string } };
  product?: {
    brand?: string | { name?: string | { ar?: string; en?: string } };
  };
}

export interface ScheduledBasketItem {
  id?: number;
  product_id?: number;
  variant_id?: number;
  shop_product_variant_id: number;
  shop_product_variant_ids?: number[];
  quantity: number;
  unit_price?: number;
  subtotal?: number;
  is_required?: boolean;
  is_extra?: boolean;
  min_quantity?: number;
  max_quantity?: number;
  /** When present, prefer over separate brand fetches */
  brand?: string | { name?: string | { ar?: string; en?: string } };
  product?: {
    id: number;
    name: string | { ar?: string; en?: string };
    image?: string;
    brand?: string | { name?: string | { ar?: string; en?: string } };
  };
  variant_image?: string | null;
  variant?: {
    id: number;
    sku?: string | null;
    model?: string | null;
    barcode?: string | null;
    attributes?: Array<{ name: string; value: string }>;
  };
  shop_variant?: {
    price?: number;
    discount?: number | null;
    price_after_discount?: number | null;
    quantity?: number;
    variant?: {
      id?: number;
      price?: number;
      quantity?: number;
      discount?: number | null;
      price_after_discount?: number | null;
    };
  };
  alternatives?: ScheduledBasketItemAlternative[];
  created_at?: string;
  updated_at?: string;
}

export interface ScheduledBasketBadge {
  id: number;
  name?: string;
  icon?: string;
  position: string;
}

export interface ScheduledBasketData {
  id: number;
  name: string | { ar?: string; en?: string };
  description?: { ar?: string; en?: string } | string;
  category_ids?: number[];
  categories?: Array<{ id: number; name: string | { ar?: string; en?: string } }>;
  category?: { id: number; name: string | { ar?: string; en?: string } } | string;
  image?: string;
  images?: string[];
  num_varieties?: number;
  original_price?: number;
  discount: string | number;
  discount_type: 'fixed' | 'percentage';
  discount_amount?: number;
  final_price?: number;
  rating?: number;
  average_rating?: number;
  num_sold?: number;
  delivery_price?: number;
  is_schedule?: boolean;
  has_schedule?: boolean;
  schedule_count?: number;
  items?: ScheduledBasketItem[];
  schedules?: ScheduledBasketSchedule[];
  extras?: ScheduledBasketItem[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  badges?: ScheduledBasketBadge[];
}

export type ScheduledBasketSortField = 'id' | 'name' | 'price' | 'rating' | 'num_sold' | 'created_at';
export type ScheduledBasketSortOrder = 'asc' | 'desc';

export interface ScheduledBasketListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
  sort_field?: ScheduledBasketSortField;
  sort_order?: ScheduledBasketSortOrder;
}

export interface ScheduledBasketListResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data: {
    items: ScheduledBasketData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ScheduledBasketDetailsResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data: ScheduledBasketData;
}

export interface ScheduledBasketSchedulePayload {
  title: { en: string; ar: string };
  number_of_days: number;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  is_active: boolean;
  is_default?: boolean;
}

export interface ScheduledBasketCreateUpdatePayload {
  category_ids: number[];
  category_id?: number;
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  discount?: number;
  discount_type: 'fixed' | 'percentage';
  delivery_price?: number;
  image?: File | string | null;
  images?: File[];
  items: Array<{
    shop_product_variant_id: number;
    shop_product_variant_ids?: number[];
    quantity: number;
    is_required?: boolean;
    is_extra?: boolean;
    min_quantity?: number;
    max_quantity?: number;
  }>;
  schedules: ScheduledBasketSchedulePayload[];
  is_active: boolean;
  badges?: number[];
}

export function badgesFormValueFromScheduledBasketResponse(
  source: ScheduledBasketData
): number[] {
  return (source.badges ?? []).map((b) => b.id);
}
