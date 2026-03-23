// ----------------------------------------------------------------------

export interface ScheduleItem {
  id: number;
  name: { en: string; ar: string } | string;
  interval_days: number;
  is_active: boolean;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  created_at: string;
  updated_at?: string;
}

export interface ScheduleListResponse {
  status: boolean;
  message: string;
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
  status: boolean;
  message: string;
  data: ScheduleItem;
}

export interface ScheduleCreatePayload {
  name: { en: string; ar: string };
  interval_days: number;
  is_active: boolean;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
}
