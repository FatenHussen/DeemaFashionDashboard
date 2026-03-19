// ----------------------------------------------------------------------

export interface ScheduledBasketItem {
  shop_product_variant_id: number;
  quantity: number;
  product?: {
    id: number;
    name: string | { ar?: string; en?: string };
    price?: number;
  };
}

export interface ScheduledBasketData {
  id: number;
  name: string | { ar?: string; en?: string };
  category?: { id: number; name: string | { ar?: string; en?: string } };
  image?: string;
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
  offer_ends_at?: string;
  items?: ScheduledBasketItem[];
  scheduled_at?: string;
  scheduled_end_at?: string;
  is_recurring?: boolean;
  recurrence_type?: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledBasketListResponse {
  status: boolean;
  message: string;
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
  status: boolean;
  message: string;
  data: ScheduledBasketData;
}

export interface ScheduledBasketCreateUpdatePayload {
  category_id: number;
  name: { ar: string; en: string };
  offer_ends_at?: string;
  discount?: number;
  discount_type: 'fixed' | 'percentage';
  delivery_price?: number;
  image?: File | string | null;
  items: Array<{ shop_product_variant_id: number; quantity: number }>;
  scheduled_at?: string;
  scheduled_end_at?: string;
  is_recurring?: boolean;
  recurrence_type?: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
}
