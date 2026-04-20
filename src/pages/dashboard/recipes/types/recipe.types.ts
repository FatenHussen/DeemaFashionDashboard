// ----------------------------------------------------------------------

/** @deprecated Position is now on the badge itself, not the pivot. Kept for API response compat. */
export type RecipeBadgeRef = { id: number; position?: string };

// ── Payload types (sent to API) ──────────────────────────────────────

export interface RecipeItem {
  shop_product_variant_id: number;
  switchable_category_id?: number;
  quantity: number;
  is_required: boolean;
  min_quantity: number;
  max_quantity: number;
}

export type LocalizedField = { ar?: string; en?: string } | string;

export interface RecipeStep {
  step_number: number;
  heat_level: LocalizedField;
  time_minutes: LocalizedField;
  instruction: LocalizedField;
}

// ── API response types (returned from API) ──────────────────────────

export interface RecipeItemTerms {
  is_required: boolean;
  switchable_category_id?: number;
  default_quantity: number;
  min_quantity: number;
  max_quantity: number;
}

export interface RecipeItemMainItem {
  product_id: number;
  shop_product_variant_id: number;
  image_url?: string | null;
  name: string;
  variant: string[];
  price: number;
  currency?: string;
  currency_symbol?: string;
  price_formatted?: string;
}

export interface RecipeItemAlternative {
  product_id: number;
  shop_product_variant_id: number;
  name: string;
  image_url?: string | null;
  price: number;
  currency?: string;
  currency_symbol?: string;
  price_formatted?: string;
  variant: string[];
}

export interface RecipeItemData {
  terms: RecipeItemTerms;
  main_item: RecipeItemMainItem;
  alternatives: RecipeItemAlternative[];
  other_shops: any[];
}

export interface RecipeTotals {
  total_before_discount: number;
  total_after_discount: number;
  discount_value: number;
}

export interface RecipeImage {
  id: number;
  url: string;
}

export interface RecipeData {
  id: number;
  name: { ar?: string; en?: string } | string;
  description?: { ar?: string; en?: string } | string;
  image?: string;
  images?: RecipeImage[];
  video_url?: string;
  video_title?: { ar?: string; en?: string } | string;
  video_desc?: { ar?: string; en?: string } | string;
  discount?: number | string;
  rating?: number;
  price?: number;
  currency?: string;
  currency_symbol?: string;
  price_formatted?: string;
  price_after_discount?: number;
  price_after_discount_formatted?: string;
  orders_count?: number;
  delivery_price?: number;
  serves?: number | string | null;
  prepare_time?: string | null;
  totals?: RecipeTotals;
  is_active?: boolean;
  items?: RecipeItemData[];
  steps?: RecipeStep[];
  badges?: RecipeBadgeRef[];
  created_at: string;
  updated_at?: string;
}

export interface RecipeListResponse {
  status: boolean;
  message: string;
  data: {
    items: RecipeData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface RecipeDetailsResponse {
  status: boolean;
  message: string;
  data: RecipeData;
}

export interface RecipeCreateUpdatePayload {
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  image?: File | null;
  images?: File[];
  existing_images_ids?: number[];
  video_url?: string;
  video_title?: { ar: string; en: string };
  video_desc?: { ar: string; en: string };
  discount?: number;
  delivery_price?: number;
  serves?: string;
  prepare_time?: string;
  items?: RecipeItem[];
  steps?: RecipeStep[];
  badges?: number[];
}
