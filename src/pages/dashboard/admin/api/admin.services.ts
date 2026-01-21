import type { AdminData, AdminListResponse, AdminCreateUpdatePayload } from '../types/admin.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { AdminCreateUpdatePayload };

export const _AdminApi = {
  getListAdmin: async (): Promise<AdminListResponse> => {
    const response = await axiosInstance.get<AdminListResponse>(apiRoutes.admin.list);
    return response.data;
  },
  createAdmin: async (data: AdminCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.admin.create, data);
    return response.data;
  },
  updateAdmin: async (id: number | string, data: AdminCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.admin.update(id), data);
    return response.data;
  },
  deleteAdmin: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.admin.delete(id));
    return response.data;
  },
  getAdminById: async (id: number | string): Promise<AdminData> => {
    const response = await axiosInstance.get<AdminListResponse>(apiRoutes.admin.list);
    // Find the admin by ID from the list (or you might have a separate endpoint)
    const admin = response.data.data.items.find((item) => item.id === Number(id));
    if (!admin) {
      throw new Error('Admin not found');
    }
    return admin;
  },
};
