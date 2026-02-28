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
  created_at: string;
  updated_at: string;
}

export interface GiftListResponse {
  status: boolean;
  message: string;
  data: {
    items: GiftData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
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
  terms_conditions?: { ar?: string; en?: string };
}
