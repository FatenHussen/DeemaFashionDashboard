import type {
  CountsResponse,
  TopShopsResponse,
  UserGrowthResponse,
  OrdersByDayResponse,
  OrderFunnelResponse,
  StockLevelsResponse,
  RevenueTrendResponse,
  OrdersByHourResponse,
  SalesHeatmapResponse,
  TopCategoriesResponse,
  OrdersByStatusResponse,
  DriverComparisonResponse,
  MonthlyPerformanceResponse,
  AvgOrderValueTrendResponse,
  DashboardStatisticsResponse,
} from '../types/statistics.types';

import { apiRoutes, axiosInstance } from '@/api';

export type DateFilter = { date_from?: string; date_to?: string };

export const _StatisticsApi = {
  getDashboard: async (params?: { year?: number } & DateFilter): Promise<DashboardStatisticsResponse> => {
    const response = await axiosInstance.get<DashboardStatisticsResponse>(
      apiRoutes.statistics.dashboard,
      { params }
    );
    return response.data;
  },

  getCounts: async (params?: DateFilter): Promise<CountsResponse> => {
    const response = await axiosInstance.get<CountsResponse>(apiRoutes.statistics.counts, { params });
    return response.data;
  },

  getMonthlyPerformance: async (
    params?: { year?: number } & DateFilter
  ): Promise<MonthlyPerformanceResponse> => {
    const response = await axiosInstance.get<MonthlyPerformanceResponse>(
      apiRoutes.statistics.monthlyPerformance,
      { params }
    );
    return response.data;
  },

  getOrdersByStatus: async (params?: DateFilter): Promise<OrdersByStatusResponse> => {
    const response = await axiosInstance.get<OrdersByStatusResponse>(
      apiRoutes.statistics.ordersByStatus,
      { params }
    );
    return response.data;
  },

  getTopShops: async (params?: { limit?: number } & DateFilter): Promise<TopShopsResponse> => {
    const response = await axiosInstance.get<TopShopsResponse>(
      apiRoutes.statistics.topShops,
      { params }
    );
    return response.data;
  },

  getRevenueTrend: async (params?: { days?: number } & DateFilter): Promise<RevenueTrendResponse> => {
    const response = await axiosInstance.get<RevenueTrendResponse>(
      apiRoutes.statistics.revenueTrend,
      { params }
    );
    return response.data;
  },

  getOrdersByHour: async (params?: DateFilter): Promise<OrdersByHourResponse> => {
    const response = await axiosInstance.get<OrdersByHourResponse>(
      apiRoutes.statistics.ordersByHour,
      { params }
    );
    return response.data;
  },

  getOrdersByDay: async (params?: DateFilter): Promise<OrdersByDayResponse> => {
    const response = await axiosInstance.get<OrdersByDayResponse>(
      apiRoutes.statistics.ordersByDay,
      { params }
    );
    return response.data;
  },

  getTopCategories: async (params?: { limit?: number } & DateFilter): Promise<TopCategoriesResponse> => {
    const response = await axiosInstance.get<TopCategoriesResponse>(
      apiRoutes.statistics.topCategories,
      { params }
    );
    return response.data;
  },

  getUserGrowth: async (params?: { months?: number } & DateFilter): Promise<UserGrowthResponse> => {
    const response = await axiosInstance.get<UserGrowthResponse>(
      apiRoutes.statistics.userGrowth,
      { params }
    );
    return response.data;
  },

  getOrderFunnel: async (params?: DateFilter): Promise<OrderFunnelResponse> => {
    const response = await axiosInstance.get<OrderFunnelResponse>(
      apiRoutes.statistics.orderFunnel,
      { params }
    );
    return response.data;
  },

  getAvgOrderValueTrend: async (
    params?: { months?: number } & DateFilter
  ): Promise<AvgOrderValueTrendResponse> => {
    const response = await axiosInstance.get<AvgOrderValueTrendResponse>(
      apiRoutes.statistics.avgOrderValueTrend,
      { params }
    );
    return response.data;
  },

  getDriverComparison: async (params?: { limit?: number } & DateFilter): Promise<DriverComparisonResponse> => {
    const response = await axiosInstance.get<DriverComparisonResponse>(
      apiRoutes.statistics.driverComparison,
      { params }
    );
    return response.data;
  },

  getStockLevels: async (params?: DateFilter): Promise<StockLevelsResponse> => {
    const response = await axiosInstance.get<StockLevelsResponse>(
      apiRoutes.statistics.stockLevels,
      { params }
    );
    return response.data;
  },

  getSalesHeatmap: async (params?: DateFilter): Promise<SalesHeatmapResponse> => {
    const response = await axiosInstance.get<SalesHeatmapResponse>(
      apiRoutes.statistics.salesHeatmap,
      { params }
    );
    return response.data;
  },
};
