// ----------------------------------------------------------------------

export interface ScheduleItem {
  id: number;
  name: { en: string; ar: string };
  day: string;
  start_time: string;
  end_time: string;
  is_active: number;
  created_at: string;
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
  day: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}
