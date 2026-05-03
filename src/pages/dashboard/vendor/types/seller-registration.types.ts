export type SellerRegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface SellerRegistrationGovernorate {
  id: number;
  name: string;
}

export interface SellerRegistrationCity {
  id: number;
  name: string;
}

export interface SellerRegistrationCountry {
  id: number;
  name: string;
  code?: string;
}

export interface SellerRegistrationItem {
  id: number;
  seller_name: string;
  email: string;
  phone?: string | null;
  store_name: string;
  country_id?: number;
  address?: string;
  commercial_register_number?: string;
  commercial_register_date?: string;
  country?: string | SellerRegistrationCountry;
  governorate?: SellerRegistrationGovernorate | string | null;
  city?: SellerRegistrationCity | string | null;
  /** May be omitted on list endpoints */
  logo?: string | null;
  status: SellerRegistrationStatus;
  /** Primary classification from registration API (`shop`, `restaurant`, etc.). */
  seller_type?: string | null;
  is_service_provider?: boolean | null;
  is_restaurant?: boolean | null;
  registered_at: string;
  created_at: string;
  /** May be omitted on list endpoints */
  updated_at?: string;
}

export interface SellerRegistrationListResponse {
  status?: boolean;
  success?: boolean;
  data: {
    items?: SellerRegistrationItem[];
    data?: SellerRegistrationItem[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
}

export interface SellerRegistrationApprovePayload {
  commission_rate?: number;
  contract_duration_months?: number;
}
