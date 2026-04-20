// ----------------------------------------------------------------------

/** Bilingual preset for a category detail value (product form + admin). */
export interface CategoryDetailValueOption {
  ar: string;
  en: string;
}

export interface CategoryDetailData {
  id: number;
  name: string;
  category: string;
  value_options?: CategoryDetailValueOption[];
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
  value_options?: CategoryDetailValueOption[];
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
  /** Preset values (bilingual). Sent as array of `{ ar, en }` objects. */
  value_options?: CategoryDetailValueOption[];
}
