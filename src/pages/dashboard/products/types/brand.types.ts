// ----------------------------------------------------------------------

export interface BrandData {
  id: number;
  name: string;
  image: string;
  created_at: string;
  updated_at: string;
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
}
