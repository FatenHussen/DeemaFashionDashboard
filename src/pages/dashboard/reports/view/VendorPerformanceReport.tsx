import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';
import { Box, Button, Typography, DatePickerField } from '@/shared/ui';
import { useFetchVendors } from '@/pages/dashboard/vendor/hooks/vendor';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { _ReportApi } from '../api/report.services';
import { useFetchVendorPerformanceReport } from '../hooks/report';
import { ReportPeriodBanner } from '../components/report-period-banner';
import { ReportExportButtons } from '../components/report-export-buttons';

// ----------------------------------------------------------------------

export default function VendorPerformanceReportPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('table');
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';

  const [vendorId, setVendorId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedVendorId, setAppliedVendorId] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  useEffect(() => {
    document.title = `${t('reports.browserVendor')} | ${CONFIG.appName}`;
  }, [t, i18n.language]);

  const { data: vendorsData } = useFetchVendors(1, 200);
  const vendors = vendorsData?.data?.items ?? [];

  const params = {
    from_date: appliedFrom || undefined,
    to_date: appliedTo || undefined,
  };

  const { data, isLoading } = useFetchVendorPerformanceReport(appliedVendorId, params, !!appliedVendorId);

  const handleApply = () => {
    setAppliedVendorId(vendorId);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const reportData = data?.data;

  const kpiItems = useMemo(
    () =>
      reportData && appliedVendorId
        ? [
            {
              label: t('reports.vendorKpiTotalSales'),
              value:
                reportData.total_sales != null
                  ? Number(reportData.total_sales).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })
                  : '-',
            },
            { label: t('reports.vendorKpiTotalOrders'), value: reportData.total_orders ?? '-' },
            {
              label: t('reports.vendorKpiAvgOrderValue'),
              value:
                reportData.average_order_value != null
                  ? Number(reportData.average_order_value).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })
                  : '-',
            },
            { label: t('reports.vendorKpiTotalShops'), value: reportData.total_shops ?? '-' },
            { label: t('reports.vendorKpiActiveShops'), value: reportData.active_shops ?? '-' },
            {
              label: t('reports.vendorKpiAverageRating'),
              value: reportData.average_rating != null ? Number(reportData.average_rating).toFixed(1) : '-',
            },
            { label: t('reports.vendorKpiTotalRatings'), value: reportData.total_ratings ?? '-' },
            {
              label: t('reports.vendorKpiCustomerSatisfaction'),
              value:
                reportData.customer_satisfaction != null
                  ? `${Number(reportData.customer_satisfaction).toFixed(1)}%`
                  : '-',
            },
          ]
        : [],
    [reportData, appliedVendorId, t, i18n.language]
  );

  if (isLoading && vendorId && !reportData) return <LoadingScreen />;

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

          <Box className="flex items-center gap-3">
            <Box className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Iconify icon="solar:shop-2-bold" className="text-primary" width={28} />
            </Box>

            <Box>
              <Typography variant="h6" className="font-semibold">
                {t('reports.vendorPerformanceTitle')}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                {t('reports.selectVendorAndDate')}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="flex flex-wrap items-center gap-2">
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="h-9 min-w-[200px] rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">{t('reports.selectVendorPlaceholder')}</option>
            {vendors.map((v) => {
              const name =
                typeof v.name === 'object'
                  ? (v.name?.[lang as 'ar' | 'en'] ??
                    (v.name as { en?: string })?.en ??
                    t('reports.vendorFallback', { id: v.id }))
                  : (v.name ?? t('reports.vendorFallback', { id: v.id }));

              return (
                <option key={v.id} value={v.id}>
                  {name}
                </option>
              );
            })}
          </select>

          <DatePickerField
            value={fromDate}
            onChange={setFromDate}
            className="h-9 min-w-[140px] rounded-lg border border-input bg-background px-3 text-sm w-auto max-sm:flex-1"
          />

          <DatePickerField
            value={toDate}
            onChange={setToDate}
            className="h-9 min-w-[140px] rounded-lg border border-input bg-background px-3 text-sm w-auto max-sm:flex-1"
          />

          <Button variant="outlined" size="small" onClick={handleApply} disabled={!vendorId}>
            {t('reports.apply')}
          </Button>
          <ReportExportButtons
            disabled={!appliedVendorId}
            onExport={(format) =>
              _ReportApi.exportVendorPerformanceReport(appliedVendorId, format, params)
            }
          />
        </Box>
      </div>

      <div className="w-full space-y-4 transition-opacity duration-500 p-6">
        <ReportPeriodBanner appliedFrom={appliedFrom} appliedTo={appliedTo} lang={lang} />
        {reportData && appliedVendorId && (
          <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpiItems.map(({ label, value }) => (
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

        {!appliedVendorId && (
          <Box className={`${tableContainerClass} p-12 text-center`}>
            <Typography variant="body2" className="text-muted-foreground">
              {t('reports.selectVendorPrompt')}
            </Typography>
          </Box>
        )}
      </div>
    </div>
  );
}
