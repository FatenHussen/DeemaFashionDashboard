// ----------------------------------------------------------------------

export interface GovernorateData {
  id: number;
  name: string;
  created_at: string;
}

export interface GovernorateListResponse {
  status: boolean;
  message: string;
  data: {
    items: GovernorateData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface GovernorateCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
}
