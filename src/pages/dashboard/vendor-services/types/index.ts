export interface VendorServiceData {
  id: number;
  vendor_service_type_id: number;
  vendor_service_type?: { id: number; name: string | { ar?: string; en?: string } };
  name: { ar?: string; en?: string } | string;
  description?: { ar?: string; en?: string } | string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VendorServiceListResponse {
  status: boolean;
  message: string;
  data: {
    items: VendorServiceData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface VendorServicePayload {
  vendor_service_type_id: number;
  name: { ar: string; en: string };
  description?: { ar?: string; en?: string };
  is_active: boolean;
}
