// ----------------------------------------------------------------------

export interface AdminData {
  id: number;
  name: string;
  email: string;
  is_active: number;
  roles: string[];
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
  password?: string;
  password_confirmation?: string;
}
