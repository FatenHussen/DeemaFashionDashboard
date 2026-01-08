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
  data: BrandData[];
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
