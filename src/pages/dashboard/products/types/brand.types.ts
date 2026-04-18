// ----------------------------------------------------------------------

export interface BrandData {
  id: number;
  name: string;
  image: string;
  created_at: string;
  updated_at: string;
  category_id?: number | null;
  governorate_id?: number | null;
  city_id?: number | null;
  category?: { id: number; name: string | { en: string; ar: string } } | null;
  governorate?: { id: number; name: string } | null;
  city?: { id: number; name: string | { en: string; ar: string } } | null;
}

export interface BrandListResponse {
  status: boolean;
  message: string;
  data: {
    items: BrandData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface BrandDetailsResponse {
  status: boolean;
  message: string;
  data: BrandData;
}

export interface BrandCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
  image?: File | string | null;
  /** Omit or `0` when not set */
  category_id?: number;
  governorate_id?: number;
  city_id?: number;
}
