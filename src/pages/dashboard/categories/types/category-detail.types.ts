// ----------------------------------------------------------------------

export interface CategoryDetailData {
  id: number;
  name: string;
  category: string;
}

export interface CategoryDetailListResponse {
  status: boolean;
  message: string;
  data: {
    items: CategoryDetailData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CategoryDetailDetailData {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  category: {
    id: number;
    name: {
      ar: string;
      en: string;
    };
  };
  created_at: string;
}

export interface CategoryDetailDetailResponse {
  status: boolean;
  message: string;
  data: CategoryDetailDetailData;
}

export interface CategoryDetailCreateUpdatePayload {
  category_id: number;
  name: {
    en: string;
    ar: string;
  };
}
