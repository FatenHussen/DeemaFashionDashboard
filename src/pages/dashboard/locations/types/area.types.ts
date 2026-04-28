// ----------------------------------------------------------------------

export interface GovernorateInfo {
  id: number;
  name: string;
  created_at: string;
}

export interface CityInfo {
  id: number;
  name: string;
  governorate: GovernorateInfo;
  created_at: string;
}

export interface AreaData {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  city: CityInfo;
  lat?: string;
  lng?: string;
  base_fee?: number | string;
  created_at: string;
}

export interface AreaDetailsResponse {
  status: boolean;
  message: string;
  data: AreaData;
}

export interface AreaListResponse {
  status: boolean;
  message: string;
  data: {
    items: AreaData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface AreaCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
  city_id: number;
  lat: number | string;
  lng: number | string;
  base_fee: string;
}

