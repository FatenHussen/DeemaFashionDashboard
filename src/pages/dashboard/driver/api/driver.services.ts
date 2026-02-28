import type {
  DriverListResponse,
  DriverDetailsResponse,
  DriverCreateUpdatePayload,
} from '../types/driver.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { DriverCreateUpdatePayload };

const hasImage = (data: DriverCreateUpdatePayload) =>
  data.image instanceof File || (typeof data.image === 'string' && data.image.length > 0);

const buildFormDataPayload = (data: DriverCreateUpdatePayload): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('phone', data.phone);
  formData.append('address', data.address);
  if (data.password) formData.append('password', data.password);
  data.area_ids.forEach((a, i) => formData.append(`area_ids[${i}][id]`, String(a.id)));
  if (data.rate_per_order != null && data.rate_per_order !== '')
    formData.append('rate_per_order', String(data.rate_per_order));
  if (data.vehicle_type) formData.append('vehicle_type', data.vehicle_type);
  formData.append('vehicle_number', String(data.vehicle_number ?? ''));
  if (data.image instanceof File) {
    formData.append('image', data.image);
  } else if (typeof data.image === 'string') {
    formData.append('image', data.image);
  }
  return formData;
};

export const _DriverApi = {
  getListDrivers: async (
    params?: { page?: number; per_page?: number }
  ): Promise<DriverListResponse> => {
    const response = await axiosInstance.get<DriverListResponse>(apiRoutes.driver.list, { params });
    return response.data;
  },
  getDriverById: async (id: number | string): Promise<DriverDetailsResponse> => {
    const response = await axiosInstance.get<DriverDetailsResponse>(apiRoutes.driver.details(id));
    return response.data;
  },
  createDriver: async (data: DriverCreateUpdatePayload): Promise<any> => {
    if (hasImage(data)) {
      const formData = buildFormDataPayload(data);
      const response = await axiosInstance.post(apiRoutes.driver.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await axiosInstance.post(apiRoutes.driver.create, data);
    return response.data;
  },
  updateDriver: async (id: number | string, data: DriverCreateUpdatePayload): Promise<any> => {
    if (hasImage(data)) {
      const formData = buildFormDataPayload(data);
      formData.append('_method', 'PUT');
      const response = await axiosInstance.post(apiRoutes.driver.update(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await axiosInstance.put(apiRoutes.driver.update(id), data);
    return response.data;
  },
  deleteDriver: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.driver.delete(id));
    return response.data;
  },
};
