import { queryKeys } from '@/api';
import { useQuery } from '@tanstack/react-query';

import { _StatisticsApi } from '../api/statistics.services';

export const useFetchDashboardStatistics = (year?: number) =>
  useQuery({
    queryKey: queryKeys.statistics.dashboard({ year }),
    queryFn: () => _StatisticsApi.getDashboard({ year }),
  });

export const useFetchStatCounts = () =>
  useQuery({
    queryKey: queryKeys.statistics.counts(),
    queryFn: () => _StatisticsApi.getCounts(),
  });

export const useFetchMonthlyPerformance = (year?: number) =>
  useQuery({
    queryKey: queryKeys.statistics.monthlyPerformance({ year }),
    queryFn: () => _StatisticsApi.getMonthlyPerformance({ year }),
  });

export const useFetchOrdersByStatus = () =>
  useQuery({
    queryKey: queryKeys.statistics.ordersByStatus(),
    queryFn: () => _StatisticsApi.getOrdersByStatus(),
  });

export const useFetchTopShops = (limit?: number) =>
  useQuery({
    queryKey: queryKeys.statistics.topShops({ limit }),
    queryFn: () => _StatisticsApi.getTopShops({ limit }),
  });

export const useFetchRevenueTrend = (days?: number) =>
  useQuery({
    queryKey: queryKeys.statistics.revenueTrend({ days }),
    queryFn: () => _StatisticsApi.getRevenueTrend({ days }),
  });

export const useFetchOrdersByHour = () =>
  useQuery({
    queryKey: queryKeys.statistics.ordersByHour(),
    queryFn: () => _StatisticsApi.getOrdersByHour(),
  });

export const useFetchOrdersByDay = () =>
  useQuery({
    queryKey: queryKeys.statistics.ordersByDay(),
    queryFn: () => _StatisticsApi.getOrdersByDay(),
  });

export const useFetchTopCategories = (limit?: number) =>
  useQuery({
    queryKey: queryKeys.statistics.topCategories({ limit }),
    queryFn: () => _StatisticsApi.getTopCategories({ limit }),
  });

export const useFetchUserGrowth = (months?: number) =>
  useQuery({
    queryKey: queryKeys.statistics.userGrowth({ months }),
    queryFn: () => _StatisticsApi.getUserGrowth({ months }),
  });

export const useFetchOrderFunnel = () =>
  useQuery({
    queryKey: queryKeys.statistics.orderFunnel(),
    queryFn: () => _StatisticsApi.getOrderFunnel(),
  });

export const useFetchAvgOrderValueTrend = (months?: number) =>
  useQuery({
    queryKey: queryKeys.statistics.avgOrderValueTrend({ months }),
    queryFn: () => _StatisticsApi.getAvgOrderValueTrend({ months }),
  });

export const useFetchDriverComparison = (limit?: number) =>
  useQuery({
    queryKey: queryKeys.statistics.driverComparison({ limit }),
    queryFn: () => _StatisticsApi.getDriverComparison({ limit }),
  });

export const useFetchStockLevels = () =>
  useQuery({
    queryKey: queryKeys.statistics.stockLevels(),
    queryFn: () => _StatisticsApi.getStockLevels(),
  });

export const useFetchSalesHeatmap = () =>
  useQuery({
    queryKey: queryKeys.statistics.salesHeatmap(),
    queryFn: () => _StatisticsApi.getSalesHeatmap(),
  });
