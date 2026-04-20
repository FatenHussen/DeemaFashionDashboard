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
  /** Variant-specific image from API (e.g. shop product variant list / basket details) */
  variant_image?: string | null;
  variant?: (string | number)[];
  shop_variant?: {
    id: number;
    shop_id: number;
    shop_name: string;
    price: number;
    discount?: number | null;
    price_after_discount?: number | null;
    cost_price?: number | null;
    quantity: number;
  };
  /** Product variant identifiers when API embeds them */
  product_variant?: {
    sku?: string | null;
    model?: string | null;
    barcode?: string | null;
  };
  created_at?: string;
  updated_at?: string;
}

export interface BasketData {
  id: number;
  name: { ar?: string; en?: string } | string;
  description?: { ar?: string; en?: string } | string;
  /** Many-to-many category IDs (admin / detail APIs) */
  category_ids?: number[];
  /** Resolved category rows for admin UI */
  categories?: Array<{ id: number; name: string | { ar?: string; en?: string } }>;
  /** Legacy single category; user APIs may return a single concatenated string in `category` instead */
  category?: { id: number; name: string | { ar?: string; en?: string } } | string;
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
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  badges?: Array<{ id: number; position?: string; postion?: string }>;
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
  /** Primary input for multi-category baskets */
  category_ids: number[];
  /** Optional legacy compatibility; backend may derive from category_ids */
  category_id?: number;
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  offer_ends_at?: string;
  discount?: number;
  discount_type: 'fixed' | 'percentage';
  delivery_price?: number;
  image?: File | string | null;
  items: Array<{ shop_product_variant_id: number; quantity: number }>;
  badges?: number[];
}
