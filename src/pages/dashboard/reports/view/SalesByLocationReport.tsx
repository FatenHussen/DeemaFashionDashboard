import type { ExportFormat } from '../api/report.services';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { _ReportApi } from '../api/report.services';
import { useFetchSalesByLocationReport } from '../hooks/report';

// ----------------------------------------------------------------------

const metadata = { title: `Sales by Location | Dashboard - ${CONFIG.appName}` };

function getDisplayName(
  value: string | { ar?: string; en?: string } | undefined,
  lang: string
): string {
  if (value == null) return '-';
  if (typeof value === 'string') return value;
  return (lang === 'ar' ? value.ar : value.en) || value.en || value.ar || '-';
}

export default function SalesByLocationReportPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const params = {
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };
  const { data, isLoading, refetch } = useFetchSalesByLocationReport(params);
  const reportData = (data?.data ?? data) as
    | {
        by_governorate?: {
          governorate?: string | { ar?: string; en?: string };
          total_orders?: number;
          total_revenue?: number;
        }[];
        by_city?: {
          city?: string | { ar?: string; en?: string };
          total_orders?: number;
          total_revenue?: number;
        }[];
      }
    | undefined;

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      await _ReportApi.exportSalesByLocationReport(format, params);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch { return; } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !reportData) return <LoadingScreen />;

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
              <Iconify icon="solar:map-point-bold" className="text-primary" width={22} height={22} />
            </Box>
            <Box>
              <Typography variant="h6" className="font-semibold">Sales by Location</Typography>
              <Typography variant="caption" className="text-muted-foreground">Revenue by governorate and city</Typography>
            </Box>
          </Box>
          <Box className="flex flex-wrap items-center gap-2">
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
            <Button variant="outlined" size="small" onClick={() => refetch()}>
              Apply
            </Button>
            <Box className="h-5 w-px bg-border/60" />
            <Button variant="outlined" size="small" onClick={() => handleExport('excel')} disabled={isExporting}>
              <Iconify icon="solar:file-spreadsheet-bold" width={18} className="mr-1" />
              Excel
            </Button>
            <Button variant="outlined" size="small" onClick={() => handleExport('pdf')} disabled={isExporting}>
              <Iconify icon="solar:file-text-bold" width={18} className="mr-1" />
              PDF
            </Button>
          </Box>
        </div>

        <div className="w-full space-y-4 transition-opacity duration-500 p-6">
          {reportData ? (
            <Box className="space-y-4">
              {(reportData.by_governorate?.length ?? 0) > 0 && (
                <Box className={tableContainerClass}>
                  <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                    <Typography variant="subtitle1" className="font-semibold text-foreground">
                      By Governorate
                    </Typography>
                  </Box>
                  <Box className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/20">
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">Governorate</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Orders</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(reportData.by_governorate ?? []).map((item, idx) => (
                          <tr key={idx} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-5 font-medium">{getDisplayName(item.governorate, lang)}</td>
                            <td className="text-right py-3 px-5">{Number(item.total_orders ?? 0).toLocaleString()}</td>
                            <td className="text-right py-3 px-5">
                              {Number(item.total_revenue ?? 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}

              {(reportData.by_city?.length ?? 0) > 0 && (
                <Box className={tableContainerClass}>
                  <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                    <Typography variant="subtitle1" className="font-semibold text-foreground">By City</Typography>
                  </Box>
                  <Box className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/20">
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">City</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Orders</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(reportData.by_city ?? []).map((item, idx) => (
                          <tr key={idx} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-5 font-medium">{getDisplayName(item.city, lang)}</td>
                            <td className="text-right py-3 px-5">{Number(item.total_orders ?? 0).toLocaleString()}</td>
                            <td className="text-right py-3 px-5">
                              {Number(item.total_revenue ?? 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}

              {(!reportData.by_governorate?.length && !reportData.by_city?.length) ? (
                <Box className={`${tableContainerClass} p-12 text-center`}>
                  <Typography variant="body2" className="text-muted-foreground">
                    No data found for the selected date range
                  </Typography>
                </Box>
              ) : null}
            </Box>
          ) : !isLoading ? (
            <Box className={`${tableContainerClass} p-12 text-center`}>
              <Typography variant="body2" className="text-muted-foreground">
                No report data available
              </Typography>
            </Box>
          ) : null}
        </div>
      </div>
    </>
  );
}
