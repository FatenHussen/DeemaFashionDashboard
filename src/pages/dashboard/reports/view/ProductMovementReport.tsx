import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useFetchProductMovementReport } from '../hooks/report';

// ----------------------------------------------------------------------

function getLocalizedName(
  item: { product_name?: { ar: string; en: string } | string; name?: { ar: string; en: string } | string },
  lang: string
) {
  const name = item.product_name || item.name;
  if (!name) return '-';
  if (typeof name === 'string') return name;
  return (lang === 'ar' ? name.ar : name.en) || name.en || name.ar || '-';
}

export default function ProductMovementReportPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('table');
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [appliedCategoryId, setAppliedCategoryId] = useState('');

  useEffect(() => {
    document.title = `${t('reports.browserProductMovement')} | ${CONFIG.appName}`;
  }, [t, i18n.language]);

  const params = {
    from_date: appliedFrom || undefined,
    to_date: appliedTo || undefined,
    category_id: appliedCategoryId ? Number(appliedCategoryId) : undefined,
  };
  const { data, isLoading } = useFetchProductMovementReport(params);

  const handleApply = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedCategoryId(categoryId);
  };
  const reportData = data?.data;

  if (isLoading && !reportData) return <LoadingScreen />;

  const tableContainerClass =
    'w-full border border-border/30 bg-background overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300';

  const productTableHead = (
    <tr className="border-b border-border/30 bg-muted/20">
      <th className="text-start py-3 px-5 font-medium text-muted-foreground">{t('reports.thProduct')}</th>
      <th className="text-end py-3 px-5 font-medium text-muted-foreground">{t('reports.thTotalSold')}</th>
      <th className="text-end py-3 px-5 font-medium text-muted-foreground">{t('reports.thRevenue')}</th>
    </tr>
  );

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
            <Iconify icon="solar:box-bold" className="text-primary" width={22} height={22} />
          </Box>
          <Box>
            <Typography variant="h6" className="font-semibold">
              {t('reports.productMovementTitle')}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {t('reports.productMovementSubtitle')}
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
          <input
            type="number"
            placeholder={t('form.categoryIdPlaceholder')}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-9 w-28 rounded-lg border border-input bg-background px-3 text-sm"
          />
          <Button variant="outlined" size="small" onClick={handleApply}>
            {t('reports.apply')}
          </Button>
        </Box>
      </div>

      <div className="w-full space-y-4 transition-opacity duration-500 p-6">
        {reportData && (
          <Box className="space-y-4">
            {reportData.top_selling && reportData.top_selling.length > 0 && (
              <Box className={tableContainerClass}>
                <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                  <Typography variant="subtitle1" className="font-semibold text-foreground">
                    {t('reports.topSelling')}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>{productTableHead}</thead>
                    <tbody>
                      {reportData.top_selling.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-5 font-medium">{getLocalizedName(item, lang)}</td>
                          <td className="text-end py-3 px-5">{item.total_sold ?? '-'}</td>
                          <td className="text-end py-3 px-5">
                            {item.total_revenue != null ? Number(item.total_revenue).toFixed(2) : '-'}
                          </td>
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
                  <Typography variant="subtitle1" className="font-semibold text-foreground">
                    {t('reports.leastSelling')}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>{productTableHead}</thead>
                    <tbody>
                      {reportData.least_selling.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-5 font-medium">{getLocalizedName(item, lang)}</td>
                          <td className="text-end py-3 px-5">{item.total_sold ?? '-'}</td>
                          <td className="text-end py-3 px-5">
                            {item.total_revenue != null ? Number(item.total_revenue).toFixed(2) : '-'}
                          </td>
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
                  <Typography variant="subtitle1" className="font-semibold text-foreground">
                    {t('reports.inactiveProducts')}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="text-start py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thProduct')}
                        </th>
                        <th className="text-start py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thSku')}
                        </th>
                        <th className="text-start py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thCategory')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.inactive_products.map((item, idx) => {
                        const cat = item.category;
                        const catName = !cat
                          ? '-'
                          : typeof cat === 'string'
                            ? cat
                            : (lang === 'ar' ? cat.ar : cat.en) || cat.en || cat.ar || '-';
                        return (
                          <tr
                            key={item.id ?? item.product_id ?? idx}
                            className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                          >
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

            {!reportData.top_selling?.length &&
              !reportData.least_selling?.length &&
              !reportData.inactive_products?.length && (
                <Box className={`${tableContainerClass} p-12 text-center`}>
                  <Typography variant="body2" className="text-muted-foreground">
                    {t('reports.noDataFilters')}
                  </Typography>
                </Box>
              )}
          </Box>
        )}
      </div>
    </div>
  );
}
