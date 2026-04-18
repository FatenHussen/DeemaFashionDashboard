import type {
  ShopData,
  ShopListResponse,
  ShopCreateUpdatePayload,
} from '../types/shop.types';

import { apiRoutes, axiosInstance } from '@/api';

/** Builds FormData for create and update - logo included when user selects a new file */
const buildFormDataPayload = (data: ShopCreateUpdatePayload): FormData => {
  const formData = new FormData();
  formData.append('vendor_id', String(data.vendor_id));
  formData.append('name[ar]', data.name.ar);
  formData.append('name[en]', data.name.en);
  formData.append('description[ar]', data.description.ar);
  formData.append('description[en]', data.description.en);
  formData.append('address[ar]', data.address.ar);
  formData.append('address[en]', data.address.en);
  formData.append('lat', String(data.lat));
  formData.append('lng', String(data.lng));
  formData.append('phone', data.phone);
  formData.append('mobile', data.mobile);
  formData.append('email', data.email);
  formData.append('is_active', data.is_active ? '1' : '0');
  formData.append('area_id', String(data.area_id));
  data.service_ids.forEach((s, i) => formData.append(`service_ids[${i}][id]`, String(s.id)));
  Object.entries(data.working_hours || {}).forEach(([day, schedule]) => {
    if (schedule && typeof schedule === 'object') {
      if (schedule.closed) formData.append(`working_hours[${day}][closed]`, '1');
      if (schedule.open) formData.append(`working_hours[${day}][open]`, schedule.open);
      if (schedule.close) formData.append(`working_hours[${day}][close]`, schedule.close);
    }
  });
  // Only send logo when the user picked a new file. Omit on update so the API keeps the existing image.
  if (data.logo instanceof File) {
    formData.append('logo', data.logo);
  }
  if (data.badges && data.badges.length > 0) {
    data.badges.forEach((badgeId) => {
      formData.append('badges[]', String(badgeId));
    });
  }
  formData.append('is_restaurant', data.is_restaurant ? '1' : '0');
  (data.payment_methods ?? []).forEach((m) => {
    formData.append('payment_methods[]', m);
  });
  formData.append('pricing_tier', data.pricing_tier);
  formData.append('is_recommended', data.is_recommended ? '1' : '0');
  return formData;
};

export const _ShopApi = {
  getListShop: async (params?: {
    page?: number;
    per_page?: number;
    vendor_id?: number;
    shop_status?: string;
    /** Admin / user listing: filter by shop classification */
    shop_type?: string;
  }): Promise<ShopListResponse> => {
    const response = await axiosInstance.get<ShopListResponse>(apiRoutes.shop.list, { params });
    return response.data;
  },
  createShop: async (data: ShopCreateUpdatePayload): Promise<any> => {
    const formData = buildFormDataPayload(data);
    const response = await axiosInstance.post(apiRoutes.shop.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateShop: async (id: number | string, data: ShopCreateUpdatePayload): Promise<any> => {
    const formData = buildFormDataPayload(data);
    formData.append('_method', 'PUT');
    const response = await axiosInstance.post(apiRoutes.shop.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteShop: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.shop.delete(id));
    return response.data;
  },
  getShopById: async (id: number | string): Promise<{ status: boolean; data: ShopData }> => {
    const response = await axiosInstance.get(apiRoutes.shop.details(id));
    return response.data;
  },
};
