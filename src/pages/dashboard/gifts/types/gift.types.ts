// ----------------------------------------------------------------------
// API Changes (27 Feb 2026): shop_product_variant_id, exchanges_count, meta support
// ----------------------------------------------------------------------

export interface GiftTranslation {
  ar?: string;
  en?: string;
}

export interface GiftData {
  id: number;
  name: GiftTranslation | string;
  description?: GiftTranslation | string;
  image?: string;
  points_required: number;
  stock_quantity: number;
  is_active: boolean;
  category_id?: number;
  category?: { id: number; name: string | GiftTranslation };
  terms_conditions?: GiftTranslation | string;
  shop_product_variant_id?: number | null;
  exchanges_count?: number;
  created_at: string;
  updated_at: string;
}

/** Supports both data.items + pagination (legacy) and data[] + meta (new backend) */
export interface GiftListResponse {
  status: boolean;
  message?: string;
  data:
    | {
        items: GiftData[];
        pagination: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }
    | GiftData[];
  meta?: {
    current_page: number;
    total: number;
    per_page: number;
  };
}

export interface GiftDetailsResponse {
  status: boolean;
  message: string;
  data: GiftData;
}

export interface GiftCreateUpdatePayload {
  name: { ar: string; en?: string };
  description?: { ar?: string; en?: string };
  image?: File | string | null;
  points_required: number;
  stock_quantity?: number;
  is_active?: boolean;
  category_id?: number;
  shop_product_variant_id?: number | null;
  terms_conditions?: { ar?: string; en?: string };
}

export interface BulkGiftCreatePayload {
  shop_product_variant_ids: number[];
  points_required: number;
  stock_quantity?: number;
  is_active?: boolean;
  terms_conditions?: { ar?: string; en?: string };
}
