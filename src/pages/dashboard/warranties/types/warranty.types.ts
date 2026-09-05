export interface WarrantyData {
  id: number;
  name: { en: string; ar: string };
  name_translations?: { en?: string; ar?: string };
  description?: { en: string; ar: string } | string | null;
  description_translations?: { en?: string; ar?: string };
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface WarrantyListResponse {
  status: boolean;
  message: string;
  data: {
    items: WarrantyData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface WarrantyDetailsResponse {
  status: boolean;
  message: string;
  data: WarrantyData;
}

export interface WarrantyCreateUpdatePayload {
  name: { en: string; ar: string };
  description?: { en: string; ar: string };
  is_active: boolean;
}
