import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

export interface ProductVariantUpdatePayload {
  is_trend?: number;
  is_active?: number;
  attributes_values_ids?: number[];
  images?: File[];
  existing_images_ids?: number[];
  sku?: string | null;
  model?: string | null;
  barcode?: string | null;
  name?: { en?: string | null; ar?: string | null };
}

const buildVariantFormData = (data: ProductVariantUpdatePayload): FormData => {
  const formData = new FormData();

  if (data.is_trend !== undefined) formData.append('is_trend', String(data.is_trend));
  if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
  if (data.sku !== undefined) formData.append('sku', data.sku == null ? '' : data.sku);
  if (data.model !== undefined) formData.append('model', data.model == null ? '' : data.model);
  if (data.barcode !== undefined) formData.append('barcode', data.barcode == null ? '' : data.barcode);
  if (data.name?.en !== undefined) formData.append('name[en]', data.name.en == null ? '' : data.name.en);
  if (data.name?.ar !== undefined) formData.append('name[ar]', data.name.ar == null ? '' : data.name.ar);

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
