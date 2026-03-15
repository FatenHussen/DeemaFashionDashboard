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

export const _StatisticsApi = {
  getDashboard: async (params?: { year?: number }): Promise<DashboardStatisticsResponse> => {
    const response = await axiosInstance.get<DashboardStatisticsResponse>(
      apiRoutes.statistics.dashboard,
      { params }
    );
    return response.data;
  },

  getCounts: async (): Promise<CountsResponse> => {
    const response = await axiosInstance.get<CountsResponse>(apiRoutes.statistics.counts);
    return response.data;
  },

  getMonthlyPerformance: async (
    params?: { year?: number }
  ): Promise<MonthlyPerformanceResponse> => {
    const response = await axiosInstance.get<MonthlyPerformanceResponse>(
      apiRoutes.statistics.monthlyPerformance,
      { params }
    );
    return response.data;
  },

  getOrdersByStatus: async (): Promise<OrdersByStatusResponse> => {
    const response = await axiosInstance.get<OrdersByStatusResponse>(
      apiRoutes.statistics.ordersByStatus
    );
    return response.data;
  },

  getTopShops: async (params?: { limit?: number }): Promise<TopShopsResponse> => {
    const response = await axiosInstance.get<TopShopsResponse>(
      apiRoutes.statistics.topShops,
      { params }
    );
    return response.data;
  },

  getRevenueTrend: async (params?: { days?: number }): Promise<RevenueTrendResponse> => {
    const response = await axiosInstance.get<RevenueTrendResponse>(
      apiRoutes.statistics.revenueTrend,
      { params }
    );
    return response.data;
  },

  getOrdersByHour: async (): Promise<OrdersByHourResponse> => {
    const response = await axiosInstance.get<OrdersByHourResponse>(
      apiRoutes.statistics.ordersByHour
    );
    return response.data;
  },

  getOrdersByDay: async (): Promise<OrdersByDayResponse> => {
    const response = await axiosInstance.get<OrdersByDayResponse>(
      apiRoutes.statistics.ordersByDay
    );
    return response.data;
  },

  getTopCategories: async (params?: { limit?: number }): Promise<TopCategoriesResponse> => {
    const response = await axiosInstance.get<TopCategoriesResponse>(
      apiRoutes.statistics.topCategories,
      { params }
    );
    return response.data;
  },

  getUserGrowth: async (params?: { months?: number }): Promise<UserGrowthResponse> => {
    const response = await axiosInstance.get<UserGrowthResponse>(
      apiRoutes.statistics.userGrowth,
      { params }
    );
    return response.data;
  },

  getOrderFunnel: async (): Promise<OrderFunnelResponse> => {
    const response = await axiosInstance.get<OrderFunnelResponse>(
      apiRoutes.statistics.orderFunnel
    );
    return response.data;
  },

  getAvgOrderValueTrend: async (
    params?: { months?: number }
  ): Promise<AvgOrderValueTrendResponse> => {
    const response = await axiosInstance.get<AvgOrderValueTrendResponse>(
      apiRoutes.statistics.avgOrderValueTrend,
      { params }
    );
    return response.data;
  },

  getDriverComparison: async (params?: { limit?: number }): Promise<DriverComparisonResponse> => {
    const response = await axiosInstance.get<DriverComparisonResponse>(
      apiRoutes.statistics.driverComparison,
      { params }
    );
    return response.data;
  },

  getStockLevels: async (): Promise<StockLevelsResponse> => {
    const response = await axiosInstance.get<StockLevelsResponse>(
      apiRoutes.statistics.stockLevels
    );
    return response.data;
  },

  getSalesHeatmap: async (): Promise<SalesHeatmapResponse> => {
    const response = await axiosInstance.get<SalesHeatmapResponse>(
      apiRoutes.statistics.salesHeatmap
    );
    return response.data;
  },
};
