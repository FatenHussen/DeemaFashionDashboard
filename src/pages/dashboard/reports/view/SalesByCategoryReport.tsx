import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useFetchSalesByCategoryReport } from '../hooks/report';

// ----------------------------------------------------------------------

function getLocalName(obj: string | { ar?: string; en?: string } | undefined, lang: string) {
  if (!obj) return '-';
  if (typeof obj === 'string') return obj;
  return (lang === 'ar' ? obj.ar : obj.en) || obj.en || obj.ar || '-';
}

export default function SalesByCategoryReportPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('table');
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  useEffect(() => {
    document.title = `${t('reports.browserSalesByCategory')} | ${CONFIG.appName}`;
  }, [t, i18n.language]);

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

  if (isLoading && !reportData) return <LoadingScreen />;

  const categories = reportData?.by_category ?? [];
  const tableContainerClass =
    'w-full border border-border/30 bg-background overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300';

  return (
    <div className="flex w-full flex-col">
      <div className="mx-6 mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/60 px-4 py-3 shadow-sm rtl:flex-row-reverse">
        <Box className="flex items-center gap-3">
          <Button
            variant="text"
            size="small"
            onClick={() => navigate(paths.dashboard.reports)}
            className="-ms-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="me-2 rtl:rotate-180" />
            {t('reports.back')}
          </Button>
          <Box className="h-5 w-px bg-border/60 hidden sm:block" />
          <Box className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Iconify icon="solar:widget-5-bold" className="text-primary" width={22} height={22} />
          </Box>
          <Box>
            <Typography variant="h6" className="font-semibold">
              {t('reports.salesByCategoryTitle')}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {t('reports.salesByCategorySubtitle')}
            </Typography>
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
            {t('reports.apply')}
          </Button>
        </Box>
      </div>

      <div className="w-full space-y-4 transition-opacity duration-500 p-6">
        {reportData && (
          <>
            {categories.length > 0 ? (
              <Box className={tableContainerClass}>
                <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                  <Typography variant="subtitle1" className="font-semibold text-foreground">
                    {t('reports.byCategory')}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="text-start py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thCategory')}
                        </th>
                        <th className="text-end py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thQuantity')}
                        </th>
                        <th className="text-end py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thRevenue')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-5 font-medium">{getLocalName(item.category, lang)}</td>
                          <td className="text-end py-3 px-5">{item.total_quantity}</td>
                          <td className="text-end py-3 px-5">
                            {item.total_revenue != null ? Number(item.total_revenue).toFixed(2) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            ) : (
              <Box className={`${tableContainerClass} p-12 text-center`}>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('reports.noDataRange')}
                </Typography>
              </Box>
            )}
          </>
        )}
      </div>
    </div>
  );
}
