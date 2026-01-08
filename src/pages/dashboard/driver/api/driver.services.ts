import { axiosInstance, apiRoutes } from '@/api';
import type {
  DriverListResponse,
  DriverDetailsResponse,
  DriverCreateUpdatePayload,
} from '../types/driver.types';

export const _DriverApi = {
  getListDrivers: async (): Promise<DriverListResponse> => {
    const response = await axiosInstance.get<DriverListResponse>(apiRoutes.driver.list);
    return response.data;
  },
  getDriverById: async (id: number | string): Promise<DriverDetailsResponse> => {
    const response = await axiosInstance.get<DriverDetailsResponse>(apiRoutes.driver.details(id));
    return response.data;
  },
  createDriver: async (data: DriverCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.driver.create, data);
    return response.data;
  },
  updateDriver: async (id: number | string, data: DriverCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.driver.update(id), data);
    return response.data;
  },
  deleteDriver: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.driver.delete(id));
    return response.data;
  },
};
