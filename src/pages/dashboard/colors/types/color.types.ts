export interface ColorListItem {
  id: number;
  name: string;
  hex: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ColorListResponse {
  status: boolean;
  message: string;
  data: {
    items: ColorListItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ColorDetails {
  id: number;
  name: { en: string; ar: string };
  hex: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ColorDetailsResponse {
  status: boolean;
  message: string;
  data: ColorDetails;
}

export interface ColorCreatePayload {
  name: { en: string; ar: string };
  hex: string;
  is_active?: boolean;
}

export type ColorListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  sort_field?: 'id' | 'hex' | 'is_active' | 'created_at';
  sort_order?: 'asc' | 'desc';
  hex?: string;
  is_active?: boolean;
};
