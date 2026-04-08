import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { Box, Button, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { _ReportApi } from '../api/report.services';
import { useFetchSalesReport } from '../hooks/report';
import { ReportExportButtons } from '../components/report-export-buttons';

// ----------------------------------------------------------------------

export default function SalesReportPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('table');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  useEffect(() => {
    document.title = `${t('reports.browserSales')} | ${CONFIG.appName}`;
  }, [t, i18n.language]);

  const params = {
    from_date: appliedFrom || undefined,
    to_date: appliedTo || undefined,
  };
  const { data, isLoading } = useFetchSalesReport(params);

  const handleApply = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };
  const reportData = data?.data;

  const kpiItems = useMemo(
    () =>
      reportData
        ? [
            { label: t('reports.kpiTotalOrders'), value: reportData.total_orders },
            {
              label: t('reports.kpiTotalRevenue'),
              value: reportData.total_revenue?.toFixed(2) ?? '0',
            },
            {
              label: t('reports.kpiDeliveryFees'),
              value: reportData.total_delivery_fees?.toFixed(2) ?? '0',
            },
            {
              label: t('reports.kpiTotalDiscounts'),
              value: reportData.total_discounts?.toFixed(2) ?? '0',
            },
            {
              label: t('reports.kpiAvgOrderValue'),
              value: reportData.average_order_value?.toFixed(2) ?? '0',
            },
          ]
        : [],
    [reportData, t, i18n.language]
  );

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
            <Iconify icon="solar:cart-large-2-bold" className="text-primary" width={22} height={22} />
          </Box>
          <Box>
            <Typography variant="h6" className="font-semibold">
              {t('reports.salesTitle')}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {t('reports.filterByDate')}
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
          <ReportExportButtons
            onExport={(format) => _ReportApi.exportSalesReport(format, params)}
          />
        </Box>
      </div>

      <div className="w-full space-y-4 transition-opacity duration-500 p-6">
        {reportData && (
          <>
            <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {kpiItems.map(({ label, value }) => (
                <Box key={label} className={`${tableContainerClass} p-4`}>
                  <Typography variant="caption" className="text-muted-foreground font-medium">
                    {label}
                  </Typography>
                  <Typography variant="h6" className="font-bold">
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>

            {reportData.orders && reportData.orders.length > 0 && (
              <Box className={tableContainerClass}>
                <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                  <Typography variant="subtitle1" className="font-semibold text-foreground">
                    {t('reports.ordersSection')}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="text-start py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thOrder')}
                        </th>
                        <th className="text-start py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thCustomer')}
                        </th>
                        <th className="text-end py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thTotal')}
                        </th>
                        <th className="text-end py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thDelivery')}
                        </th>
                        <th className="text-start py-3 px-5 font-medium text-muted-foreground">
                          {t('reports.thDeliveredAt')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.orders.map((order) => (
                        <tr
                          key={order.order_code}
                          className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-5 font-medium">{order.order_code}</td>
                          <td className="py-3 px-5">{order.user}</td>
                          <td className="text-end py-3 px-5">{order.total}</td>
                          <td className="text-end py-3 px-5">{order.delivery_price}</td>
                          <td className="py-3 px-5">
                            {order.delivered_at
                              ? dayjs(order.delivered_at).format('YYYY-MM-DD HH:mm')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            )}

            {(!reportData.orders || reportData.orders.length === 0) && (
              <Box className={`${tableContainerClass} p-12 text-center`}>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('reports.noOrdersRange')}
                </Typography>
              </Box>
            )}
          </>
        )}
      </div>
    </div>
  );
}
