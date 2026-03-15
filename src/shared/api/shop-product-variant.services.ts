import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

export interface ShopProductVariantItem {
  id: number;
  label: string;
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

export const _ShopProductVariantApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    shop_id?: number;
    category_id?: number;
  }): Promise<ShopProductVariantListResponse> => {
    const page = params?.page ?? 1;
    const perPage = params?.per_page ?? 10;
    try {
      const response = await axiosInstance.get(apiRoutes.shopProductVariant.list, { params });
      const data = response?.data;
      if (!data?.data?.items || !Array.isArray(data.data.items)) {
        return emptyResponse(page, perPage);
      }
      const items = data.data.items.filter(
        (i: any) => i != null && typeof i.id === 'number'
      );
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
