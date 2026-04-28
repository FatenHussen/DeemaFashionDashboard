// ----------------------------------------------------------------------

export interface AdminCityRef {
  id: number;
  name?: string | { ar: string; en: string };
}

export interface AdminData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  is_active: number | boolean;
  /** API may return role names only, e.g. `["employee"]`, or full objects */
  roles: (string | { id: number; name: string })[];
  /** Present when API returns assigned cities as id list */
  city_ids?: number[];
  /** Present when API returns nested city objects */
  cities?: AdminCityRef[];
  created_at: string;
}

export interface AdminListResponse {
  status: boolean;
  message: string;
  data: {
    items: AdminData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface AdminCreateUpdatePayload {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
  roles?: { id: number }[];
  city_ids?: number[];
}
