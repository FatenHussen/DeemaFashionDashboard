// ----------------------------------------------------------------------

export interface UserBasketScheduleItem {
  id: number;
  user: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  /** Basket / subscription name (flat on list payload; not nested under `basket`). */
  name: string;
  image: string | null;
  num_varieties: number;
  original_price: number;
  discount_value: string;
  discount_type: string;
  discount_amount: number;
  final_price: number;
  schedule: {
    id: number;
    name: string;
    interval_days: number;
  };
  is_active: boolean;
  start_date: string;
  next_run_date: string;
  created_at: string;
  updated_at: string;
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
