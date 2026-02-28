// ----------------------------------------------------------------------

export interface DriverArea {
  id: number;
  name: string;
  city?: {
    id: number;
    name: string;
    governorate: {
      id: number;
      name: string;
      created_at: string;
    };
    created_at: string;
  };
  created_at?: string;
}

export interface DriverData {
  id: number;
  name?: string;
  phone: string;
  address: string;
  status: string;
  is_active: number | boolean;
  image?: string | null;
  rate_per_order: number | string;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
  average_rating?: number;
  total_orders?: number;
  completed_orders?: number;
  total_earnings?: number;
  created_at: string;
}

export interface DriverDetailsData extends DriverData {
  areas: DriverArea[];
}

export interface DriverListResponse {
  status: boolean;
  message: string;
  data: {
    items: DriverData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface DriverDetailsResponse {
  status: boolean;
  message: string;
  data: DriverDetailsData;
}

export interface DriverCreateUpdatePayload {
  name: string;
  phone: string;
  password?: string;
  address: string;
  area_ids: Array<{ id: number }>;
  rate_per_order?: number | string;
  vehicle_type?: string;
  vehicle_number?: string;
  /** File for new upload, or string URL when keeping existing image on update */
  image?: File | string | null;
}

