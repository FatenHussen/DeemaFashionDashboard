// ----------------------------------------------------------------------

export interface SubscriptionData {
  id: number;
  user_id: number;
  package_id: number;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
  user?: { id: number; name: string; email?: string };
  package?: { id: number; name: string | { ar?: string; en?: string } };
  created_at: string;
  updated_at: string;
}

export interface SubscriptionListResponse {
  status: boolean;
  message: string;
  data: {
    items: SubscriptionData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface SubscriptionDetailsResponse {
  status: boolean;
  message: string;
  data: SubscriptionData;
}

export interface SubscriptionCreateUpdatePayload {
  user_id: number;
  package_id: number;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
}
