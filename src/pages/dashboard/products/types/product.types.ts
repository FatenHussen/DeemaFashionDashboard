// ----------------------------------------------------------------------

export interface ProductData {
  id: number;
  category_id: string; // API returns category name as string
  name: string;
  description: string;
  full_description: string | null;
  country: string | null;
  sku: string | null;
  model: string | null;
  price: number;
  price_after_discount: number | null;
  quantity: number | null;
  barcode: string | null;
  time_prepare: string | null;
  bought_with: string[] | null;
  is_instant_delivery: number;
  image: string | null;
  images: string[];
  created_at: string;
}

export interface ProductListResponse {
  status: boolean;
  message: string;
  data: {
    items: ProductData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ProductDetailResponse {
  status: boolean;
  message: string;
  data: ProductData;
}

export interface ProductCreateUpdatePayload {
  category_id: number;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  full_description?: { en: string; ar: string };
  country?: { en: string; ar: string };
  price: number;
  quantity: number;
  sku?: string;
  model?: string;
  barcode?: string;
  time_prepare?: string;
  is_instant_delivery: number;
  images?: File[];

  // Variants
  variants?: Array<{
    attributes_values_ids: number[];
    price: number;
  }>;

  // Category Details
  category_details?: Array<{
    category_detail_id: number;
    detail_value: { en: string; ar: string };
  }>;

  // Extra Details
  extra_details?: Array<{
    detail_key: { en: string; ar: string };
    detail_value: { en: string; ar: string };
  }>;

  // Bought With (related products)
  bought_with?: number[];

  // Shop Variants (multi-vendor)
  shop_variants?: Array<{
    shop_id: number;
    variant_index: number;
    price: number;
    quantity: number;
  }>;
}
