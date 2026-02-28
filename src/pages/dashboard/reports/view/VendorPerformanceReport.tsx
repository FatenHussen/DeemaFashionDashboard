import type { ExportFormat } from '../api/report.services';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';
import { useFetchVendors } from '@/pages/dashboard/vendor/hooks/vendor';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { _ReportApi } from '../api/report.services';
import { useFetchVendorPerformanceReport } from '../hooks/report';

// ----------------------------------------------------------------------

const metadata = {
  title: `Vendor Performance Report | Dashboard - ${CONFIG.appName}`,
};

export default function VendorPerformanceReportPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';

  const [vendorId, setVendorId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: vendorsData } = useFetchVendors(1, 200);
  const vendors = vendorsData?.data?.items ?? [];

  const params = {
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };

  const { data, isLoading } = useFetchVendorPerformanceReport(vendorId, params, !!vendorId);

  const reportData = data?.data;

  const handleExport = async (format: ExportFormat) => {
    if (!vendorId) {
      toast.error('Please select a vendor');
      return;
    }

    setIsExporting(true);

    try {
      await _ReportApi.exportVendorPerformanceReport(Number(vendorId), format, params);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch {} finally {
      setIsExporting(false);
    }
  };

  if (isLoading && vendorId && !reportData) return <LoadingScreen />;

  const tableContainerClass =
    'w-full border border-border/30 bg-background overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300';

  return (
    <>
      <title>{metadata.title}</title>

      <div className="flex w-full flex-col">
        {/* Header */}
        <div className="mx-6 mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/60 px-4 py-3 shadow-sm rtl:flex-row-reverse">
          {/* Left Section */}
          <Box className="flex items-center gap-3">
            <Button
              variant="text"
              size="small"
              onClick={() => navigate(paths.dashboard.reports)}
              className="-ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Reports
            </Button>

            <Box className="h-5 w-px bg-border/60 hidden sm:block" />

            <Box className="flex items-center gap-3">
              <Box className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Iconify icon="solar:shop-2-bold" className="text-primary" width={28} />
              </Box>

              <Box>
                <Typography variant="h6" className="font-semibold">
                  Vendor Performance Report
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Select a vendor and date range
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Filters */}
          <Box className="flex flex-wrap items-center gap-2">
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="h-9 min-w-[200px] rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Select vendor...</option>
              {vendors.map((v) => {
                const name =
                  typeof v.name === 'object'
                    ? (v.name?.[lang as 'ar' | 'en'] ??
                      (v.name as { en?: string })?.en ??
                      `Vendor #${v.id}`)
                    : (v.name ?? `Vendor #${v.id}`);

                return (
                  <option key={v.id} value={v.id}>
                    {name}
                  </option>
                );
              })}
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            />

            {vendorId && (
              <>
                <Box className="h-5 w-px bg-border/60" />

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleExport('excel')}
                  disabled={isExporting}
                >
                  <Iconify icon="solar:file-spreadsheet-bold" width={18} className="mr-1" />
                  Excel
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                >
                  <Iconify icon="solar:file-text-bold" width={18} className="mr-1" />
                  PDF
                </Button>
              </>
            )}
          </Box>
        </div>

        {/* Content */}
        <div className="w-full space-y-4 transition-opacity duration-500 p-6">
          {reportData && vendorId && (
            <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Total Sales', value: reportData.total_sales?.toFixed(2) },
                { label: 'Total Orders', value: reportData.total_orders },
                {
                  label: 'Avg Order Value',
                  value: reportData.average_order_value?.toFixed(2),
                },
                { label: 'Total Shops', value: reportData.total_shops },
                { label: 'Active Shops', value: reportData.active_shops },
                {
                  label: 'Average Rating',
                  value: reportData.average_rating?.toFixed(1),
                },
                { label: 'Total Ratings', value: reportData.total_ratings },
                {
                  label: 'Customer Satisfaction',
                  value: `${reportData.customer_satisfaction?.toFixed(1)}%`,
                },
              ].map(({ label, value }) => (
                <Box key={label} className={`${tableContainerClass} p-4`}>
                  <Typography variant="caption" className="text-muted-foreground">
                    {label}
                  </Typography>
                  <Typography variant="h6" className="font-bold">
                    {value ?? '-'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {!vendorId && (
            <Box className={`${tableContainerClass} p-12 text-center`}>
              <Typography variant="body2" className="text-muted-foreground">
                Select a vendor to view performance report
              </Typography>
            </Box>
          )}
        </div>
      </div>
    </>
  );
}
