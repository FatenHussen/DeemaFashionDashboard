// ----------------------------------------------------------------------

export interface UserAffiliate {
  is_affiliate: boolean;
  affiliate_approved: boolean;
  affiliate_id: number | string | null;
  affiliate_rate?: number | string | null;
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
  affiliate_id?: number;
  affiliate_rate?: number;
}

export interface UserUpdatePayload {
  name: string;
  last_name?: string;
  email: string;
  phone: string;
  password?: string;
  password_confirmation?: string;
  area_id: number;
}

export interface UserConvertAffiliatePayload {
  affiliate_id: number;
  affiliate_rate: number;
}
