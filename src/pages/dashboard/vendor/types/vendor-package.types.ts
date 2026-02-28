// ── Vendor Package types ──────────────────────────────────────────────

// ── List item  GET /admin/vendor-packages ────────────────────────────

export interface VendorPackageItem {
  id: number;
  name: string | { ar?: string; en?: string };
  price: number;
  duration_days: number;
  max_products: number;
  commission_rate: number;
  is_active: boolean;
  active_subscriptions_count: number;
  created_at: string;
}

// ── Details  GET /admin/vendor-packages/:id ──────────────────────────

export interface VendorPackageDetails {
  id: number;
  name: string | { ar?: string; en?: string };
  description?: string | { ar?: string; en?: string };
  price: number;
  duration_days: number;
  is_active: boolean;
  max_products: number;
  is_featured: boolean;
  has_premium_badge: boolean;
  search_priority: number;
  max_campaigns: number;
  has_banner_ad: boolean;
  has_sales_reports: boolean;
  has_analytics: boolean;
  report_level: string;
  order_priority: number;
  can_set_prep_time: boolean;
  custom_shipping_options: boolean;
  has_vendor_delivery: boolean;
  commission_rate: number;
  commission_per_order: number;
  activation_fee_waived: boolean;
  subscriptions_count?: number;
  active_subscriptions_count: number;
  created_at: string;
  updated_at: string;
}

// ── List response ─────────────────────────────────────────────────────

export interface VendorPackageListResponse {
  status: boolean;
  message: string;
  data: {
    items: VendorPackageItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

// ── Details response ─────────────────────────────────────────────────

export interface VendorPackageDetailsResponse {
  status: boolean;
  message: string;
  data: VendorPackageDetails;
}

// ── Create / Update payload ─────────────────────────────────────────

export interface VendorPackageCreateUpdatePayload {
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  price: number;
  duration_days: number;
  max_products: number;
  commission_rate: number;
  commission_per_order: number;
  is_active: boolean;
  is_featured: boolean;
  has_premium_badge: boolean;
  sort_order: number;
  search_priority: number;
  max_campaigns: number;
  has_banner_ad: boolean;
  has_sales_reports: boolean;
  has_analytics: boolean;
  report_level: string;
  order_priority: number;
  can_set_prep_time: boolean;
  custom_shipping_options: boolean;
  has_vendor_delivery: boolean;
  activation_fee_waived: boolean;
}
