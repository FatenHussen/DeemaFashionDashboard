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
  address: string;
  commercial_register_number: string;
  commercial_register_date: string;
  country: string;
  governorate: SellerRegistrationGovernorate | null;
  city: SellerRegistrationCity | null;
  logo: string | null;
  status: SellerRegistrationStatus;
  registered_at: string;
  created_at: string;
  updated_at: string;
}

export interface SellerRegistrationListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: SellerRegistrationItem[];
    per_page: number;
    total: number;
    last_page?: number;
  };
}

export interface SellerRegistrationApprovePayload {
  commission_rate?: number;
  contract_duration_months?: number;
}
