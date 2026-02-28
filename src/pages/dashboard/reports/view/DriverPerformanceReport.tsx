import type { ExportFormat } from '../api/report.services';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';
import { useFetchDrivers } from '@/pages/dashboard/driver/hooks/driver';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { _ReportApi } from '../api/report.services';
import { useFetchDriverPerformanceReport } from '../hooks/report';

// ----------------------------------------------------------------------

const metadata = { title: `Driver Performance Report | Dashboard - ${CONFIG.appName}` };

export default function DriverPerformanceReportPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const [driverId, setDriverId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: driversData } = useFetchDrivers(1, 200);
  const drivers = driversData?.data?.items ?? [];

  const params = {
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };
  const { data, isLoading } = useFetchDriverPerformanceReport(
    driverId,
    params,
    !!driverId
  );
  const reportData = data?.data;

  const handleExport = async (format: ExportFormat) => {
    if (!driverId) {
      toast.error('Please select a driver');
      return;
    }
    setIsExporting(true);
    try {
      await _ReportApi.exportDriverPerformanceReport(Number(driverId), format, params);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch {} finally {
      setIsExporting(false);
    }
  };

  if (isLoading && driverId && !reportData) return <LoadingScreen />;

  const tableContainerClass =
    'w-full border border-border/30 bg-background overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300';

  return (
    <>
      <title>{metadata.title}</title>
      <div className="flex w-full flex-col">
        <div className="mx-6 mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/60 px-4 py-3 shadow-sm rtl:flex-row-reverse">
          <Box className="flex items-center gap-3">
            <Button variant="text" size="small" onClick={() => navigate(paths.dashboard.reports)} className="-ml-2 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> Back to Reports
            </Button>
            <Box className="h-5 w-px bg-border/60 hidden sm:block" />
            <Box className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Iconify icon="solar:delivery-bold" className="text-primary" width={22} height={22} />
            </Box>
            <Box>
              <Typography variant="h6" className="font-semibold">Driver Performance Report</Typography>
              <Typography variant="caption" className="text-muted-foreground">Select a driver and date range</Typography>
            </Box>
          </Box>
          <Box className="flex flex-wrap items-center gap-2">
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="h-9 min-w-[200px] rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select driver...</option>
                {drivers.map((d) => {
                  const dAny = d as { name?: string | { ar?: string; en?: string }; user?: { name?: string } };
                  const name = typeof dAny.name === 'object' ? (dAny.name?.[lang as 'ar' | 'en'] ?? dAny.name?.en) : dAny.name;
                  return (
                    <option key={d.id} value={d.id}>
                      {name ?? dAny.user?.name ?? d.phone ?? `Driver #${d.id}`}
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
              {driverId && (
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

        <div className="w-full space-y-4 transition-opacity duration-500 p-6">
          {reportData && driverId && (
            <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Total Orders', value: reportData.total_orders },
                  { label: 'Total Earnings', value: reportData.total_earnings?.toFixed(2) },
                  { label: 'Avg Delivery Time (min)', value: reportData.average_delivery_time_minutes?.toFixed(1) },
                  { label: 'Average Rating', value: reportData.average_rating?.toFixed(1) },
                  { label: 'Total Ratings', value: reportData.total_ratings },
                  { label: 'Total Complaints', value: reportData.total_complaints },
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

          {!driverId && (
            <Box className={`${tableContainerClass} p-12 text-center`}>
              <Typography variant="body2" className="text-muted-foreground">
                Select a driver to view performance report
              </Typography>
            </Box>
          )}
        </div>
      </div>
    </>
  );
}
