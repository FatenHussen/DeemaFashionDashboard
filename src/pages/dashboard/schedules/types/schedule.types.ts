// ----------------------------------------------------------------------
// Admin schedules API: GET/POST/PUT/PATCH/DELETE `/api/admin/schedules` (via `ROOTS.ADMIN`).

/** Query params for GET list */
export type ScheduleListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  discount_type?: 'percentage' | 'fixed' | string;
  sort_field?: 'id' | 'name' | 'interval_days' | 'discount_value' | 'created_at' | string;
  sort_order?: 'asc' | 'desc';
};

export interface ScheduleItem {
  id: number;
  /** List may return a string; show/detail return { en, ar } */
  name: { en: string; ar: string } | string;
  interval_days: number;
  is_active: boolean;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  created_at: string;
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
  interval_days: number;
  is_active?: boolean;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
}

export type ScheduleUpdatePayload = Partial<ScheduleCreatePayload>;
