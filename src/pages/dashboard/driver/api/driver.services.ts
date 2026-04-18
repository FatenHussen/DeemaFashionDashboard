import type {
  DriverListResponse,
  DriverDetailsResponse,
  DriverCreateUpdatePayload,
} from '../types/driver.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { DriverCreateUpdatePayload };

const buildFormDataPayload = (data: DriverCreateUpdatePayload): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('phone', data.phone);
  formData.append('address', data.address);
  if (data.password) formData.append('password', data.password);
  data.city_ids.forEach((c, i) => formData.append(`city_ids[${i}][id]`, String(c.id)));
  if (data.shop_ids !== undefined) {
    if (data.shop_ids.length === 0) {
      formData.append('shop_ids', '[]');
    } else {
      data.shop_ids.forEach((s, i) => formData.append(`shop_ids[${i}][id]`, String(s.id)));
    }
  }
  if (data.rate_per_order != null && data.rate_per_order !== '')
    formData.append('rate_per_order', String(data.rate_per_order));
  if (data.vehicle_name != null && data.vehicle_name !== '')
    formData.append('vehicle_name', data.vehicle_name);
  if (data.vehicle_type != null && data.vehicle_type !== '')
    formData.append('vehicle_type', data.vehicle_type);
  formData.append('vehicle_number', String(data.vehicle_number ?? ''));
  if (data.image instanceof File) {
    formData.append('image', data.image);
  }
  if (data.vehicle_image instanceof File) {
    formData.append('vehicle_image', data.vehicle_image);
  }
  if (data.status != null && data.status !== '') {
    formData.append('status', data.status);
  }
  if (data.is_active !== undefined) {
    formData.append('is_active', String(Number(data.is_active)));
  }
  return formData;
};

/** Multipart only when a new profile or vehicle image file is uploaded. */
const needsFormDataUpdate = (data: DriverCreateUpdatePayload) =>
  data.image instanceof File || data.vehicle_image instanceof File;

export const _DriverApi = {
  getListDrivers: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    is_active?: number | boolean;
  }): Promise<DriverListResponse> => {
    const response = await axiosInstance.get<DriverListResponse>(apiRoutes.driver.list, { params });
    return response.data;
  },
  getDriverById: async (id: number | string): Promise<DriverDetailsResponse> => {
    const response = await axiosInstance.get<DriverDetailsResponse>(apiRoutes.driver.details(id));
    return response.data;
  },
  createDriver: async (data: DriverCreateUpdatePayload): Promise<any> => {
    const formData = buildFormDataPayload(data);
    const response = await axiosInstance.post(apiRoutes.driver.create, formData);
    return response.data;
  },
  updateDriver: async (id: number | string, data: DriverCreateUpdatePayload): Promise<any> => {
    if (needsFormDataUpdate(data)) {
      const formData = buildFormDataPayload(data);
      formData.append('_method', 'PUT');
      const response = await axiosInstance.post(apiRoutes.driver.update(id), formData);
      return response.data;
    }
    const { vehicle_image: _v, image: _img, ...jsonBody } = data;
    const response = await axiosInstance.put(apiRoutes.driver.update(id), jsonBody);
    return response.data;
  },
  deleteDriver: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.driver.delete(id));
    return response.data;
  },
};
