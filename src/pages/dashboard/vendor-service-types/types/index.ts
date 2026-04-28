export interface VendorServiceTypeData {
  id: number;
  name: { ar?: string; en?: string } | string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VendorServiceTypeListResponse {
  status: boolean;
  message: string;
  data: {
    items: VendorServiceTypeData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface VendorServiceTypePayload {
  name: { ar: string; en: string };
  is_active: boolean;
}
