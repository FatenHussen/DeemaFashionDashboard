// ----------------------------------------------------------------------

export interface UserAffiliate {
  is_affiliate: boolean;
  affiliate_approved: boolean;
  affiliate_id: number | null;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  affiliate: UserAffiliate;
  created_at: string;
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
}

export interface UserDetailsResponse {
  status: boolean;
  message: string;
  data: UserDetailsData;
}

export interface UserCreatePayload {
  name: string;
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
