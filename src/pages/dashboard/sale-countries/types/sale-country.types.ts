export interface SaleCountryListItem {
  id: number;
  name: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SaleCountryListNormalizedResponse {
  success: boolean;
  data: {
    items: SaleCountryListItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface SaleCountryDetailsItem {
  id: number;
  name: string | { en: string; ar: string };
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SaleCountryDetailsResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data: SaleCountryDetailsItem;
}

export interface SaleCountryCreatePayload {
  name: { en: string; ar: string };
  is_active?: boolean;
}
