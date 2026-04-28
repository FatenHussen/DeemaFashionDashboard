import type {
  UpdateWithdrawPayload,
  VendorStatementResponse,
  WithdrawRequestsResponse,
  WithdrawRequestDetailResponse,
  VendorAccountingSummaryResponse,
  VendorAccountingVendorsResponse,
} from '../types';

import { apiRoutes, axiosInstance } from '@/api';

export const _VendorAccountingApi = {
  getSummary: async (params?: {
    from_date?: string;
    to_date?: string;
    settlement_cycle?: 'weekly' | 'monthly';
  }): Promise<VendorAccountingSummaryResponse> => {
    const response = await axiosInstance.get<VendorAccountingSummaryResponse>(
      apiRoutes.vendorAccounting.summary,
      { params }
    );
    return response.data;
  },

  getVendors: async (params?: {
    search?: string;
    is_active?: boolean;
    from_date?: string;
    to_date?: string;
    settlement_cycle?: 'weekly' | 'monthly';
    page?: number;
    per_page?: number;
  }): Promise<VendorAccountingVendorsResponse> => {
    const { is_active, ...rest } = params ?? {};
    // Laravel query validation often expects 0/1, not the string "false" from `is_active=false`.
    const queryParams: Record<string, unknown> = { ...rest };
    if (is_active !== undefined) {
      queryParams.is_active = is_active ? 1 : 0;
    }
    const response = await axiosInstance.get<VendorAccountingVendorsResponse>(
      apiRoutes.vendorAccounting.vendors,
      { params: queryParams }
    );
    return response.data;
  },

  getVendorStatement: async (
    vendorId: number | string,
    params?: {
      from_date?: string;
      to_date?: string;
      settlement_cycle?: 'weekly' | 'monthly';
      withdraw_status?: 'pending' | 'paid' | 'rejected';
      withdraw_per_page?: number;
      page?: number;
    }
  ): Promise<VendorStatementResponse> => {
    const response = await axiosInstance.get<VendorStatementResponse>(
      apiRoutes.vendorAccounting.vendorStatement(vendorId),
      { params }
    );
    return response.data;
  },

  getWithdrawRequests: async (params?: {
    status?: 'pending' | 'paid' | 'rejected';
    vendor_id?: number;
    payment_method?: 'bank_transfer' | 'cash' | 'wallet' | 'other';
    from?: string;
    to?: string;
    min_amount?: number;
    max_amount?: number;
    search?: string;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }): Promise<WithdrawRequestsResponse> => {
    const response = await axiosInstance.get<WithdrawRequestsResponse>(
      apiRoutes.vendorWithdrawRequest.list,
      { params }
    );
    return response.data;
  },

  getWithdrawRequest: async (id: number | string): Promise<WithdrawRequestDetailResponse> => {
    const response = await axiosInstance.get<WithdrawRequestDetailResponse>(
      apiRoutes.vendorWithdrawRequest.details(id)
    );
    return response.data;
  },

  updateWithdrawRequest: async (
    id: number | string,
    payload: UpdateWithdrawPayload
  ): Promise<any> => {
    const response = await axiosInstance.put(
      apiRoutes.vendorWithdrawRequest.update(id),
      payload
    );
    return response.data;
  },
};
