export type FlashSaleDiscountType = 'percent' | 'fixed';

export interface FlashSaleListItem {
  id: number;
  name: string;
  end_date: string;
  is_active: boolean;
  discount: number;
  discount_type: FlashSaleDiscountType;
}

export interface FlashSaleListData {
  items: FlashSaleListItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface FlashSaleListResponse {
  status: boolean;
  message?: string;
  data: FlashSaleListData;
}

/** `store` / `update` return the raw model after `fresh()`. */
export interface FlashSaleModel {
  id: number;
  name: string;
  end_date: string;
  is_active: boolean;
  discount: number;
  discount_type: FlashSaleDiscountType;
  /** Product IDs from `products` or `product_ids` on show/update responses. */
  product_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface FlashSaleMutationResponse {
  status: boolean;
  message?: string;
  data: FlashSaleModel;
}
