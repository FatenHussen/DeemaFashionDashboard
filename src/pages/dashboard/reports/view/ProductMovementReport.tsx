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
import { useFetchProductMovementReport } from '../hooks/report';

// ----------------------------------------------------------------------

const metadata = { title: `Product Movement Report | Dashboard - ${CONFIG.appName}` };

function getLocalizedName(item: { product_name?: { ar: string; en: string }; name?: { ar: string; en: string } }, lang: string) {
  const name = item.product_name || item.name;
  if (!name) return '-';
  return (lang === 'ar' ? name.ar : name.en) || name.en || name.ar || '-';
}

export default function ProductMovementReportPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const params = {
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    category_id: categoryId ? Number(categoryId) : undefined,
  };
  const { data, isLoading } = useFetchProductMovementReport(params);
  const reportData = data?.data;

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      await _ReportApi.exportProductMovementReport(format, params);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch {} finally {
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
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Reports
            </Button>
            <Box className="h-5 w-px bg-border/60 hidden sm:block" />
            <Box className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Iconify icon="solar:box-bold" className="text-primary" width={22} height={22} />
            </Box>
            <Box>
              <Typography variant="h6" className="font-semibold">Product Movement Report</Typography>
              <Typography variant="caption" className="text-muted-foreground">Top/least selling and inactive products</Typography>
            </Box>
          </Box>
          <Box className="flex flex-wrap items-center gap-2">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm" />
            <input type="number" placeholder="Category ID" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-9 w-28 rounded-lg border border-input bg-background px-3 text-sm" />
            <Box className="h-5 w-px bg-border/60" />
            <Button variant="outlined" size="small" onClick={() => handleExport('excel')} disabled={isExporting}>
              <Iconify icon="solar:file-spreadsheet-bold" width={18} className="mr-1" /> Excel
            </Button>
            <Button variant="outlined" size="small" onClick={() => handleExport('pdf')} disabled={isExporting}>
              <Iconify icon="solar:file-text-bold" width={18} className="mr-1" /> PDF
            </Button>
          </Box>
        </div>

        <div className="w-full space-y-4 transition-opacity duration-500 p-6">
          {reportData && (
            <Box className="space-y-4">
              {reportData.top_selling && reportData.top_selling.length > 0 && (
                <Box className={tableContainerClass}>
                  <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                    <Typography variant="subtitle1" className="font-semibold text-foreground">Top Selling</Typography>
                  </Box>
                  <Box className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/20">
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">Product</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Total Sold</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.top_selling.map((item, idx) => (
                          <tr key={idx} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-5 font-medium">{getLocalizedName(item, lang)}</td>
                            <td className="text-right py-3 px-5">{item.total_sold ?? '-'}</td>
                            <td className="text-right py-3 px-5">{item.total_revenue?.toFixed(2) ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}

              {reportData.least_selling && reportData.least_selling.length > 0 && (
                <Box className={tableContainerClass}>
                  <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                    <Typography variant="subtitle1" className="font-semibold text-foreground">Least Selling</Typography>
                  </Box>
                  <Box className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/20">
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">Product</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Total Sold</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.least_selling.map((item, idx) => (
                          <tr key={idx} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-5 font-medium">{getLocalizedName(item, lang)}</td>
                            <td className="text-right py-3 px-5">{item.total_sold ?? '-'}</td>
                            <td className="text-right py-3 px-5">{item.total_revenue?.toFixed(2) ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}

              {reportData.inactive_products && reportData.inactive_products.length > 0 && (
                <Box className={tableContainerClass}>
                  <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                    <Typography variant="subtitle1" className="font-semibold text-foreground">Inactive Products</Typography>
                  </Box>
                  <Box className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/20">
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">Product</th>
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">SKU</th>
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.inactive_products.map((item, idx) => {
                          const cat = item.category;
                          const catName = cat ? (lang === 'ar' ? cat.ar : cat.en) || cat.en || cat.ar : '-';
                          return (
                            <tr key={item.id ?? item.product_id ?? idx} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                              <td className="py-3 px-5 font-medium">{getLocalizedName(item, lang)}</td>
                              <td className="py-3 px-5">{item.sku ?? '-'}</td>
                              <td className="py-3 px-5">{catName}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}

              {(!reportData.top_selling?.length &&
                !reportData.least_selling?.length &&
                !reportData.inactive_products?.length) && (
                <Box className={`${tableContainerClass} p-12 text-center`}>
                  <Typography variant="body2" className="text-muted-foreground">
                    No data found for the selected filters
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </div>
      </div>
    </>
  );
}
