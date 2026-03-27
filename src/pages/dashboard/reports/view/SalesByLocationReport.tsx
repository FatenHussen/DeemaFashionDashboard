import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useFetchSalesByLocationReport } from '../hooks/report';

// ----------------------------------------------------------------------

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
  const { t, i18n } = useTranslation('table');
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  useEffect(() => {
    document.title = `${t('reports.browserSalesByLocation')} | ${CONFIG.appName}`;
  }, [t, i18n.language]);

  const params = {
    from_date: appliedFrom || undefined,
    to_date: appliedTo || undefined,
  };
  const { data, isLoading } = useFetchSalesByLocationReport(params);

  const handleApply = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };
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

  if (isLoading && !reportData) return <LoadingScreen />;

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
            <Iconify icon="solar:map-point-bold" className="text-primary" width={22} height={22} />
          </Box>
          <Box>
            <Typography variant="h6" className="font-semibold">
              {t('reports.salesByLocationTitle')}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {t('reports.salesByLocationSubtitle')}
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
        {reportData ? (
          <Box className="space-y-4">
            {(reportData.by_governorate?.length ?? 0) > 0 && (
              <Box className={tableContainerClass}>
                <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                  <Typography variant="subtitle1" className="font-semibold text-foreground">
                    {t('reports.byGovernorate')}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="text-start py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thGovernorate')}
                        </th>
                        <th className="text-end py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thOrders')}
                        </th>
                        <th className="text-end py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thRevenue')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.by_governorate ?? []).map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-5 font-medium">{getDisplayName(item.governorate, lang)}</td>
                          <td className="text-end py-3 px-5">{Number(item.total_orders ?? 0).toLocaleString()}</td>
                          <td className="text-end py-3 px-5">
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
                  <Typography variant="subtitle1" className="font-semibold text-foreground">
                    {t('reports.byCity')}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="text-start py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thCity')}
                        </th>
                        <th className="text-end py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thOrders')}
                        </th>
                        <th className="text-end py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thRevenue')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.by_city ?? []).map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-5 font-medium">{getDisplayName(item.city, lang)}</td>
                          <td className="text-end py-3 px-5">{Number(item.total_orders ?? 0).toLocaleString()}</td>
                          <td className="text-end py-3 px-5">
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

            {!reportData.by_governorate?.length && !reportData.by_city?.length ? (
              <Box className={`${tableContainerClass} p-12 text-center`}>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('reports.noDataRange')}
                </Typography>
              </Box>
            ) : null}
          </Box>
        ) : !isLoading ? (
          <Box className={`${tableContainerClass} p-12 text-center`}>
            <Typography variant="body2" className="text-muted-foreground">
              {t('reports.noReportData')}
            </Typography>
          </Box>
        ) : null}
      </div>
    </div>
  );
}
