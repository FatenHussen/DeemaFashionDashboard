import type {
  UserPointsListResponse,
  UserPointsDetailsResponse,
  UserPointsAddDeductPayload,
  UserPointsStatisticsResponse,
  UserPointsTransactionsResponse,
} from '../types/user-points.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _UserPointsApi = {
  getListUserPoints: async (
    params?: { page?: number; per_page?: number; search?: string; balance_min?: number; balance_max?: number }
  ): Promise<UserPointsListResponse> => {
    const response = await axiosInstance.get<UserPointsListResponse>(apiRoutes.userPoints.list, {
      params,
    });
    return response.data;
  },

  getUserPointsById: async (userId: number | string): Promise<UserPointsDetailsResponse> => {
    const response = await axiosInstance.get<UserPointsDetailsResponse>(apiRoutes.userPoints.details(userId));
    return response.data;
  },

  getUserPointsTransactions: async (
    userId: number | string,
    params?: {
      page?: number;
      per_page?: number;
      source?: string;
      status?: string;
      from_date?: string;
      to_date?: string;
    }
  ): Promise<UserPointsTransactionsResponse> => {
    const response = await axiosInstance.get<UserPointsTransactionsResponse>(
      apiRoutes.userPoints.transactions(userId),
      { params }
    );
    return response.data;
  },

  addPoints: async (userId: number | string, data: UserPointsAddDeductPayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.userPoints.add, {
      user_id: Number(userId),
      ...data,
    });
    return response.data;
  },

  deductPoints: async (userId: number | string, data: UserPointsAddDeductPayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.userPoints.deduct, {
      user_id: Number(userId),
      ...data,
    });
    return response.data;
  },

  getStatistics: async (): Promise<UserPointsStatisticsResponse> => {
    const response = await axiosInstance.get<UserPointsStatisticsResponse>(apiRoutes.userPoints.statistics);
    return response.data;
  },
};
