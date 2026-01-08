import { axiosInstance, apiRoutes } from '@/api';
import type {
  RoleListResponse,
  RoleDetailsResponse,
  RoleCreateUpdatePayload,
  PermissionListResponse,
} from '../types/role.types';

export const _RoleApi = {
  getListRoles: async (): Promise<RoleListResponse> => {
    const response = await axiosInstance.get<RoleListResponse>(apiRoutes.role.list);
    return response.data;
  },
  getRoleById: async (id: number | string): Promise<RoleDetailsResponse> => {
    const response = await axiosInstance.get<RoleDetailsResponse>(apiRoutes.role.details(id));
    return response.data;
  },
  createRole: async (data: RoleCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.role.create, data);
    return response.data;
  },
  updateRole: async (id: number | string, data: RoleCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.role.update(id), data);
    return response.data;
  },
  deleteRole: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.role.delete(id));
    return response.data;
  },
  getListPermissions: async (): Promise<PermissionListResponse> => {
    const response = await axiosInstance.get<PermissionListResponse>(apiRoutes.permission.list);
    return response.data;
  },
};

