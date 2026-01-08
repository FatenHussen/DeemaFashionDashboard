// ----------------------------------------------------------------------

export interface Area {
  id: number;
  name: string;
  city: {
    id: number;
    name: string;
    governorate: {
      id: number;
      name: string;
      created_at: string;
    };
    created_at: string;
  };
  created_at: string;
}

export interface DriverData {
  id: number;
  phone: string;
  address: string;
  status: string;
  is_active: number;
  rate_per_order: string;
  created_at: string;
}

export interface DriverDetailsData extends DriverData {
  areas: Area[];
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
}

