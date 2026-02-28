// ----------------------------------------------------------------------

export interface VendorData {
  id: number;
  name: string | { ar: string; en: string };
  owner_name: string;
  owner_phone?: string;
  commercial_register?: string;
  contract_date?: string;
  contract_number?: string;
  contract_duration_months?: number;
  commission_rate?: number;
  logo_url?: string | null;
  is_active: boolean;
  average_rating?: number;
  ratings_count?: number;
  created_at?: string;
}

export interface VendorListResponse {
  status: boolean;
  message: string;
  data: {
    items: VendorData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface VendorCreateUpdatePayload {
  name: {
    ar: string;
    en: string;
  };
  owner_name: string;
  owner_phone: string;
  commercial_register: string;
  contract_date: string;
  contract_number: string;
  contract_duration_months: number;
  commission_rate: number;
  is_active: boolean;
}

