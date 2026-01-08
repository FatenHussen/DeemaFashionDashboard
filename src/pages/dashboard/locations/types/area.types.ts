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
  name: string;
  city: CityInfo;
  created_at: string;
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
}

