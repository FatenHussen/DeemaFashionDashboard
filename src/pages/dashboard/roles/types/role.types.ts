// ----------------------------------------------------------------------

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface RoleData {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  permissions?: Permission[];
}

export interface RoleListResponse {
  status: boolean;
  message: string;
  data: {
    items: RoleData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface RoleDetailsResponse {
  status: boolean;
  message: string;
  data: RoleData;
}

export interface PermissionListResponse {
  status: boolean;
  message: string;
  data: {
    items: Permission[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface RoleCreateUpdatePayload {
  name: string;
  permissions: { id: number }[];
}

