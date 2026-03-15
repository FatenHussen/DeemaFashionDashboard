// ----------------------------------------------------------------------

export interface BasketItem {
  id?: number;
  product_id?: number;
  variant_id?: number;
  shop_product_variant_id: number;
  quantity: number;
  unit_price?: number;
  subtotal?: number;
  product?: {
    id: number;
    name: string | { ar?: string; en?: string };
    image?: string;
    price?: number;
  };
  variant?: (string | number)[];
  shop_variant?: {
    id: number;
    shop_id: number;
    shop_name: string;
    price: number;
    quantity: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface BasketData {
  id: number;
  name: { ar?: string; en?: string } | string;
  category?: { id: number; name: string | { ar?: string; en?: string } };
  discount?: number | string;
  discount_value?: string | number;
  discount_type?: 'fixed' | 'percentage';
  discount_amount?: number;
  offer_ends_at?: string;
  delivery_price?: number;
  image?: string;
  items?: BasketItem[];
  items_count?: number;
  num_varieties?: number;
  final_price?: number;
  original_price?: number;
  num_sold?: number;
  rating?: number;
  average_rating?: number;
  is_on_offer?: boolean;
  is_schedule?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BasketListResponse {
  status: boolean;
  message: string;
  data: {
    items: BasketData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface BasketDetailsResponse {
  status: boolean;
  message: string;
  data: BasketData;
}

export interface BasketCreateUpdatePayload {
  category_id: number;
  name: { ar: string; en: string };
  offer_ends_at?: string;
  discount?: number;
  discount_type: 'fixed' | 'percentage';
  delivery_price?: number;
  image?: File | string | null;
  items: Array<{ shop_product_variant_id: number; quantity: number }>;
}
