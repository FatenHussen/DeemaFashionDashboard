import type {
  AffiliateWithdrawListResponse,
  AffiliateWithdrawUpdatePayload,
  AffiliateWithdrawDetailsResponse,
} from '../types/affiliate-withdraw.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _AffiliateWithdrawApi = {
  getListRequests: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    affiliate_id?: string;
    from?: string;
    to?: string;
    min_amount?: number;
    max_amount?: number;
  }): Promise<AffiliateWithdrawListResponse> => {
    const response = await axiosInstance.get<AffiliateWithdrawListResponse>(
      apiRoutes.affiliateWithdraw.list,
      { params }
    );
    return response.data;
  },

  getRequestById: async (id: number | string): Promise<AffiliateWithdrawDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.affiliateWithdraw.details(id));
    return response.data;
  },

  updateRequest: async (id: number | string, data: AffiliateWithdrawUpdatePayload): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.affiliateWithdraw.update(id), data);
    return response.data;
  },
};
