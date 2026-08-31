// ----------------------------------------------------------------------

export type AffiliateCommissionType =
  | 'percentage_order'
  | 'fixed_per_order'
  | 'percentage_selected_products';

export interface UserAffiliate {
  is_affiliate: boolean;
  affiliate_approved: boolean;
  affiliate_id: number | string | null;
  affiliate_rate?: number | string | null;
  affiliate_commission_type?: AffiliateCommissionType | string | null;
  affiliate_fixed_commission?: number | string | null;
  affiliate_product_ids?: number[] | null;
  affiliate_visit_commission_enabled?: boolean;
  affiliate_visit_commission_threshold?: number | string | null;
  affiliate_visit_commission_amount?: number | string | null;
  coupon_code?: string | null;
}

export interface MarkterStatistics {
  total_orders?: number;
  delivered_orders?: number;
  total_sales?: number;
  earned_commission?: number;
  pending_earnings?: number;
  withdrawn?: number;
  available_balance?: number;
}

export interface UserAddressArea {
  id: number;
  name: string | { ar?: string; en?: string };
  city?: {
    id: number;
    name: string | { ar?: string; en?: string };
    governorate?: {
      id: number;
      name: string | { ar?: string; en?: string };
    };
  };
  base_fee?: number;
  lat?: string;
  lng?: string;
}

export interface UserAddress {
  id: number;
  label?: string;
  street_name?: string;
  nearest_landmark?: string;
  building_number?: string;
  floor_apartment?: string;
  contact_phone?: string;
  lat?: number;
  lng?: number;
  is_default?: boolean;
  area?: UserAddressArea;
  created_at?: string;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  area?: string | null;
  is_active?: boolean;
  affiliate?: UserAffiliate;
  created_at?: string;
}

export interface UserListResponse {
  status: boolean;
  message: string;
  data: {
    items: UserItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface UserDetailsData extends UserItem {
  area_id?: number;
  affiliate?: UserAffiliate;
  markter_statistics?: MarkterStatistics;
  addresses?: UserAddress[];
}

export interface UserDetailsResponse {
  status: boolean;
  message: string;
  data: UserDetailsData;
}

export interface UserCreatePayload {
  name: string;
  last_name?: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  area_id: number;
  is_affiliate?: boolean;
  affiliate_id?: number | string;
  affiliate_commission_type?: AffiliateCommissionType;
  affiliate_rate?: number;
  affiliate_fixed_commission?: number;
  affiliate_product_ids?: number[];
  affiliate_visit_commission_enabled?: boolean;
  affiliate_visit_commission_threshold?: number;
  affiliate_visit_commission_amount?: number;
}

export interface UserUpdatePayload {
  name: string;
  last_name?: string;
  /** Omit when unchanged so unique email rules don't block password-only updates. */
  email?: string;
  phone: string;
  password?: string;
  password_confirmation?: string;
  area_id: number;
  is_affiliate?: boolean;
  affiliate_id?: number | string;
  affiliate_commission_type?: AffiliateCommissionType;
  affiliate_rate?: number;
  affiliate_fixed_commission?: number;
  affiliate_product_ids?: number[];
  affiliate_visit_commission_enabled?: boolean;
  affiliate_visit_commission_threshold?: number;
  affiliate_visit_commission_amount?: number;
}

/** Body for `POST .../reactivate-affiliate` (commission fields; `affiliate_id` optional). */
export interface UserReactivateAffiliatePayload {
  affiliate_id?: number | string;
  affiliate_commission_type: AffiliateCommissionType;
  affiliate_rate?: number;
  affiliate_fixed_commission?: number;
  affiliate_product_ids?: number[];
  affiliate_visit_commission_enabled?: boolean;
  affiliate_visit_commission_threshold?: number;
  affiliate_visit_commission_amount?: number;
}
