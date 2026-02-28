import type {
  ScheduledBasketListResponse,
  ScheduledBasketDetailsResponse,
  ScheduledBasketCreateUpdatePayload,
} from '../types/scheduled-basket.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _ScheduledBasketApi = {
  getListScheduledBaskets: async (
    params?: { page?: number; per_page?: number }
  ): Promise<ScheduledBasketListResponse> => {
    const response = await axiosInstance.get<ScheduledBasketListResponse>(apiRoutes.scheduledBasket.list, {
      params,
    });
    return response.data;
  },

  getScheduledBasketById: async (id: number | string): Promise<ScheduledBasketDetailsResponse> => {
    const response = await axiosInstance.get<ScheduledBasketDetailsResponse>(apiRoutes.scheduledBasket.details(id));
    return response.data;
  },

  createScheduledBasket: async (data: ScheduledBasketCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();
    formData.append('category_id', String(data.category_id));
    formData.append('name[ar]', data.name.ar);
    formData.append('name[en]', data.name.en);
    formData.append('discount_type', data.discount_type);
    if (data.discount !== undefined) formData.append('discount', String(data.discount));
    if (data.offer_ends_at) formData.append('offer_ends_at', data.offer_ends_at);
    if (data.delivery_price !== undefined) formData.append('delivery_price', String(data.delivery_price));
    if (data.image instanceof File) formData.append('image', data.image);
    formData.append('scheduled_at', data.scheduled_at);
    if (data.scheduled_end_at) formData.append('scheduled_end_at', data.scheduled_end_at);
    formData.append('is_recurring', String(data.is_recurring));
    if (data.recurrence_type) formData.append('recurrence_type', data.recurrence_type);
    formData.append('is_active', String(data.is_active));

    data.items.forEach((item, i) => {
      formData.append(`items[${i}][shop_product_variant_id]`, String(item.shop_product_variant_id));
      formData.append(`items[${i}][quantity]`, String(item.quantity));
    });

    const response = await axiosInstance.post(apiRoutes.scheduledBasket.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateScheduledBasket: async (id: number | string, data: ScheduledBasketCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();
    formData.append('category_id', String(data.category_id));
    formData.append('name[ar]', data.name.ar);
    formData.append('name[en]', data.name.en);
    formData.append('discount_type', data.discount_type);
    if (data.discount !== undefined) formData.append('discount', String(data.discount));
    if (data.offer_ends_at) formData.append('offer_ends_at', data.offer_ends_at);
    if (data.delivery_price !== undefined) formData.append('delivery_price', String(data.delivery_price));
    if (data.image instanceof File) formData.append('image', data.image);
    formData.append('scheduled_at', data.scheduled_at);
    if (data.scheduled_end_at) formData.append('scheduled_end_at', data.scheduled_end_at);
    formData.append('is_recurring', String(data.is_recurring));
    if (data.recurrence_type) formData.append('recurrence_type', data.recurrence_type);
    formData.append('is_active', String(data.is_active));

    data.items.forEach((item, i) => {
      formData.append(`items[${i}][shop_product_variant_id]`, String(item.shop_product_variant_id));
      formData.append(`items[${i}][quantity]`, String(item.quantity));
    });

    const response = await axiosInstance.patch(apiRoutes.scheduledBasket.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteScheduledBasket: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.scheduledBasket.delete(id));
    return response.data;
  },
};
