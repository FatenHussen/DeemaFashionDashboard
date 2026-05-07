// ----------------------------------------------------------------------

export interface UserBasketScheduleCurrencyAmount {
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
}

export interface UserBasketScheduleLineItem {
  id: number;
  quantity: number;
  original_price: number;
  currency: string;
  currency_symbol: string;
  original_price_formatted: string;
  original_price_currencies?: Record<string, UserBasketScheduleCurrencyAmount>;
  discount_amount: number;
  discount_amount_formatted?: string;
  discount_amount_currencies?: Record<string, UserBasketScheduleCurrencyAmount>;
  price_after_discount: number;
  price_after_discount_formatted?: string;
  price_after_discount_currencies?: Record<string, UserBasketScheduleCurrencyAmount>;
  shop_product_variant_id: number;
  availability_status: string;
  is_available: boolean;
  available_quantity: number | null;
  resolved_shop_product_variant_id: number | null;
  product: {
    id: number;
    name: string;
    image: string | null;
    brand: { id: number; name: string; image: string | null } | null;
    is_instant_delivery?: number;
  };
  variant: {
    name: string[];
    sku: string | null;
    model: string | null;
    barcode: string | null;
  };
}

export interface UserBasketScheduleItem {
  id: number;
  user: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    image?: string | null;
  };
  /** Basket / subscription name (flat on list payload; not nested under `basket`). */
  name: string;
  /** Short text summary for admin list (when API provides it). */
  items_preview?: string | string[] | null;
  image: string | null;
  num_varieties: number;
  original_price: number;
  discount_value: string;
  discount_type: string;
  discount_amount: number;
  final_price: number;
  schedule: {
    id: number;
    name: string;
    interval_days: number;
    discount_type?: string;
    discount_value?: number | string;
    is_active?: boolean;
  };
  is_active: boolean;
  start_date: string;
  next_run_date: string;
  created_at: string;
  updated_at: string;
  /** Populated on single-record (details) responses. */
  items?: UserBasketScheduleLineItem[];
}

export interface UserBasketScheduleListResponse {
  status: boolean;
  message: string;
  data: {
    items: UserBasketScheduleItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface UserBasketScheduleDetailsResponse {
  status: boolean;
  message: string;
  data: UserBasketScheduleItem;
}

export interface UserBasketScheduleCreatePayload {
  user_id: number;
  basket_id: number;
  schedule_id: number;
  is_active: boolean;
}
