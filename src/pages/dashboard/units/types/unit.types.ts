// ----------------------------------------------------------------------

export interface UnitData {
  id: number;
  name: { en: string; ar: string };
  name_translations?: { en?: string; ar?: string };
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface UnitListResponse {
  status: boolean;
  message: string;
  data: {
    items: UnitData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface UnitDetailsResponse {
  status: boolean;
  message: string;
  data: UnitData;
}

export interface UnitCreateUpdatePayload {
  name: { en: string; ar: string };
  is_active: boolean;
}
