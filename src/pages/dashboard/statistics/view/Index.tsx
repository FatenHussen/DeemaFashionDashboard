import type { DateFilter } from '../api/statistics.services';

import { useMemo, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Box, Input, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';
import { useLocalizationStore } from '@/store/useLocalizationStore';
import {
  Pie,
  Bar,
  Cell,
  Area,
  Line,
  XAxis,
  YAxis,
  Radar,
  Legend,
  Tooltip,
  PieChart,
  BarChart,
  AreaChart,
  LineChart,
  PolarGrid,
  RadarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

import { CONFIG } from 'src/global-config';

import {
  useFetchUserGrowth,
  useFetchOrdersByDay,
  useFetchOrderFunnel,
  useFetchStockLevels,
  useFetchRevenueTrend,
  useFetchOrdersByHour,
  useFetchSalesHeatmap,
  useFetchTopCategories,
  useFetchOrdersByStatus,
  useFetchDriverComparison,
  useFetchAvgOrderValueTrend,
  useFetchDashboardStatistics,
} from '../hooks/statistics';

// ----------------------------------------------------------------------

const metadata = { title: `Statistics | Dashboard - ${CONFIG.appName}` };

const CHART_COLORS = [
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#F44336',
  '#00BCD4',
  '#795548',
  '#607D8B',
];

export default function StatisticsPage() {
  const { i18n, t } = useTranslation('table');
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const { direction } = useLocalizationStore();
  const isRtl = direction === 'rtl';
  const currentYear = new Date().getFullYear();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedFilter, setAppliedFilter] = useState<DateFilter | undefined>(undefined);

  const handleApply = () => {
    if (dateFrom || dateTo) {
      setAppliedFilter({
        ...(dateFrom ? { date_from: dateFrom } : {}),
        ...(dateTo ? { date_to: dateTo } : {}),
      });
    } else {
      setAppliedFilter(undefined);
    }
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setAppliedFilter(undefined);
  };

  const { data: dashboardData, isLoading: isLoadingDashboard } =
    useFetchDashboardStatistics(currentYear, appliedFilter);
  const { data: revenueTrendData } = useFetchRevenueTrend(30, appliedFilter);
  const { data: ordersByStatusData } = useFetchOrdersByStatus(appliedFilter);
  const { data: topCategoriesData } = useFetchTopCategories(8, appliedFilter);
  const { data: ordersByHourData } = useFetchOrdersByHour(appliedFilter);
  const { data: ordersByDayData } = useFetchOrdersByDay(appliedFilter);
  const { data: userGrowthData } = useFetchUserGrowth(12, appliedFilter);
  const { data: orderFunnelData } = useFetchOrderFunnel(appliedFilter);
  const { data: avgOrderValueData } = useFetchAvgOrderValueTrend(6, appliedFilter);
  const { data: driverComparisonData } = useFetchDriverComparison(5, appliedFilter);
  const { data: stockLevelsData } = useFetchStockLevels(appliedFilter);
  const { data: salesHeatmapData } = useFetchSalesHeatmap(appliedFilter);

  const counts = dashboardData?.data?.counts;
  const topShops = dashboardData?.data?.top_shops ?? [];
  const ordersByStatus = ordersByStatusData?.data ?? {};

  const revenueChartData = useMemo(() => {
    const raw = revenueTrendData?.data?.data ?? [];
    return raw.map((d) => ({
      date: d.date,
      label: d.day_name,
      revenue: d.revenue,
      orders: d.orders,
    }));
  }, [revenueTrendData]);

  const ordersPieData = useMemo(() => Object.entries(ordersByStatus)
      .filter(([, v]) => (v as number) > 0)
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: value as number,
      })), [ordersByStatus]);

  const categoriesPieData = useMemo(() => {
    const raw = topCategoriesData?.data?.data ?? [];
    return raw.map((d) => ({
      name: (d.category_name?.[lang as 'ar' | 'en'] ?? d.category_name?.en ?? '') || 'N/A',
      value: d.revenue,
    }));
  }, [topCategoriesData, lang]);

  const ordersByHourChartData = useMemo(
    () => ordersByHourData?.data?.data ?? [],
    [ordersByHourData]
  );
  const ordersByDayChartData = useMemo(
    () => ordersByDayData?.data?.data ?? [],
    [ordersByDayData]
  );
  const userGrowthChartData = useMemo(
    () => userGrowthData?.data?.data ?? [],
    [userGrowthData]
  );
  const orderFunnelChartData = useMemo(
    () => orderFunnelData?.data?.data ?? [],
    [orderFunnelData]
  );
  const avgOrderValueChartData = useMemo(
    () => avgOrderValueData?.data?.data ?? [],
    [avgOrderValueData]
  );
  const driverComparisonChartData = useMemo(() => {
    const raw = driverComparisonData?.data?.data ?? [];
    const maxOrders = Math.max(...raw.map((d) => d.total_orders), 1);
    const maxTime = Math.max(...raw.map((d) => d.avg_delivery_time), 1);
    const driverKeys = raw.map((_, i) => `d${i}`);
    return [
      {
        subject: 'Orders',
        ...Object.fromEntries(raw.map((d, i) => [`d${i}`, (d.total_orders / maxOrders) * 100])),
        fullMark: 100,
      },
      {
        subject: 'Rating',
        ...Object.fromEntries(raw.map((d, i) => [`d${i}`, (d.average_rating / 5) * 100])),
        fullMark: 100,
      },
      {
        subject: 'Delivery',
        ...Object.fromEntries(raw.map((d, i) => [`d${i}`, Math.max(0, 100 - (d.avg_delivery_time / maxTime) * 100)])),
        fullMark: 100,
      },
    ];
  }, [driverComparisonData]);

  const driverComparisonNames = useMemo(
    () => (driverComparisonData?.data?.data ?? []).map((d) => d.driver_name),
    [driverComparisonData]
  );
  const stockLevelsChartData = useMemo(
    () => stockLevelsData?.data?.data ?? [],
    [stockLevelsData]
  );
  const salesHeatmapChartData = useMemo(
    () => salesHeatmapData?.data?.data ?? [],
    [salesHeatmapData]
  );

  if (isLoadingDashboard) return <LoadingScreen />;

  const tableContainerClass =
    'w-full border border-border/30 bg-background overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300';

  return (
    <>
      <title>{metadata.title}</title>
      <div className="flex w-full flex-col">
        {/* Header - same style as table toolbar area */}
        <div className="mx-6 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/60 px-4 py-3 shadow-sm">
          <Box className="flex items-center gap-3">
            <Box className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Iconify icon="solar:chart-2-bold" className="text-primary" width={22} height={22} />
            </Box>
            <Box>
              <Typography variant="h6" className="font-semibold">
                {t('statistics.title')}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                {t('statistics.subtitle')}
              </Typography>
            </Box>
          </Box>

          <Box className="flex flex-wrap items-center gap-2">
            <Box className="flex items-center gap-1.5">
              <Typography variant="caption" className="text-muted-foreground font-medium whitespace-nowrap">
                {t('statistics.from')}
              </Typography>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 w-[150px] text-sm"
              />
            </Box>
            <Box className="flex items-center gap-1.5">
              <Typography variant="caption" className="text-muted-foreground font-medium whitespace-nowrap">
                {t('statistics.to')}
              </Typography>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 w-[150px] text-sm"
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={!dateFrom && !dateTo}
              className="h-9 px-4 text-sm gap-1.5"
            >
              <Iconify icon="solar:filter-bold" width={16} />
              {t('statistics.apply')}
            </Button>
            {appliedFilter && (
              <Button
                variant="outlined"
                onClick={handleReset}
                className="h-9 px-3 text-sm gap-1.5"
              >
                <Iconify icon="solar:restart-bold" width={16} />
                {t('statistics.reset')}
              </Button>
            )}
          </Box>
        </div>

        <div className="w-full space-y-4 transition-opacity duration-500 p-6">
          {/* Stat Cards - same container as table */}
          <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: t('statistics.totalUsers'),
                value: counts?.total_users ?? 0,
                sub: t('statistics.activeCount', { count: counts?.active_users ?? 0 }),
                icon: 'solar:users-group-rounded-bold',
                color: 'text-primary',
              },
              {
                label: t('statistics.totalOrders'),
                value: counts?.total_orders ?? 0,
                sub: t('statistics.completedCount', { count: counts?.completed_orders ?? 0 }),
                icon: 'solar:cart-large-2-bold',
                color: 'text-blue-600',
              },
              {
                label: t('statistics.products'),
                value: counts?.total_products ?? 0,
                sub: t('statistics.activeCount', { count: counts?.active_products ?? 0 }),
                icon: 'solar:box-bold',
                color: 'text-green-600',
              },
              {
                label: t('statistics.shopsAndVendors'),
                value: (counts?.total_shops ?? 0) + (counts?.total_vendors ?? 0),
                sub: t('statistics.shopsVendorsCount', { shops: counts?.active_shops ?? 0, vendors: counts?.total_vendors ?? 0 }),
                icon: 'solar:shop-2-bold',
                color: 'text-amber-600',
              },
            ].map(({ label, value, sub, icon, color }) => (
              <Box
                key={label}
                className={`${tableContainerClass} p-4`}
              >
                <Box className="flex items-center justify-between mb-2">
                  <Typography variant="caption" className="text-muted-foreground font-medium">
                    {label}
                  </Typography>
                  <Iconify icon={icon} className="text-muted-foreground/50" width={20} height={20} />
                </Box>
                <Typography variant="h4" className={`font-bold ${color}`}>
                  {value}
                </Typography>
                {sub && (
                  <Typography variant="caption" className="text-muted-foreground/80 text-xs mt-1 block">
                    {sub}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          {/* Revenue Trend - same container as table */}
          {revenueChartData.length > 0 && (
            <Box className={`${tableContainerClass} p-5`}>
              <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                {t('statistics.revenueTrend')}
              </Typography>
              <Box className="h-[280px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--card-foreground))',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '12px' }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name={t('statistics.revenueLabel')}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      name={t('statistics.ordersLabel')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* Charts Row - same container as table */}
          <Box className="grid gap-4 lg:grid-cols-2">
            {ordersPieData.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                  {t('statistics.ordersByStatus')}
                </Typography>
                <Box className="h-[260px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {ordersPieData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--card))',
                          color: 'hsl(var(--card-foreground))',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}

            {categoriesPieData.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                  {t('statistics.topCategoriesByRevenue')}
                </Typography>
                <Box className="h-[260px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoriesPieData} layout="vertical" margin={{ left: 90 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--card))',
                          color: 'hsl(var(--card-foreground))',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar dataKey="value" fill="#10b981" name={t('statistics.revenueLabel')} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </Box>

          {/* Top Shops - same container as table */}
          {topShops.length > 0 && (
            <Box className={tableContainerClass}>
              <Box className="border-b border-border/30 bg-muted/30 px-5 py-4">
                <Typography variant="subtitle1" className="font-semibold text-foreground">
                  {t('statistics.topShops')}
                </Typography>
              </Box>
              <Box className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/20">
                      <th className="text-start py-3 px-5 font-medium text-muted-foreground">{t('statistics.shopColumn')}</th>
                      <th className="text-end py-3 px-5 font-medium text-muted-foreground">{t('statistics.ordersColumn')}</th>
                      <th className="text-end py-3 px-5 font-medium text-muted-foreground">{t('statistics.ratingColumn')}</th>
                      <th className="text-center py-3 px-5 font-medium text-muted-foreground">{t('statistics.statusColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topShops.map((shop) => (
                      <tr key={shop.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-5 font-medium">
                          {shop.name?.[lang as 'ar' | 'en'] ?? shop.name?.en ?? '-'}
                        </td>
                        <td className="text-end py-3 px-5">{shop.total_orders}</td>
                        <td className="text-end py-3 px-5">{shop.average_rating?.toFixed(1) ?? '-'}</td>
                        <td className="text-center py-3 px-5">
                          {shop.is_active ? (
                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                              {t('active')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              {t('inactive')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          )}

          {/* Orders by Hour & Orders by Day */}
          <Box className="grid gap-4 lg:grid-cols-2">
            {ordersByHourChartData.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                  {t('statistics.ordersByHour')}
                </Typography>
                <Box className="h-[260px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByHourChartData} layout="vertical" margin={{ left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="hour" type="category" width={45} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#2196F3" name={t('statistics.ordersLabel')} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
            {ordersByDayChartData.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                  {t('statistics.ordersByDayOfWeek')}
                </Typography>
                <Box className="h-[260px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByDayChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#9C27B0" name={t('statistics.ordersLabel')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </Box>

          {/* User Growth */}
          <Box className="grid gap-4 lg:grid-cols-1">
            {userGrowthChartData.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                  {t('statistics.userGrowth')}
                </Typography>
                <Box className="h-[260px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Area type="monotone" dataKey="new_users" stroke="#FF9800" fill="#FF9800" fillOpacity={0.3} strokeWidth={2} name={t('statistics.newUsersLabel')} />
                      <Area type="monotone" dataKey="total_users" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.2} strokeWidth={2} name={t('statistics.totalUsersLabel')} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </Box>

          {/* Order Funnel & Avg Order Value Trend */}
          <Box className="grid gap-4 lg:grid-cols-2">
            {orderFunnelChartData.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                  {t('statistics.orderStatusFunnel')}
                </Typography>
                <Box className="h-[260px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderFunnelChartData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="stage" type="category" width={75} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#00BCD4" name={t('statistics.ordersLabel')} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
            {avgOrderValueChartData.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                  {t('statistics.avgOrderValueTrend')}
                </Typography>
                <Box className="h-[260px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={avgOrderValueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="average_order_value" stroke="#F44336" strokeWidth={2} dot={{ r: 4 }} name={t('statistics.avgOrderValueLabel')} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </Box>

          {/* Driver Comparison (Radar) & Stock Levels */}
          <Box className="grid gap-4 lg:grid-cols-2">
            {driverComparisonChartData.length > 0 && driverComparisonNames.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                  {t('statistics.driverPerformance')}
                </Typography>
                <Box className="h-[280px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={driverComparisonChartData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} tick={{ fontSize: 10 }} />
                      {driverComparisonNames.map((name, idx) => (
                        <Radar
                          key={idx}
                          name={name}
                          dataKey={`d${idx}`}
                          stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
            {stockLevelsChartData.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                  {t('statistics.productStockLevels')}
                </Typography>
                <Box className="grid grid-cols-3 gap-4">
                  {stockLevelsChartData.map((item, idx) => {
                    const colorClasses =
                      item.color === 'green'
                        ? 'border-green-500/50 bg-green-500/10'
                        : item.color === 'orange'
                          ? 'border-orange-500/50 bg-orange-500/10'
                          : 'border-red-500/50 bg-red-500/10';
                    return (
                      <Box
                        key={idx}
                        className={`rounded-xl border p-4 text-center ${colorClasses}`}
                      >
                        <Typography variant="h4" className="font-bold">
                          {item.value}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground block">
                          {item.label}
                        </Typography>
                        <Typography variant="caption" className="font-medium">
                          {item.percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          {/* Sales Heatmap */}
          {salesHeatmapChartData.length > 0 && (
            <Box className={`${tableContainerClass} p-5`}>
              <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                {t('statistics.salesHeatmap')}
              </Typography>
              <HeatmapGrid data={salesHeatmapChartData} />
            </Box>
          )}
        </div>
      </div>
    </>
  );
}

function HeatmapGrid({ data }: { data: { day: string; hour: string; value: number }[] }) {
  const days = useMemo(() => [...new Set(data.map((d) => d.day))], [data]);
  const hours = useMemo(() => [...new Set(data.map((d) => d.hour))].sort(), [data]);
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  const getValue = (day: string, hour: string) =>
    data.find((d) => d.day === day && d.hour === hour)?.value ?? 0;

  return (
    <Box className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-1 text-muted-foreground font-medium w-12" />
            {hours.map((h) => (
              <th key={h} className="p-1 text-muted-foreground font-medium text-center min-w-[28px]">
                {h.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <td className="p-1 font-medium text-muted-foreground">{day}</td>
              {hours.map((hour) => {
                const v = getValue(day, hour);
                const opacity = maxVal > 0 ? v / maxVal : 0;
                return (
                  <td key={`${day}-${hour}`} className="p-0.5">
                    <Box
                      className="min-w-[24px] h-6 rounded flex items-center justify-center text-[10px] font-medium"
                      style={{
                        backgroundColor: `hsl(217 91% 60% / ${0.2 + opacity * 0.8})`,
                        color: opacity > 0.5 ? 'white' : 'hsl(var(--foreground))',
                      }}
                      title={`${day} ${hour}: ${v}`}
                    >
                      {v > 0 ? v : ''}
                    </Box>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
