// ----------------------------------------------------------------------

export interface CategoryAttributeValue {
  id?: number;
  name: {
    ar: string;
    en: string;
  };
}

export interface CategoryAttributeData {
  id: number;
  name: string;
  category: string;
  type: string;
}

export interface CategoryAttributeListResponse {
  status: boolean;
  message: string;
  data: {
    items: CategoryAttributeData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CategoryAttributeDetailData {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  category: string;
  type: string;
  values: CategoryAttributeValue[];
}

export interface CategoryAttributeDetailResponse {
  status: boolean;
  message: string;
  data: CategoryAttributeDetailData;
}

export interface CategoryAttributeCreateUpdatePayload {
  category_id: number;
  name: {
    en: string;
    ar: string;
  };
  type: string;
  values?: Array<{
    name: {
      en: string;
      ar: string;
    };
  }>;
}

