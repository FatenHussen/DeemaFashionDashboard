import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

export interface ProductVariantUpdatePayload {
  is_trend?: number;
  is_active?: number;
  attributes_values_ids?: number[];
  images?: File[];
  existing_images_ids?: number[];
  sku?: string;
  name?: { en: string; ar: string };
  stock?: number;
  max_purchase_quantity?: number;
  delivery_time?: string;
}

const buildVariantFormData = (data: ProductVariantUpdatePayload): FormData => {
  const formData = new FormData();

  if (data.is_trend !== undefined) formData.append('is_trend', String(data.is_trend));
  if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
  if (data.sku !== undefined) formData.append('sku', data.sku);
  if (data.name?.en !== undefined) formData.append('name[en]', data.name.en);
  if (data.name?.ar !== undefined) formData.append('name[ar]', data.name.ar);
  if (data.stock !== undefined) formData.append('stock', String(data.stock));
  if (data.max_purchase_quantity !== undefined)
    formData.append('max_purchase_quantity', String(data.max_purchase_quantity));
  if (data.delivery_time !== undefined) formData.append('delivery_time', data.delivery_time);

  (data.attributes_values_ids ?? []).forEach((id) => {
    formData.append('attributes_values_ids[]', String(id));
  });

  (data.existing_images_ids ?? []).forEach((id) => {
    formData.append('existing_images_ids[]', String(id));
  });

  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => formData.append('images[]', file));
  }

  formData.append('_method', 'PUT');
  return formData;
};

export const _ProductVariantApi = {
  update: async (id: number | string, data: ProductVariantUpdatePayload): Promise<any> => {
    const formData = buildVariantFormData(data);
    const response = await axiosInstance.post(apiRoutes.productVariant.update(id), formData, {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.productVariant.delete(id));
    return response.data;
  },
};
