import type {
  ProductDetailData,
  ProductListResponse,
  ProductDetailResponse,
  ProductCreateUpdatePayload,
} from '../types/product.types';

import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

const buildProductFormData = (data: ProductCreateUpdatePayload): FormData => {
  const formData = new FormData();

  // Required fields
  formData.append('category_id', data.category_id.toString());
  formData.append('name[en]', data.name.en);
  formData.append('name[ar]', data.name.ar);
  formData.append('description[en]', data.description.en);
  formData.append('description[ar]', data.description.ar);
  formData.append('price', data.price.toString());
  formData.append('quantity', data.quantity.toString());
  formData.append('is_instant_delivery', data.is_instant_delivery.toString());

  // Optional basic fields
  if (data.brand_id && data.brand_id > 0) {
    formData.append('brand_id', data.brand_id.toString());
  }
  if (data.price_after_discount !== undefined && data.price_after_discount !== null) {
    formData.append('price_after_discount', data.price_after_discount.toString());
  }
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

  // Product gallery: keep existing media IDs + append new files (Laravel-style keys)
  if (data.existing_media_ids && data.existing_media_ids.length > 0) {
    data.existing_media_ids.forEach((mediaId) => {
      formData.append('existing_media_ids[]', mediaId.toString());
    });
  }
  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => {
      formData.append('media[]', file);
    });
  }

  // Bought With - indexed notation
  if (data.bought_with && data.bought_with.length > 0) {
    data.bought_with.forEach((productId, index) => {
      formData.append(`bought_with[${index}]`, productId.toString());
    });
  }

  // Variants - with indexed attributes and optional images
  // Only send variants that have attributes_values_ids (required by backend - no default value)
  const validVariants =
    data.variants?.filter(
      (v) =>
        Array.isArray(v.attributes_values_ids) && v.attributes_values_ids.length > 0
    ) ?? [];
  if (validVariants.length > 0) {
    validVariants.forEach((variant, vIndex) => {
      if (variant.id) {
        formData.append(`variants[${vIndex}][id]`, variant.id.toString());
      }
      (variant.attributes_values_ids ?? []).forEach((attrValueId) => {
        formData.append(`variants[${vIndex}][attributes_values_ids][]`, attrValueId.toString());
      });
      (variant.existing_images_ids ?? []).forEach((imgId) => {
        formData.append(`variants[${vIndex}][existing_images_ids][]`, imgId.toString());
      });
      if (variant.images && variant.images.length > 0) {
        variant.images.forEach((file) => {
          formData.append(`variants[${vIndex}][images][]`, file);
        });
      }
    });
  }

  // Category Details (only send entries with valid category_detail_id)
  const validCategoryDetails = (data.category_details ?? []).filter(
    (d) => d.category_detail_id && d.category_detail_id > 0
  );
  if (validCategoryDetails.length > 0) {
    validCategoryDetails.forEach((detail, index) => {
      if (detail.id) {
        formData.append(`category_details[${index}][id]`, detail.id.toString());
      }
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
      if (detail.id) {
        formData.append(`extra_details[${index}][id]`, detail.id.toString());
      }
      formData.append(`extra_details[${index}][detail_key][en]`, detail.detail_key.en);
      formData.append(`extra_details[${index}][detail_key][ar]`, detail.detail_key.ar);
      formData.append(`extra_details[${index}][detail_value][en]`, detail.detail_value.en);
      formData.append(`extra_details[${index}][detail_value][ar]`, detail.detail_value.ar);
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

  // Badges
  if (data.badges && data.badges.length > 0) {
    data.badges.forEach((badge, index) => {
      formData.append(`badges[${index}][id]`, badge.id.toString());
      formData.append(`badges[${index}][position]`, badge.position);
    });
  }

  return formData;
};

// ----------------------------------------------------------------------

export const _ProductApi = {
  getListProducts: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_field?: string;
    sort_order?: string;
    shop_id?: number;
  }): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>(apiRoutes.product.list, {
      params,
    });
    return response.data;
  },

  getProductById: async (id: number | string): Promise<ProductDetailData> => {
    const response = await axiosInstance.get<ProductDetailResponse>(apiRoutes.product.details(id));
    return response.data.data;
  },

  createProduct: async (data: ProductCreateUpdatePayload): Promise<any> => {
    const formData = buildProductFormData(data);
    const response = await axiosInstance.post(apiRoutes.product.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProduct: async (id: number | string, data: ProductCreateUpdatePayload): Promise<any> => {
    const formData = buildProductFormData(data);
    // PUT as required by API doc
    const response = await axiosInstance.put(apiRoutes.product.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteProduct: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.product.delete(id));
    return response.data;
  },

  approveProduct: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.product.approve(id));
    return response.data;
  },

  rejectProduct: async (id: number | string, rejection_reason: string): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.product.reject(id), { rejection_reason });
    return response.data;
  },
};
