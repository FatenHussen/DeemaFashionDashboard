// ----------------------------------------------------------------------

export interface CountryItem {
  id: number;
  /** API may return a plain string or bilingual object */
  name: string | { en: string; ar: string };
  code: string;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CountryListResponse {
  status: boolean;
  message: string;
  data: {
    items: CountryItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CountryDetailsResponse {
  status: boolean;
  message: string;
  data: CountryItem;
}

export interface CountryCreatePayload {
  name: { en: string; ar: string };
  code: string;
  is_active: boolean;
}
