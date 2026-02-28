import type {
  SalesReportResponse,
  ProductMovementReportResponse,
  VendorPerformanceReportResponse,
  DriverPerformanceReportResponse,
  SalesByLocationReportResponse,
  SalesByCategoryReportResponse,
  SalesReportParams,
  ProductMovementReportParams,
} from '../types/report.types';

import { apiRoutes, axiosInstance } from '@/api';

const getFilenameFromHeaders = (headers: Record<string, string>): string => {
  const disposition = headers['content-disposition'] || headers['Content-Disposition'];
  const match = disposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (match) {
    return match[1].replace(/['"]/g, '').trim();
  }
  return 'report.xlsx';
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export type ExportFormat = 'excel' | 'pdf' | 'csv';

export const _ReportApi = {
  getSalesReport: async (params?: SalesReportParams): Promise<SalesReportResponse> => {
    const response = await axiosInstance.get<SalesReportResponse>(apiRoutes.reports.sales, {
      params,
    });
    return response.data;
  },

  exportSalesReport: async (
    format: ExportFormat = 'excel',
    params?: SalesReportParams
  ): Promise<void> => {
    const response = await axiosInstance.get(apiRoutes.reports.salesExport, {
      params: { format, ...params },
      responseType: 'blob',
    });
    const filename = getFilenameFromHeaders(response.headers as unknown as Record<string, string>);
    triggerDownload(response.data, filename);
  },

  getProductMovementReport: async (
    params?: ProductMovementReportParams
  ): Promise<ProductMovementReportResponse> => {
    const response = await axiosInstance.get<ProductMovementReportResponse>(
      apiRoutes.reports.productMovement,
      { params }
    );
    return response.data;
  },

  exportProductMovementReport: async (
    format: ExportFormat = 'excel',
    params?: ProductMovementReportParams
  ): Promise<void> => {
    const response = await axiosInstance.get(apiRoutes.reports.productMovementExport, {
      params: { format, ...params },
      responseType: 'blob',
    });
    const filename = getFilenameFromHeaders(response.headers as unknown as Record<string, string>);
    triggerDownload(response.data, filename);
  },

  getVendorPerformanceReport: async (
    vendorId: number | string,
    params?: { from_date?: string; to_date?: string }
  ): Promise<VendorPerformanceReportResponse> => {
    const response = await axiosInstance.get<VendorPerformanceReportResponse>(
      apiRoutes.reports.vendorPerformance(vendorId),
      { params }
    );
    return response.data;
  },

  exportVendorPerformanceReport: async (
    vendorId: number | string,
    format: ExportFormat = 'excel',
    params?: { from_date?: string; to_date?: string }
  ): Promise<void> => {
    const response = await axiosInstance.get(
      apiRoutes.reports.vendorPerformanceExport(vendorId),
      {
        params: { format, ...params },
        responseType: 'blob',
      }
    );
    const filename = getFilenameFromHeaders(response.headers as unknown as Record<string, string>);
    triggerDownload(response.data, filename);
  },

  getDriverPerformanceReport: async (
    driverId: number | string,
    params?: { from_date?: string; to_date?: string }
  ): Promise<DriverPerformanceReportResponse> => {
    const response = await axiosInstance.get<DriverPerformanceReportResponse>(
      apiRoutes.reports.driverPerformance(driverId),
      { params }
    );
    return response.data;
  },

  exportDriverPerformanceReport: async (
    driverId: number | string,
    format: ExportFormat = 'excel',
    params?: { from_date?: string; to_date?: string }
  ): Promise<void> => {
    const response = await axiosInstance.get(
      apiRoutes.reports.driverPerformanceExport(driverId),
      {
        params: { format, ...params },
        responseType: 'blob',
      }
    );
    const filename = getFilenameFromHeaders(response.headers as unknown as Record<string, string>);
    triggerDownload(response.data, filename);
  },

  getSalesByLocationReport: async (
    params?: { from_date?: string; to_date?: string }
  ): Promise<SalesByLocationReportResponse> => {
    const response = await axiosInstance.get<SalesByLocationReportResponse>(
      apiRoutes.reports.salesByLocation,
      { params }
    );
    return response.data;
  },

  exportSalesByLocationReport: async (
    format: ExportFormat = 'excel',
    params?: { from_date?: string; to_date?: string }
  ): Promise<void> => {
    const response = await axiosInstance.get(
      apiRoutes.reports.salesByLocationExport,
      {
        params: { format, ...params },
        responseType: 'blob',
      }
    );
    const filename = getFilenameFromHeaders(response.headers as unknown as Record<string, string>);
    triggerDownload(response.data, filename);
  },

  getSalesByCategoryReport: async (
    params?: { from_date?: string; to_date?: string }
  ): Promise<SalesByCategoryReportResponse> => {
    const response = await axiosInstance.get<SalesByCategoryReportResponse>(
      apiRoutes.reports.salesByCategory,
      { params }
    );
    return response.data;
  },

  exportSalesByCategoryReport: async (
    format: ExportFormat = 'excel',
    params?: { from_date?: string; to_date?: string }
  ): Promise<void> => {
    const response = await axiosInstance.get(
      apiRoutes.reports.salesByCategoryExport,
      {
        params: { format, ...params },
        responseType: 'blob',
      }
    );
    const filename = getFilenameFromHeaders(response.headers as unknown as Record<string, string>);
    triggerDownload(response.data, filename);
  },
};
