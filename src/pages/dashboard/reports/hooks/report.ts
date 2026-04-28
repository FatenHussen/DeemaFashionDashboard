import type { SalesReportParams, ProductMovementReportParams } from '../types/report.types';

import { queryKeys } from '@/api';
import { useQuery } from '@tanstack/react-query';

import { _ReportApi } from '../api/report.services';

export const useFetchSalesReport = (params?: SalesReportParams) =>
  useQuery({
    queryKey: queryKeys.report.sales(params),
    queryFn: () => _ReportApi.getSalesReport(params),
  });

export const useFetchProductMovementReport = (params?: ProductMovementReportParams) =>
  useQuery({
    queryKey: queryKeys.report.productMovement(params),
    queryFn: () => _ReportApi.getProductMovementReport(params),
  });

export const useFetchVendorPerformanceReport = (
  vendorId: number | string,
  params?: { from_date?: string; to_date?: string },
  enabled = true
) =>
  useQuery({
    queryKey: queryKeys.report.vendorPerformance(vendorId, params),
    queryFn: () => _ReportApi.getVendorPerformanceReport(vendorId, params),
    enabled: enabled && !!vendorId,
  });

export const useFetchDriverPerformanceReport = (
  driverId: number | string,
  params?: { from_date?: string; to_date?: string },
  enabled = true
) =>
  useQuery({
    queryKey: queryKeys.report.driverPerformance(driverId, params),
    queryFn: () => _ReportApi.getDriverPerformanceReport(driverId, params),
    enabled: enabled && !!driverId,
  });

export const useFetchSalesByLocationReport = (params?: {
  from_date?: string;
  to_date?: string;
}) =>
  useQuery({
    queryKey: queryKeys.report.salesByLocation(params),
    queryFn: () => _ReportApi.getSalesByLocationReport(params),
  });

export const useFetchSalesByCategoryReport = (params?: {
  from_date?: string;
  to_date?: string;
}) =>
  useQuery({
    queryKey: queryKeys.report.salesByCategory(params),
    queryFn: () => _ReportApi.getSalesByCategoryReport(params),
  });
