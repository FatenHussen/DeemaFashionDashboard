// ----------------------------------------------------------------------

export const VENDOR_SUBSCRIPTION_STATUSES = ['active', 'expired', 'cancelled', 'pending'] as const;
export type VendorSubscriptionStatus = (typeof VENDOR_SUBSCRIPTION_STATUSES)[number];

export interface VendorSubscriptionListItem {
  id: number;
  /** Admin list API (`/admin/vendor-subscriptions`) */
  vendor_id?: number;
  vendor_name?: string;
  /** Legacy/alternate API shape */
  shop_id?: number;
  shop_name?: string;
  package: {
    id: number;
    name: string | Record<string, string>;
  };
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  status: string;
  created_at: string;
}

export interface VendorSubscriptionDetails {
  id: number;
  vendor_id?: number;
  vendor_name?: string;
  vendor?: {
    id: number;
    name: string;
  };
  shop?: {
    id: number;
    name: string;
  };
  package: {
    id: number;
    name: string | Record<string, string>;
    max_products?: number;
    commission_rate?: string;
  };
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  status: string;
  notified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorSubscriptionListResponse {
  status: boolean;
  message: string;
  data: {
    items: VendorSubscriptionListItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface VendorSubscriptionDetailsResponse {
  status: boolean;
  message: string;
  data: VendorSubscriptionDetails;
}

export interface VendorSubscriptionFilters {
  status?: string;
  search?: string;
  vendor_id?: string | number;
  vendor_package_id?: string | number;
  expiring_soon?: boolean;
}

/** POST `/admin/vendor-subscriptions` — `vendor_package_id` must exist; `ends_at` ≥ `starts_at`. */
export interface VendorSubscriptionCreatePayload {
  vendor_id: number;
  vendor_package_id: number;
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  status: VendorSubscriptionStatus;
  notes?: string | null;
}
