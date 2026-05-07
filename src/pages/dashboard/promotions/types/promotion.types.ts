export type PromotionType = 'simple_discount' | 'spend_x_discount' | 'buy_x_get_y';
export type DiscountType = 'percentage' | 'fixed';

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
  /** CMS page slugs where this promotion is shown */
  page_slugs?: string[] | null;
  /** Display order among promotions on a page */
  position?: number | null;
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
  page_slugs?: string[];
  position?: number;
}

export interface PromotionUpdatePayload extends PromotionCreatePayload {
  gift_product_ids?: number[];
}
