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
import { useFetchSalesByCategoryReport } from '../hooks/report';

// ----------------------------------------------------------------------

const metadata = { title: `Sales by Category | Dashboard - ${CONFIG.appName}` };

function getLocalName(obj: string | { ar?: string; en?: string } | undefined, lang: string) {
  if (!obj) return '-';
  if (typeof obj === 'string') return obj;
  return (lang === 'ar' ? obj.ar : obj.en) || obj.en || obj.ar || '-';
}

export default function SalesByCategoryReportPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const params = {
    from_date: appliedFrom || undefined,
    to_date: appliedTo || undefined,
  };
  const { data, isLoading } = useFetchSalesByCategoryReport(params);

  const handleApply = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };
  const reportData = data?.data;

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      await _ReportApi.exportSalesByCategoryReport(format, params);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch { return; } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !reportData) return <LoadingScreen />;

  const categories = reportData?.by_category ?? [];
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
              <Iconify icon="solar:widget-5-bold" className="text-primary" width={22} height={22} />
            </Box>
            <Box>
              <Typography variant="h6" className="font-semibold">Sales by Category</Typography>
              <Typography variant="caption" className="text-muted-foreground">Revenue and quantity by product category</Typography>
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
            <Button variant="outlined" size="small" onClick={handleApply}>
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
          {reportData && (
            <>
              {categories.length > 0 ? (
                <Box className={tableContainerClass}>
                  <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                    <Typography variant="subtitle1" className="font-semibold text-foreground">By Category</Typography>
                  </Box>
                  <Box className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/20">
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">Category</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Quantity</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((item, idx) => (
                          <tr key={idx} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-5 font-medium">{getLocalName(item.category, lang)}</td>
                            <td className="text-right py-3 px-5">{item.total_quantity}</td>
                            <td className="text-right py-3 px-5">{item.total_revenue != null ? Number(item.total_revenue).toFixed(2) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              ) : (
                <Box className={`${tableContainerClass} p-12 text-center`}>
                  <Typography variant="body2" className="text-muted-foreground">
                    No data found for the selected date range
                  </Typography>
                </Box>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
