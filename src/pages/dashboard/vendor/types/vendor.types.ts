// ----------------------------------------------------------------------

export interface VendorBadge {
  id: number;
  name: string;
  color: string;
  postion: string;
}

export interface VendorData {
  id: number;
  name: string | { ar: string; en: string };
  owner_name: string;
  owner_phone?: string;
  commercial_register?: string;
  /** Some API responses use this key instead of `commercial_register`. */
  commercial_register_number?: string;
  contract_date?: string;
  contract_number?: string;
  contract_duration_months?: number;
  commission_rate?: number;
  commission_type?: 'percentage' | 'fixed';
  fixed_commission?: number | null;
  settlement_cycle?: 'weekly' | 'monthly';
  logo_url?: string | null;
  is_active: boolean;
  average_rating?: number;
  ratings_count?: number;
  created_at?: string;
  is_favorite?: boolean;
  top_badges?: VendorBadge[];
  bottom_badges?: VendorBadge[];
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
  commission_type: 'percentage' | 'fixed';
  settlement_cycle: 'weekly' | 'monthly';
  commission_rate?: number;
  fixed_commission?: number;
  is_active: boolean;
}

