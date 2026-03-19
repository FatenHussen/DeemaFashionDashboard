import type { DateFilter } from '../api/statistics.services';

import { queryKeys } from '@/api';
import { useQuery } from '@tanstack/react-query';

import { _StatisticsApi } from '../api/statistics.services';

export const useFetchDashboardStatistics = (year?: number, dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.dashboard({ year, ...dateFilter }),
    queryFn: () => _StatisticsApi.getDashboard({ year, ...dateFilter }),
  });

export const useFetchStatCounts = (dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.counts(dateFilter),
    queryFn: () => _StatisticsApi.getCounts(dateFilter),
  });

export const useFetchMonthlyPerformance = (year?: number, dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.monthlyPerformance({ year, ...dateFilter }),
    queryFn: () => _StatisticsApi.getMonthlyPerformance({ year, ...dateFilter }),
  });

export const useFetchOrdersByStatus = (dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.ordersByStatus(dateFilter),
    queryFn: () => _StatisticsApi.getOrdersByStatus(dateFilter),
  });

export const useFetchTopShops = (limit?: number, dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.topShops({ limit, ...dateFilter }),
    queryFn: () => _StatisticsApi.getTopShops({ limit, ...dateFilter }),
  });

export const useFetchRevenueTrend = (days?: number, dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.revenueTrend({ days, ...dateFilter }),
    queryFn: () => _StatisticsApi.getRevenueTrend({ days, ...dateFilter }),
  });

export const useFetchOrdersByHour = (dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.ordersByHour(dateFilter),
    queryFn: () => _StatisticsApi.getOrdersByHour(dateFilter),
  });

export const useFetchOrdersByDay = (dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.ordersByDay(dateFilter),
    queryFn: () => _StatisticsApi.getOrdersByDay(dateFilter),
  });

export const useFetchTopCategories = (limit?: number, dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.topCategories({ limit, ...dateFilter }),
    queryFn: () => _StatisticsApi.getTopCategories({ limit, ...dateFilter }),
  });

export const useFetchUserGrowth = (months?: number, dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.userGrowth({ months, ...dateFilter }),
    queryFn: () => _StatisticsApi.getUserGrowth({ months, ...dateFilter }),
  });

export const useFetchOrderFunnel = (dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.orderFunnel(dateFilter),
    queryFn: () => _StatisticsApi.getOrderFunnel(dateFilter),
  });

export const useFetchAvgOrderValueTrend = (months?: number, dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.avgOrderValueTrend({ months, ...dateFilter }),
    queryFn: () => _StatisticsApi.getAvgOrderValueTrend({ months, ...dateFilter }),
  });

export const useFetchDriverComparison = (limit?: number, dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.driverComparison({ limit, ...dateFilter }),
    queryFn: () => _StatisticsApi.getDriverComparison({ limit, ...dateFilter }),
  });

export const useFetchStockLevels = (dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.stockLevels(dateFilter),
    queryFn: () => _StatisticsApi.getStockLevels(dateFilter),
  });

export const useFetchSalesHeatmap = (dateFilter?: DateFilter) =>
  useQuery({
    queryKey: queryKeys.statistics.salesHeatmap(dateFilter),
    queryFn: () => _StatisticsApi.getSalesHeatmap(dateFilter),
  });
