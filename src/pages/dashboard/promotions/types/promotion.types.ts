export type PromotionType =
  | 'simple_discount'
  | 'spend_x_discount'
  | 'spend_x_get_gift'
  | 'spend_x_get_points'
  | 'free_shipping'
  | 'spend_x_get_free_shipping';
export type DiscountType = 'percentage' | 'fixed';
export type PromotionPosition = 'top' | 'bottom';

export interface PromotionListItem {
  id: number;
  name: string;
  description: string;
  type: PromotionType;
  is_active: boolean;
  created_at: string;
}

export interface PromotionDetailItem {
  id: number;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  type: PromotionType;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  min_spend: number | null;
  buy_quantity: number | null;
  get_quantity: number | null;
  discount_value: number | null;
  discount_type: DiscountType | null;
  gift_product_ids: number[];
  product_ids?: number[];
  shop_ids?: number[];
  restaurant_ids?: number[];
  recipe_ids?: number[];
  shop_vendor_service_ids?: number[] | null;
  /** CMS page slugs where this promotion is shown */
  page_slugs?: string[] | null;
  /** Vertical placement on the page */
  position?: PromotionPosition | null;
}

export interface PromotionListResponse {
  status: boolean;
  message: string;
  data: {
    items: PromotionListItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface PromotionDetailsResponse {
  status: boolean;
  message: string;
  data: PromotionDetailItem;
}

export interface PromotionCreatePayload {
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  type: PromotionType;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
  min_spend?: number;
  buy_quantity?: number;
  get_quantity?: number;
  discount_value?: number;
  discount_type?: DiscountType;
  gift_product_ids?: number[];
  product_ids?: number[];
  shop_ids?: number[];
  restaurant_ids?: number[];
  recipe_ids?: number[];
  shop_vendor_service_ids?: number[] | null;
  page_slugs?: string[];
  position?: PromotionPosition;
}

export type PromotionUpdatePayload = PromotionCreatePayload;
