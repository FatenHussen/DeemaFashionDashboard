import type {
  ProductListResponse,
  ProductDetailResponse,
  ProductCreateUpdatePayload,
} from '../types/product.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _ProductApi = {
  getListProducts: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>(apiRoutes.product.list, {
      params,
    });
    // console.log('response.data', response.data.data);

    return response.data;
  },

  getProductById: async (id: number | string): Promise<ProductDetailResponse> => {
    const response = await axiosInstance.get<ProductDetailResponse>(apiRoutes.product.details(id));
    return response.data;
  },

  createProduct: async (data: ProductCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();

    // Basic fields
    formData.append('category_id', data.category_id.toString());
    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);
    formData.append('description[en]', data.description.en);
    formData.append('description[ar]', data.description.ar);
    formData.append('price', data.price.toString());
    formData.append('quantity', data.quantity.toString());
    formData.append('is_instant_delivery', data.is_instant_delivery.toString());

    // Optional basic fields
    if (data.full_description) {
      formData.append('full_description[en]', data.full_description.en || '');
      formData.append('full_description[ar]', data.full_description.ar || '');
    }
    if (data.country) {
      formData.append('country[en]', data.country.en || '');
      formData.append('country[ar]', data.country.ar || '');
    }
    if (data.sku) formData.append('sku', data.sku);
    if (data.model) formData.append('model', data.model);
    if (data.barcode) formData.append('barcode', data.barcode);
    if (data.time_prepare) formData.append('time_prepare', data.time_prepare);

    // Images
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append('images[]', file);
      });
    }

    // Variants
    if (data.variants && data.variants.length > 0) {
      data.variants.forEach((variant, index) => {
        variant.attributes_values_ids.forEach((attrValueId) => {
          formData.append(`variants[${index}][attributes_values_ids][]`, attrValueId.toString());
        });
        formData.append(`variants[${index}][price]`, variant.price.toString());
      });
    }

    // Category Details
    if (data.category_details && data.category_details.length > 0) {
      data.category_details.forEach((detail, index) => {
        formData.append(
          `category_details[${index}][category_detail_id]`,
          detail.category_detail_id.toString()
        );
        formData.append(`category_details[${index}][detail_value][en]`, detail.detail_value.en);
        formData.append(`category_details[${index}][detail_value][ar]`, detail.detail_value.ar);
      });
    }

    // Extra Details
    if (data.extra_details && data.extra_details.length > 0) {
      data.extra_details.forEach((detail, index) => {
        formData.append(`extra_details[${index}][detail_key][en]`, detail.detail_key.en);
        formData.append(`extra_details[${index}][detail_key][ar]`, detail.detail_key.ar);
        formData.append(`extra_details[${index}][detail_value][en]`, detail.detail_value.en);
        formData.append(`extra_details[${index}][detail_value][ar]`, detail.detail_value.ar);
      });
    }

    // Bought With
    if (data.bought_with && data.bought_with.length > 0) {
      data.bought_with.forEach((productId) => {
        formData.append('bought_with[]', productId.toString());
      });
    }

    // Shop Variants
    if (data.shop_variants && data.shop_variants.length > 0) {
      data.shop_variants.forEach((shopVariant, index) => {
        formData.append(`shop_variants[${index}][shop_id]`, shopVariant.shop_id.toString());
        formData.append(
          `shop_variants[${index}][variant_index]`,
          shopVariant.variant_index.toString()
        );
        formData.append(`shop_variants[${index}][price]`, shopVariant.price.toString());
        formData.append(`shop_variants[${index}][quantity]`, shopVariant.quantity.toString());
      });
    }

    const response = await axiosInstance.post(apiRoutes.product.create, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id: number | string, data: ProductCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();

    // Basic fields
    formData.append('category_id', data.category_id.toString());
    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);
    formData.append('description[en]', data.description.en);
    formData.append('description[ar]', data.description.ar);
    formData.append('price', data.price.toString());
    formData.append('quantity', data.quantity.toString());
    formData.append('is_instant_delivery', data.is_instant_delivery.toString());

    // Optional basic fields
    if (data.full_description) {
      formData.append('full_description[en]', data.full_description.en || '');
      formData.append('full_description[ar]', data.full_description.ar || '');
    }
    if (data.country) {
      formData.append('country[en]', data.country.en || '');
      formData.append('country[ar]', data.country.ar || '');
    }
    if (data.sku) formData.append('sku', data.sku);
    if (data.model) formData.append('model', data.model);
    if (data.barcode) formData.append('barcode', data.barcode);
    if (data.time_prepare) formData.append('time_prepare', data.time_prepare);

    // Images
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append('images[]', file);
      });
    }

    // Variants
    if (data.variants && data.variants.length > 0) {
      data.variants.forEach((variant, index) => {
        variant.attributes_values_ids.forEach((attrValueId) => {
          formData.append(`variants[${index}][attributes_values_ids][]`, attrValueId.toString());
        });
        formData.append(`variants[${index}][price]`, variant.price.toString());
      });
    }

    // Category Details
    if (data.category_details && data.category_details.length > 0) {
      data.category_details.forEach((detail, index) => {
        formData.append(
          `category_details[${index}][category_detail_id]`,
          detail.category_detail_id.toString()
        );
        formData.append(`category_details[${index}][detail_value][en]`, detail.detail_value.en);
        formData.append(`category_details[${index}][detail_value][ar]`, detail.detail_value.ar);
      });
    }

    // Extra Details
    if (data.extra_details && data.extra_details.length > 0) {
      data.extra_details.forEach((detail, index) => {
        formData.append(`extra_details[${index}][detail_key][en]`, detail.detail_key.en);
        formData.append(`extra_details[${index}][detail_key][ar]`, detail.detail_key.ar);
        formData.append(`extra_details[${index}][detail_value][en]`, detail.detail_value.en);
        formData.append(`extra_details[${index}][detail_value][ar]`, detail.detail_value.ar);
      });
    }

    // Bought With
    if (data.bought_with && data.bought_with.length > 0) {
      data.bought_with.forEach((productId) => {
        formData.append('bought_with[]', productId.toString());
      });
    }

    // Shop Variants
    if (data.shop_variants && data.shop_variants.length > 0) {
      data.shop_variants.forEach((shopVariant, index) => {
        formData.append(`shop_variants[${index}][shop_id]`, shopVariant.shop_id.toString());
        formData.append(
          `shop_variants[${index}][variant_index]`,
          shopVariant.variant_index.toString()
        );
        formData.append(`shop_variants[${index}][price]`, shopVariant.price.toString());
        formData.append(`shop_variants[${index}][quantity]`, shopVariant.quantity.toString());
      });
    }

    const response = await axiosInstance.patch(apiRoutes.product.update(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProduct: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.product.delete(id));
    return response.data;
  },
};
