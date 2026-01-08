// ----------------------------------------------------------------------

export interface GovernorateInfo {
  id: number;
  name: string;
  created_at: string;
}

export interface CityData {
  id: number;
  name: string;
  governorate: GovernorateInfo;
  created_at: string;
}

export interface CityListResponse {
  status: boolean;
  message: string;
  data: {
    items: CityData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CityCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
  governorate_id: number;
}
