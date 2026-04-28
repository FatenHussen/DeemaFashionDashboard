import type {
  ProductDetailData,
  ProductListResponse,
  ProductDetailResponse,
  ProductCreateUpdatePayload,
  AdminProductVariantsListApiResponse,
} from '../types/product.types';

import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

const splitKeywords = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const appendSeoKeywords = (formData: FormData, kw?: { en?: string; ar?: string }) => {
  if (!kw) return;
  splitKeywords(kw.en ?? '').forEach((w) => formData.append('seo_keywords[en][]', w));
  splitKeywords(kw.ar ?? '').forEach((w) => formData.append('seo_keywords[ar][]', w));
};

const buildProductFormData = (data: ProductCreateUpdatePayload): FormData => {
  const formData = new FormData();

  if (data.id != null && !Number.isNaN(Number(data.id))) {
    const pid = String(data.id);
    formData.append('id', pid);
    formData.append('product_id', pid);
  }

  formData.append('category_id', data.category_id.toString());
  formData.append('name[en]', data.name.en);
  formData.append('name[ar]', data.name.ar);
  formData.append('description[en]', data.description.en);
  formData.append('description[ar]', data.description.ar);
  if (data.price !== undefined && data.price !== null && !Number.isNaN(Number(data.price))) {
    formData.append('price', String(data.price));
  }
  formData.append('quantity', data.quantity.toString());
  formData.append('is_instant_delivery', data.is_instant_delivery.toString());

  formData.append('is_visible', String(data.is_visible ?? 1));
  formData.append('brand_id', String(data.brand_id ?? 0));
  formData.append('vendor_id', String(data.vendor_id ?? 0));

  const discountType = data.discount_type ?? 'none';
  formData.append('discount_type', discountType);
  formData.append('discount', String(data.discount ?? 0));

  if (data.cost_price !== undefined && data.cost_price !== null) {
    formData.append('cost_price', String(data.cost_price));
  }
  if (data.unit_id != null && data.unit_id > 0) {
    formData.append('unit_id', String(data.unit_id));
  }
  if (data.warranty_period !== undefined && data.warranty_period !== null) {
    formData.append('warranty_period', String(data.warranty_period));
  }

  formData.append('full_description[en]', data.full_description?.en ?? '');
  formData.append('full_description[ar]', data.full_description?.ar ?? '');
  formData.append('country_id', String(data.country_id ?? 0));
  formData.append('sale_country_id', String(data.sale_country_id ?? 0));
  formData.append('sku', data.sku ?? '');
  formData.append('model', data.model ?? '');
  formData.append('barcode', data.barcode ?? '');
  formData.append('time_prepare', data.time_prepare ?? '');
  formData.append('delivery_time', data.delivery_time ?? '');
  const expiryTrimmed = data.expiry_date?.trim() ?? '';
  if (data.id != null) {
    formData.append('expiry_date', expiryTrimmed);
  } else if (expiryTrimmed) {
    formData.append('expiry_date', expiryTrimmed);
  }

  formData.append('seo_title[en]', data.seo_title?.en ?? '');
  formData.append('seo_title[ar]', data.seo_title?.ar ?? '');
  formData.append('seo_description[en]', data.seo_description?.en ?? '');
  formData.append('seo_description[ar]', data.seo_description?.ar ?? '');
  appendSeoKeywords(formData, data.seo_keywords);
  if (data.seo_image instanceof File) {
    formData.append('seo_image', data.seo_image);
  }

  if (data.thumbnail instanceof File) {
    formData.append('thumbnail', data.thumbnail);
  }

  // Send every kept gallery id; omitting the key entirely often makes Laravel drop all media on update.
  if (Array.isArray(data.existing_media_ids)) {
    data.existing_media_ids.forEach((mediaId) => {
      formData.append('existing_media_ids[]', String(mediaId));
    });
  }
  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => {
      formData.append('media[]', file);
    });
  }

  (data.bought_with ?? []).forEach((productId, index) => {
    formData.append(`bought_with[${index}]`, String(productId));
  });

  const validVariants =
    data.variants?.filter(
      (v) =>
        Array.isArray(v.attributes_values_ids) && v.attributes_values_ids.length > 0
    ) ?? [];
  if (validVariants.length > 0) {
    const categoryIdStr = data.category_id.toString();
    validVariants.forEach((variant, vIndex) => {
      formData.append(`variants[${vIndex}][category_id]`, categoryIdStr);
      if (variant.id) {
        formData.append(`variants[${vIndex}][id]`, variant.id.toString());
      }
      (variant.attributes_values_ids ?? []).forEach((attrValueId) => {
        formData.append(`variants[${vIndex}][attributes_values_ids][]`, String(attrValueId));
      });
      const variantExistingImgIds = Array.isArray(variant.existing_images_ids)
        ? variant.existing_images_ids
        : [];
      variantExistingImgIds.forEach((imgId) => {
        formData.append(`variants[${vIndex}][existing_images_ids][]`, String(imgId));
      });
      if (variant.images && variant.images.length > 0) {
        variant.images.forEach((file) => {
          formData.append(`variants[${vIndex}][images][]`, file);
        });
      }
      if (variant.sku !== undefined && variant.sku !== '') {
        formData.append(`variants[${vIndex}][sku]`, variant.sku);
      }
      if (variant.name?.en !== undefined) {
        formData.append(`variants[${vIndex}][name][en]`, variant.name.en);
      }
      if (variant.name?.ar !== undefined) {
        formData.append(`variants[${vIndex}][name][ar]`, variant.name.ar);
      }
      if (variant.stock !== undefined) {
        formData.append(`variants[${vIndex}][stock]`, String(variant.stock));
      }
      if (variant.max_purchase_quantity !== undefined) {
        formData.append(`variants[${vIndex}][max_purchase_quantity]`, String(variant.max_purchase_quantity));
      }
      if (variant.delivery_time !== undefined && variant.delivery_time !== '') {
        formData.append(`variants[${vIndex}][delivery_time]`, variant.delivery_time);
      }
    });
  }

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

  if (data.extra_details && data.extra_details.length > 0) {
    data.extra_details.forEach((detail, index) => {
      if (detail.id) {
        formData.append(`extra_details[${index}][id]`, detail.id.toString());
      }
      formData.append(`extra_details[${index}][detail_key][en]`, detail.detail_key.en);
      formData.append(`extra_details[${index}][detail_key][ar]`, detail.detail_key.ar);
      formData.append(`extra_details[${index}][detail_value][en]`, detail.detail_value.en);
      formData.append(`extra_details[${index}][detail_value][ar]`, detail.detail_value.ar);
      if (detail.price !== undefined && detail.price !== null && !Number.isNaN(Number(detail.price))) {
        formData.append(`extra_details[${index}][price]`, String(detail.price));
      }
    });
  }

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

  (data.badges ?? []).forEach((badgeId) => {
    formData.append('badges[]', String(badgeId));
  });

  (data.icon_ids ?? []).forEach((iconId) => {
    formData.append('icon_ids[]', String(iconId));
  });

  return formData;
};

export type ProductListQueryParams = {
  page?: number;
  per_page?: number;
  limit?: number;
  shop_id?: number;
  category_id?: number;
  brand_id?: number;
  vendor_id?: number;
  /** Single attribute filter (mutually exclusive with `category_attribute_ids` on the wire). */
  category_attribute_id?: number;
  /** Multiple attribute filters — serialized as `category_attribute_ids[]`. */
  category_attribute_ids?: number[];
  stock_sort?: 'asc' | 'desc';
  approval_status?: string;
  is_visible?: boolean | number | string;
  search?: string;
  /** When set, list is filtered to this product id (numeric search in UI). */
  id?: number;
  sort_field?: string;
  sort_order?: string;
  sortField?: string;
  sortOrder?: string;
};

function appendProductListParam(
  usp: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined | null
) {
  if (value === undefined || value === null || value === '') return;
  usp.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
}

// ----------------------------------------------------------------------

export const _ProductApi = {
  getListProducts: async (params?: ProductListQueryParams): Promise<ProductListResponse> => {
    const {
      sort_field,
      sort_order,
      sortField,
      sortOrder,
      limit,
      per_page,
      category_attribute_id,
      category_attribute_ids,
      stock_sort,
      ...rest
    } = params ?? {};

    const usp = new URLSearchParams();

    Object.entries(rest).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      appendProductListParam(usp, k, v as string | number | boolean);
    });

    appendProductListParam(usp, 'per_page', per_page ?? limit);

    const sf = sortField ?? sort_field;
    const so = sortOrder ?? sort_order;
    appendProductListParam(usp, 'sort_field', sf as string | undefined);
    appendProductListParam(usp, 'sort_order', so as string | undefined);

    appendProductListParam(usp, 'stock_sort', stock_sort);

    const multiIds = (category_attribute_ids ?? [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (multiIds.length > 1) {
      multiIds.forEach((id) => usp.append('category_attribute_ids[]', String(id)));
    } else if (multiIds.length === 1) {
      appendProductListParam(usp, 'category_attribute_id', multiIds[0]);
    } else if (category_attribute_id != null && !Number.isNaN(Number(category_attribute_id))) {
      appendProductListParam(usp, 'category_attribute_id', Number(category_attribute_id));
    }

    const qs = usp.toString();
    const url = qs ? `${apiRoutes.product.list}?${qs}` : apiRoutes.product.list;
    const response = await axiosInstance.get<ProductListResponse>(url);
    return response.data;
  },

  getProductById: async (id: number | string): Promise<ProductDetailData> => {
    const response = await axiosInstance.get<ProductDetailResponse>(apiRoutes.product.details(id));
    return response.data.data;
  },

  getProductVariants: async (
    productId: number | string,
    params?: { page?: number; per_page?: number }
  ): Promise<AdminProductVariantsListApiResponse['data']> => {
    const response = await axiosInstance.get<AdminProductVariantsListApiResponse>(
      apiRoutes.product.variants(productId),
      {
        params: {
          page: params?.page ?? 1,
          per_page: params?.per_page ?? 10,
        },
      }
    );
    const body = response.data;
    const inner = body?.data;
    return {
      items: Array.isArray(inner?.items) ? inner.items : [],
      pagination: inner?.pagination ?? {
        current_page: 1,
        last_page: 1,
        per_page: params?.per_page ?? 10,
        total: 0,
      },
    };
  },

  createProduct: async (data: ProductCreateUpdatePayload): Promise<any> => {
    const formData = buildProductFormData(data);
    // Do not set Content-Type manually — browser/axios must add multipart boundary or Laravel may not parse files/arrays.
    const response = await axiosInstance.post(apiRoutes.product.create, formData, {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    return response.data;
  },

  updateProduct: async (id: number | string, data: ProductCreateUpdatePayload): Promise<any> => {
    const numericId = typeof id === 'string' ? Number(id) : id;
    const formData = buildProductFormData({
      ...data,
      id: Number.isNaN(numericId) ? data.id : numericId,
    });
    // PHP only parses multipart bodies for POST. PUT + multipart often arrives empty on the server
    // unless we spoof: POST with _method=PUT (Laravel route still matches Route::put).
    formData.append('_method', 'PUT');
    const response = await axiosInstance.post(apiRoutes.product.update(id), formData, {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
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

  updateProductPrice: async (id: number | string, price: number): Promise<any> => {
    const formData = new FormData();
    formData.append('price', String(price));
    formData.append('_method', 'PUT');
    const response = await axiosInstance.post(apiRoutes.product.update(id), formData);
    return response.data;
  },

  updateProductQuantity: async (id: number | string, quantity: number): Promise<any> => {
    const formData = new FormData();
    formData.append('quantity', String(quantity));
    formData.append('_method', 'PUT');
    const response = await axiosInstance.post(apiRoutes.product.update(id), formData);
    return response.data;
  },
};
