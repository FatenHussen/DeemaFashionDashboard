import type {
  BasketListResponse,
  BasketDetailsResponse,
  BasketCreateUpdatePayload,
} from '../types/basket.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _BasketApi = {
  getListBaskets: async (
    params?: { page?: number; per_page?: number }
  ): Promise<BasketListResponse> => {
    const response = await axiosInstance.get<BasketListResponse>(apiRoutes.basket.list, {
      params,
    });
    return response.data;
  },

  getBasketById: async (id: number | string): Promise<BasketDetailsResponse> => {
    const response = await axiosInstance.get<BasketDetailsResponse>(apiRoutes.basket.details(id));
    return response.data;
  },

  createBasket: async (data: BasketCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();
    formData.append('category_id', String(data.category_id));
    formData.append('name[ar]', data.name.ar);
    formData.append('name[en]', data.name.en);
    formData.append('discount_type', data.discount_type);
    if (data.discount !== undefined) formData.append('discount', String(data.discount));
    if (data.offer_ends_at) formData.append('offer_ends_at', data.offer_ends_at);
    if (data.delivery_price !== undefined) formData.append('delivery_price', String(data.delivery_price));
    if (data.image instanceof File) formData.append('image', data.image);

    data.items.forEach((item, i) => {
      formData.append(`items[${i}][shop_product_variant_id]`, String(item.shop_product_variant_id));
      formData.append(`items[${i}][quantity]`, String(item.quantity));
    });

    if (data.badges && data.badges.length > 0) {
      data.badges.forEach((badge, index) => {
        formData.append(`badges[${index}][id]`, String(badge.id));
        formData.append(`badges[${index}][position]`, badge.position);
      });
    }

    const response = await axiosInstance.post(apiRoutes.basket.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateBasket: async (id: number | string, data: BasketCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();
    formData.append('category_id', String(data.category_id));
    formData.append('name[ar]', data.name.ar);
    formData.append('name[en]', data.name.en);
    formData.append('discount_type', data.discount_type);
    if (data.discount !== undefined) formData.append('discount', String(data.discount));
    if (data.offer_ends_at) formData.append('offer_ends_at', data.offer_ends_at);
    if (data.delivery_price !== undefined) formData.append('delivery_price', String(data.delivery_price));
    if (data.image instanceof File) formData.append('image', data.image);

    data.items.forEach((item, i) => {
      formData.append(`items[${i}][shop_product_variant_id]`, String(item.shop_product_variant_id));
      formData.append(`items[${i}][quantity]`, String(item.quantity));
    });

    if (data.badges && data.badges.length > 0) {
      data.badges.forEach((badge, index) => {
        formData.append(`badges[${index}][id]`, String(badge.id));
        formData.append(`badges[${index}][position]`, badge.position);
      });
    }

    const response = await axiosInstance.patch(apiRoutes.basket.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteBasket: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.basket.delete(id));
    return response.data;
  },
};
