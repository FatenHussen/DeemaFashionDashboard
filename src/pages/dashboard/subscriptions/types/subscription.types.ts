// ----------------------------------------------------------------------
// User subscriptions — admin read-only API (list + show).

/** GET /api/admin/subscriptions query params */
export type SubscriptionListParams = {
  page?: number;
  per_page?: number;
  user_id?: number;
  package_id?: number;
  status?: 'active' | 'expired' | 'cancelled' | string;
  start_date_from?: string;
  start_date_to?: string;
  search?: string;
  sortField?: 'id' | 'start_date' | 'end_date' | 'created_at' | 'status' | string;
  sortOrder?: 'asc' | 'desc';
};

export interface SubscriptionUserNested {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface SubscriptionPackageList {
  id: number;
  name: string | { ar?: string; en?: string };
  price?: number;
}

/** Package fields on single-subscription response */
export interface SubscriptionPackageDetail extends SubscriptionPackageList {
  duration_days?: number;
  monthly_orders_limit?: number | null;
  free_delivery_count?: number | null;
  discount_percentage?: number | null;
  points_bonus?: number | null;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface SubscriptionListItem {
  id: number;
  user_id?: number;
  package_id?: number;
  user: SubscriptionUserNested;
  package: SubscriptionPackageList;
  status: SubscriptionStatus | string;
  start_date: string;
  /** May be null when open-ended (see `days_remaining` on detail). */
  end_date: string | null;
  remaining_orders: number | null;
  remaining_free_deliveries: number | null;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionDetail extends SubscriptionListItem {
  package: SubscriptionPackageDetail;
  user: SubscriptionUserNested;
  days_remaining: number | null;
  updated_at?: string;
}

export interface SubscriptionListResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data: {
    items: SubscriptionListItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface SubscriptionDetailsResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data: SubscriptionDetail;
}
