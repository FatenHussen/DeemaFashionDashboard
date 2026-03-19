// ----------------------------------------------------------------------

export interface UserBasketScheduleItem {
  id: number;
  user: {
    id: number;
    name: string;
    email?: string;
  };
  basket: {
    id: number;
    name: { en: string; ar: string } | string;
  };
  schedule: {
    id: number;
    name: { en: string; ar: string } | string;
  };
  is_active: number;
  created_at: string;
}

export interface UserBasketScheduleListResponse {
  status: boolean;
  message: string;
  data: {
    items: UserBasketScheduleItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface UserBasketScheduleDetailsResponse {
  status: boolean;
  message: string;
  data: UserBasketScheduleItem;
}

export interface UserBasketScheduleCreatePayload {
  user_id: number;
  basket_id: number;
  schedule_id: number;
  is_active: boolean;
}
