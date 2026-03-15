export type SellerRegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface SellerRegistrationGovernorate {
  id: number;
  name: string;
}

export interface SellerRegistrationCity {
  id: number;
  name: string;
}

export interface SellerRegistrationItem {
  id: number;
  seller_name: string;
  email: string;
  store_name: string;
  address?: string;
  commercial_register_number?: string;
  commercial_register_date?: string;
  country?: string;
  governorate?: SellerRegistrationGovernorate | string | null;
  city?: SellerRegistrationCity | string | null;
  logo: string | null;
  status: SellerRegistrationStatus;
  registered_at: string;
  created_at: string;
  updated_at: string;
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
