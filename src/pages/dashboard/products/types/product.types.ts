// ----------------------------------------------------------------------

/** Product item as returned in the LIST response (flat/translated names) */
export interface ProductData {
  id: number;
  category_id: string | number;
  brand_id: string | number | null;
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
  bought_with: number[] | null;
  is_instant_delivery: boolean | number;
  image: string | null;
  images: string[];
  created_at: string;
}

/** Product as returned in the SINGLE/DETAIL response (bilingual fields + relations) */
export interface ProductDetailData {
  id: number;
  category_id: number;
  brand_id: number | null;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  full_description: { en: string; ar: string } | null;
  country: { en: string; ar: string } | null;
  price: number;
  price_after_discount: number | null;
  quantity: number | null;
  sku: string | null;
  model: string | null;
  barcode: string | null;
  time_prepare: string | null;
  bought_with: number[];
  is_instant_delivery: boolean | number;
  category: { id: number; name: string };
  brand: { id: number; name: string } | null;
  variants: Array<{
    id: number;
    attributes: Array<{ attribute: string; value: string; type: string }>;
    shops: Array<{ shop_id: number; shop_name: string; price: number; quantity: number }>;
    images: Array<{ id: number; url: string }>;
  }>;
  category_details: Array<{
    id: number;
    name: string;
    value: { en: string; ar: string };
  }>;
  extra_details: Array<{
    id: number;
    key: { en: string; ar: string };
    value: { en: string; ar: string };
  }>;
  images: Array<{ id: number; url: string }>;
  badges?: Array<{ id: number; position?: string; postion?: string }>;
}

export interface ProductListResponse {
  status: boolean;
  message: string;
  data: {
    data: ProductData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ProductDetailResponse {
  status: boolean;
  message: string;
  data: ProductDetailData;
}

export interface ProductCreateUpdatePayload {
  category_id: number;
  brand_id?: number;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  full_description?: { en: string; ar: string };
  country?: { en: string; ar: string };
  price: number;
  price_after_discount?: number;
  quantity: number;
  sku?: string;
  model?: string;
  barcode?: string;
  time_prepare?: string;
  is_instant_delivery: number;
  /** New product gallery files (multipart `media[]`). */
  images?: File[];
  /** On update: media record IDs to keep (`existing_media_ids[]`). Omit on create. */
  existing_media_ids?: number[];

  // Variants
  variants?: Array<{
    id?: number;
    attributes_values_ids: number[];
    /** New variant image files (`variants[i][images][]`). */
    images?: File[];
    /** On update: variant image IDs to keep (`variants[i][existing_images_ids][]`). */
    existing_images_ids?: number[];
  }>;

  // Category Details
  category_details?: Array<{
    id?: number;
    category_detail_id: number;
    detail_value: { en: string; ar: string };
  }>;

  // Extra Details
  extra_details?: Array<{
    id?: number;
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

  badges?: Array<{ id: number; position: 'top' | 'bottom' }>;
}
