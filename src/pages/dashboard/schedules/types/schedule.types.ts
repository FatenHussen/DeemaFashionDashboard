// ----------------------------------------------------------------------
// Admin schedule categories (user cards): GET/POST/PUT/DELETE `/api/admin/schedules`.

/** Query params for GET list (`is_active=1`, `discount_type=percentage|fixed`). */
export type ScheduleListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  discount_type?: 'percentage' | 'fixed' | string;
  sort_field?: 'id' | 'name' | 'interval_days' | 'discount_value' | 'created_at' | string;
  sort_order?: 'asc' | 'desc';
};

export type ScheduleDiscountType = 'percentage' | 'fixed';

export type ScheduleBadgePosition = 'top' | 'bottom';

export interface ScheduleBadge {
  id: number;
  name?: string | { en?: string; ar?: string };
  image?: string | null;
  position?: ScheduleBadgePosition | string;
}

/** Gallery item from details — URLs and/or Spatie-style `{ id, url }`. */
export type ScheduleImageRef = string | { id?: number; url?: string; original_url?: string; full_url?: string };

export interface ScheduleBadgeInput {
  id: number;
  position: ScheduleBadgePosition;
}

export interface ScheduleItem {
  id: number;
  /** List may return a string (request locale); show/detail return `{ en, ar }`. */
  name: { en: string; ar: string } | string;
  description?: { en?: string; ar?: string } | string | null;
  image?: ScheduleImageRef | null;
  images?: ScheduleImageRef[] | null;
  media?: Array<{ id?: number; url?: string; original_url?: string }> | null;
  interval_days: number;
  is_active: boolean;
  discount_type: ScheduleDiscountType | null;
  discount_value: number | null;
  top_badges?: ScheduleBadge[];
  bottom_badges?: ScheduleBadge[];
  badges?: ScheduleBadge[];
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleListResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data: {
    items: ScheduleItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ScheduleDetailsResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data: ScheduleItem;
}

export interface ScheduleCreatePayload {
  name: { en: string; ar: string };
  description?: { en: string; ar: string };
  interval_days: number;
  is_active?: boolean;
  discount_type: ScheduleDiscountType | null;
  discount_value: number | null;
  image?: File | null;
  images?: File[];
  deleted_image_ids?: number[];
  badges?: ScheduleBadgeInput[];
}

export type ScheduleUpdatePayload = ScheduleCreatePayload;
