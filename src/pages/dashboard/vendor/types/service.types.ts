// ----------------------------------------------------------------------

export interface ServiceData {
  id: number;
  name: string;
  created_at: string;
}

export interface ServiceListResponse {
  status: boolean;
  message: string;
  data: {
    items: ServiceData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ServiceDetailData {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  created_at: string;
}

export interface ServiceDetailResponse {
  status: boolean;
  message: string;
  data: ServiceDetailData;
}

export interface ServiceCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
}
