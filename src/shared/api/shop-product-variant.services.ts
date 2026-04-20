import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

export interface ShopProductVariantItem {
  id: number;
  label: string;
  /** From API — display as-is (backend may compute discount / price_after_discount). */
  price?: number;
  discount?: number | null;
  price_after_discount?: number | null;
  cost_price?: number | null;
  /** Present on list/detail payloads from API */
  variant_image?: string | null;
  product?: { image?: string | null };
  sku?: string | null;
  model?: string | null;
  barcode?: string | null;
  [key: string]: unknown;
}

export interface ShopProductVariantListResponse {
  status: boolean;
  message: string;
  data: {
    items: ShopProductVariantItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

const emptyResponse = (page: number, perPage: number): ShopProductVariantListResponse => ({
  status: true,
  message: '',
  data: {
    items: [],
    pagination: {
      current_page: page,
      last_page: page,
      per_page: perPage,
      total: 0,
    },
  },
});

export interface ShopProductVariantUpdatePayload {
  price?: number;
  cost_price?: number;
  discount?: number;
  quantity?: number;
  shop_id?: number;
  product_variant_id?: number;
  stock?: number;
  max_purchase_quantity?: number;
  delivery_time?: string;
}

export const _ShopProductVariantApi = {
  update: async (id: number | string, data: ShopProductVariantUpdatePayload): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.shopProductVariant.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.shopProductVariant.delete(id));
    return response.data;
  },

  getList: async (params?: {
    page?: number;
    per_page?: number;
    shop_id?: number;
    category_id?: number;
    /** When set, backend may filter variants in any of these categories */
    category_ids?: number[];
  }): Promise<ShopProductVariantListResponse> => {
    const page = params?.page ?? 1;
    const perPage = params?.per_page ?? 10;
    try {
      const { category_ids, ...rest } = params ?? {};
      const query: Record<string, unknown> = { ...rest };
      if (category_ids?.length) {
        query.category_ids = category_ids;
      }
      const response = await axiosInstance.get(apiRoutes.shopProductVariant.list, { params: query });
      const data = response?.data;
      if (!data?.data?.items || !Array.isArray(data.data.items)) {
        return emptyResponse(page, perPage);
      }
      const items = data.data.items
        .filter((i: any) => i != null && i.id != null && String(i.id).trim() !== '')
        .map((i: any) => ({
          ...i,
          id: typeof i.id === 'number' ? i.id : Number(i.id),
          label: typeof i.label === 'string' ? i.label : String(i.label ?? ''),
        }))
        .filter((i: ShopProductVariantItem) => Number.isFinite(i.id) && i.id > 0);
      return {
        status: data.status ?? true,
        message: data.message ?? '',
        data: {
          items,
          pagination:
            data.data?.pagination ?? {
              current_page: page,
              last_page: page,
              per_page: perPage,
              total: items.length,
            },
        },
      };
    } catch {
      return emptyResponse(page, perPage);
    }
  },
};
