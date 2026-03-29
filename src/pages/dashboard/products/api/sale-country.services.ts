import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

export interface SaleCountryItem {
  id: number;
  name: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SaleCountryListResponse {
  status: boolean;
  message: string;
  data: {
    items: SaleCountryItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export const _SaleCountryApi = {
  getListSaleCountries: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<SaleCountryListResponse> => {
    const response = await axiosInstance.get<SaleCountryListResponse>(apiRoutes.saleCountry.list, {
      params,
    });
    return response.data;
  },
};
