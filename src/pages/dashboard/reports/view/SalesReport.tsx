import type { ExportFormat } from '../api/report.services';

import dayjs from 'dayjs';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Box, Button, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { _ReportApi } from '../api/report.services';
import { useFetchSalesReport } from '../hooks/report';

// ----------------------------------------------------------------------

const metadata = { title: `Sales Report | Dashboard - ${CONFIG.appName}` };

export default function SalesReportPage() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const params = {
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };
  const { data, isLoading, refetch } = useFetchSalesReport(params);
  const reportData = data?.data;

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      await _ReportApi.exportSalesReport(format, params);
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
            <Button
              variant="text"
              size="small"
              onClick={() => navigate(paths.dashboard.reports)}
              className="-ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Reports
            </Button>
            <Box className="h-5 w-px bg-border/60 hidden sm:block" />
            <Box className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Iconify icon="solar:cart-large-2-bold" className="text-primary" width={22} height={22} />
            </Box>
            <Box>
              <Typography variant="h6" className="font-semibold">
                Sales Report
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                Filter by date range
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
          {reportData && (
            <>
              <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: 'Total Orders', value: reportData.total_orders },
                  { label: 'Total Revenue', value: reportData.total_revenue?.toFixed(2) ?? '0' },
                  { label: 'Delivery Fees', value: reportData.total_delivery_fees?.toFixed(2) ?? '0' },
                  { label: 'Total Discounts', value: reportData.total_discounts?.toFixed(2) ?? '0' },
                  { label: 'Avg Order Value', value: reportData.average_order_value?.toFixed(2) ?? '0' },
                ].map(({ label, value }) => (
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
                      Orders
                    </Typography>
                  </Box>
                  <Box className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/20">
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">Order</th>
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">Customer</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Total</th>
                          <th className="text-right py-3 px-5 font-medium text-muted-foreground">Delivery</th>
                          <th className="text-left py-3 px-5 font-medium text-muted-foreground">Delivered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.orders.map((order) => (
                          <tr key={order.order_code} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-5 font-medium">{order.order_code}</td>
                            <td className="py-3 px-5">{order.user}</td>
                            <td className="text-right py-3 px-5">{order.total}</td>
                            <td className="text-right py-3 px-5">{order.delivery_price}</td>
                            <td className="py-3 px-5">
                              {order.delivered_at ? dayjs(order.delivered_at).format('YYYY-MM-DD HH:mm') : '-'}
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
                    No orders found for the selected date range
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
