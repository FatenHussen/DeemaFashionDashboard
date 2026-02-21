import type {
  AreaData,
  AreaListResponse,
  AreaDetailsResponse,
  AreaCreateUpdatePayload,
} from '../types/area.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { AreaCreateUpdatePayload };

export const _AreaApi = {
  getListAreas: async (): Promise<AreaListResponse> => {
    const response = await axiosInstance.get<AreaListResponse>(apiRoutes.area.list);
    return response.data;
  },
  createArea: async (data: AreaCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.area.create, data);
    return response.data;
  },
  updateArea: async (id: number | string, data: AreaCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.area.update(id), data);
    return response.data;
  },
  deleteArea: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.area.delete(id));
    return response.data;
  },
  getAreaById: async (id: number | string): Promise<AreaData> => {
    const response = await axiosInstance.get<AreaDetailsResponse>(apiRoutes.area.details(id));
    return response.data.data;
  },
};

