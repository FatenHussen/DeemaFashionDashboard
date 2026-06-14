import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';
import { Box, Button, Typography, DatePickerField } from '@/shared/ui';
import { useFetchDrivers } from '@/pages/dashboard/driver/hooks/driver';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { _ReportApi } from '../api/report.services';
import { useFetchDriverPerformanceReport } from '../hooks/report';
import { ReportPeriodBanner } from '../components/report-period-banner';
import { ReportExportButtons } from '../components/report-export-buttons';

// ----------------------------------------------------------------------

export default function DriverPerformanceReportPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('table');
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const [driverId, setDriverId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedDriverId, setAppliedDriverId] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  useEffect(() => {
    document.title = `${t('reports.browserDriver')} | ${CONFIG.appName}`;
  }, [t, i18n.language]);

  const { data: driversData } = useFetchDrivers(1, 200);
  const drivers = driversData?.data?.items ?? [];

  const params = {
    from_date: appliedFrom || undefined,
    to_date: appliedTo || undefined,
  };
  const { data, isLoading } = useFetchDriverPerformanceReport(appliedDriverId, params, !!appliedDriverId);

  const handleApply = () => {
    setAppliedDriverId(driverId);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };
  const reportData = data?.data;

  const kpiItems = useMemo(
    () =>
      reportData && appliedDriverId
        ? [
            { label: t('reports.driverKpiTotalOrders'), value: reportData.total_orders },
            {
              label: t('reports.driverKpiTotalEarnings'),
              value: reportData.total_earnings?.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              }),
            },
            {
              label: t('reports.driverKpiAvgDeliveryTime'),
              value: reportData.average_delivery_time_minutes?.toFixed(1),
            },
            { label: t('reports.driverKpiAverageRating'), value: reportData.average_rating?.toFixed(1) },
            { label: t('reports.driverKpiTotalRatings'), value: reportData.total_ratings },
            { label: t('reports.driverKpiTotalComplaints'), value: reportData.total_complaints },
          ]
        : [],
    [reportData, appliedDriverId, t, i18n.language]
  );

  if (isLoading && appliedDriverId && !reportData) return <LoadingScreen />;

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
            <Iconify icon="solar:delivery-bold" className="text-primary" width={22} height={22} />
          </Box>
          <Box>
            <Typography variant="h6" className="font-semibold">
              {t('reports.driverPerformanceTitle')}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {t('reports.selectDriverAndDate')}
            </Typography>
          </Box>
        </Box>
        <Box className="flex flex-wrap items-center gap-2">
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="h-9 min-w-[200px] rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">{t('reports.selectDriverPlaceholder')}</option>
            {drivers.map((d) => {
              const dAny = d as { name?: string | { ar?: string; en?: string }; user?: { name?: string } };
              const name =
                typeof dAny.name === 'object'
                  ? (dAny.name?.[lang as 'ar' | 'en'] ?? dAny.name?.en)
                  : dAny.name;
              return (
                <option key={d.id} value={d.id}>
                  {name ?? dAny.user?.name ?? d.phone ?? t('reports.driverFallback', { id: d.id })}
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
          <Button variant="outlined" size="small" onClick={handleApply} disabled={!driverId}>
            {t('reports.apply')}
          </Button>
          <ReportExportButtons
            disabled={!appliedDriverId}
            onExport={(format) =>
              _ReportApi.exportDriverPerformanceReport(appliedDriverId, format, params)
            }
          />
        </Box>
      </div>

      <div className="w-full space-y-4 transition-opacity duration-500 p-6">
        <ReportPeriodBanner appliedFrom={appliedFrom} appliedTo={appliedTo} lang={lang} />
        {reportData && appliedDriverId && (
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

        {!appliedDriverId && (
          <Box className={`${tableContainerClass} p-12 text-center`}>
            <Typography variant="body2" className="text-muted-foreground">
              {t('reports.selectDriverPrompt')}
            </Typography>
          </Box>
        )}
      </div>
    </div>
  );
}
