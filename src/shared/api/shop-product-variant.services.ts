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

export const _ShopProductVariantApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    shop_id?: number;
    category_id?: number;
  }): Promise<ShopProductVariantListResponse> => {
    const response = await axiosInstance.get(apiRoutes.shopProductVariant.list, { params });
    return response.data;
  },
};
