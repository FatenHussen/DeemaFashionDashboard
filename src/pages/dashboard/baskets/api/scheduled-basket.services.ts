import type {
  ScheduledBasketListResponse,
  ScheduledBasketDetailsResponse,
  ScheduledBasketCreateUpdatePayload,
  ScheduledBasketListParams,
} from '../types/scheduled-basket.types';

import { apiRoutes, axiosInstance } from '@/api';

function buildScheduledBasketFormData(data: ScheduledBasketCreateUpdatePayload): FormData {
  const formData = new FormData();
  formData.append('category_id', String(data.category_id));
  formData.append('name[ar]', data.name.ar);
  formData.append('name[en]', data.name.en);
  formData.append('discount_type', data.discount_type);
  if (data.discount !== undefined) formData.append('discount', String(data.discount));
  if (data.delivery_price !== undefined) formData.append('delivery_price', String(data.delivery_price));
  if (data.image instanceof File) formData.append('image', data.image);
  formData.append('is_active', String(data.is_active));

  // Schedule object (required by API for create; same shape for update)
  formData.append('schedule[title][en]', data.schedule.title.en || '');
  formData.append('schedule[title][ar]', data.schedule.title.ar || '');
  formData.append('schedule[number_of_days]', String(data.schedule.number_of_days || 1));
  if (data.schedule.discount_type) {
    formData.append('schedule[discount_type]', data.schedule.discount_type);
  }
  if (data.schedule.discount_value != null) {
    formData.append('schedule[discount_value]', String(data.schedule.discount_value));
  }
  formData.append('schedule[is_active]', String(data.schedule.is_active));

  // Items with enhanced fields
  data.items.forEach((item, i) => {
    formData.append(`items[${i}][shop_product_variant_id]`, String(item.shop_product_variant_id));
    formData.append(`items[${i}][quantity]`, String(item.quantity));

    if (item.is_required !== undefined) {
      formData.append(`items[${i}][is_required]`, String(item.is_required));
    }
    if (item.is_extra !== undefined) {
      formData.append(`items[${i}][is_extra]`, String(item.is_extra));
    }
    if (item.min_quantity !== undefined) {
      formData.append(`items[${i}][min_quantity]`, String(item.min_quantity));
    }
    if (item.max_quantity !== undefined) {
      formData.append(`items[${i}][max_quantity]`, String(item.max_quantity));
    }

    // Alternative variant IDs — Laravel expects items[i][shop_product_variant_ids][]
    if (item.shop_product_variant_ids && item.shop_product_variant_ids.length > 0) {
      item.shop_product_variant_ids.forEach((varId) => {
        formData.append(`items[${i}][shop_product_variant_ids][]`, String(varId));
      });
    }
  });

  // Badges
  if (data.badges && data.badges.length > 0) {
    data.badges.forEach((badge, index) => {
      formData.append(`badges[${index}][id]`, String(badge.id));
      formData.append(`badges[${index}][position]`, badge.position);
    });
  }

  return formData;
}

export const _ScheduledBasketApi = {
  getListScheduledBaskets: async (params?: ScheduledBasketListParams): Promise<ScheduledBasketListResponse> => {
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
    const formData = buildScheduledBasketFormData(data);
    const response = await axiosInstance.post(apiRoutes.scheduledBasket.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateScheduledBasket: async (id: number | string, data: ScheduledBasketCreateUpdatePayload): Promise<any> => {
    const formData = buildScheduledBasketFormData(data);
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
