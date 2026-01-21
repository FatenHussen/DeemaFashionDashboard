import type {
  ServiceListResponse,
  ServiceCreateUpdatePayload,
} from '../types/service.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { ServiceCreateUpdatePayload };

export const _ServiceApi = {
  getListServices: async (page: number = 1, limit: number = 25): Promise<ServiceListResponse> => {
    const response = await axiosInstance.get<ServiceListResponse>(
      `${apiRoutes.service.list}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
  createService: async (data: ServiceCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.service.create, data);
    return response.data;
  },
  updateService: async (id: number | string, data: ServiceCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.service.update(id), data);
    return response.data;
  },
  deleteService: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.service.delete(id));
    return response.data;
  },
};
