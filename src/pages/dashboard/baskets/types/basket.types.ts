// ----------------------------------------------------------------------

export interface BasketItem {
  shop_product_variant_id: number;
  quantity: number;
  product?: {
    id: number;
    name: string | { ar?: string; en?: string };
    price?: number;
  };
}

export interface BasketData {
  id: number;
  name: { ar?: string; en?: string } | string;
  category?: { id: number; name: string | { ar?: string; en?: string } };
  discount: number;
  discount_type: 'fixed' | 'percentage';
  offer_ends_at?: string;
  delivery_price?: number;
  image?: string;
  items: BasketItem[];
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
