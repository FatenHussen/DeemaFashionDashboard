import type {
  CancelCustomOrderPayload,
  ConvertCustomOrderPayload,
  CustomOrderRequestListParams,
  CustomOrderRequestListResponse,
  CustomOrderRequestDetailsResponse,
} from '../types/custom-order-request.types';

import { apiRoutes, axiosInstance } from '@/api';

function buildConvertFormData(payload: ConvertCustomOrderPayload): FormData {
  const formData = new FormData();

  payload.items.forEach((item, i) => {
    formData.append(`items[${i}][type]`, item.type);

    if (item.type === 'catalog') {
      formData.append(`items[${i}][shop_product_variant_id]`, String(item.shop_product_variant_id));
      formData.append(`items[${i}][quantity]`, String(item.quantity));
      if (item.note?.trim()) {
        formData.append(`items[${i}][note]`, item.note.trim());
      }
      return;
    }

    formData.append(`items[${i}][product_name]`, item.product_name);
    formData.append(`items[${i}][unit_price]`, String(item.unit_price));
    formData.append(`items[${i}][quantity]`, String(item.quantity));
    if (item.note?.trim()) {
      formData.append(`items[${i}][note]`, item.note.trim());
    }
    if (item.invoice_image instanceof File) {
      formData.append(`items[${i}][invoice_image]`, item.invoice_image);
    }
  });

  if (payload.delivery_price !== undefined && payload.delivery_price !== null) {
    formData.append('delivery_price', String(payload.delivery_price));
  }
  if (payload.approximate_total !== undefined && payload.approximate_total !== null) {
    formData.append('approximate_total', String(payload.approximate_total));
  }

  const hasExternal = payload.items.some((item) => item.type === 'external');
  if (hasExternal) {
    if (payload.price_variance_type) {
      formData.append('price_variance_type', payload.price_variance_type);
    }
    if (payload.price_variance_value !== undefined && payload.price_variance_value !== null) {
      formData.append('price_variance_value', String(payload.price_variance_value));
    }
  }

  if (payload.admin_note?.trim()) {
    formData.append('admin_note', payload.admin_note.trim());
  }
  if (payload.is_instant_delivery !== undefined) {
    formData.append('is_instant_delivery', payload.is_instant_delivery ? '1' : '0');
  }

  return formData;
}

export const _CustomOrderRequestApi = {
  getList: async (
    params?: CustomOrderRequestListParams
  ): Promise<CustomOrderRequestListResponse> => {
    const response = await axiosInstance.get<CustomOrderRequestListResponse>(
      apiRoutes.customOrderRequest.list,
      { params }
    );
    return response.data;
  },

  getById: async (id: number | string): Promise<CustomOrderRequestDetailsResponse> => {
    const response = await axiosInstance.get<CustomOrderRequestDetailsResponse>(
      apiRoutes.customOrderRequest.getOne(id)
    );
    return response.data;
  },

  convert: async (id: number | string, payload: ConvertCustomOrderPayload): Promise<any> => {
    const formData = buildConvertFormData(payload);
    const response = await axiosInstance.post(apiRoutes.customOrderRequest.convert(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  cancel: async (id: number | string, payload: CancelCustomOrderPayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.customOrderRequest.cancel(id), payload);
    return response.data;
  },
};
