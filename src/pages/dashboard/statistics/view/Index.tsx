import type { TFunction } from 'i18next';
import type { DateFilter } from '../api/statistics.services';
import type { DriverComparisonPoint } from '../types/statistics.types';

import dayjs from 'dayjs';
import { m } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Box, Input, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { LoadingScreen } from '@/shared/components/loading-screen';
import { useMemo, useState, type ReactNode, type CSSProperties } from 'react';
import {
  Pie,
  Bar,
  Cell,
  Area,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  PieChart,
  BarChart,
  AreaChart,
  LineChart,
  LabelList,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

import { CONFIG } from 'src/global-config';
import { themeConfig } from 'src/theme/theme-config';

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

/** Cohesive palette: distinct, accessible, works on light/dark cards */
const CHART_COLORS = [
  '#0d9488',
  '#2563eb',
  '#ea580c',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
  '#64748b',
  '#16a34a',
];

/** Brand primary ramp for gauge arc slices (matches `themeConfig.palette.primary`) */
const GAUGE_PRIMARY = themeConfig.palette.primary;
const GAUGE_ARC_GRADIENT_PAIRS: [string, string][] = [
  [GAUGE_PRIMARY.lighter, GAUGE_PRIMARY.light],
  [GAUGE_PRIMARY.light, GAUGE_PRIMARY.main],
  [GAUGE_PRIMARY.main, GAUGE_PRIMARY.dark],
  [GAUGE_PRIMARY.dark, GAUGE_PRIMARY.darker],
  [GAUGE_PRIMARY.main, GAUGE_PRIMARY.light],
  [GAUGE_PRIMARY.light, GAUGE_PRIMARY.main],
  [GAUGE_PRIMARY.lighter, GAUGE_PRIMARY.main],
];

const CHART_ANIM = {
  isAnimationActive: true,
  animationDuration: 1000,
  animationBegin: 80,
  animationEasing: 'ease-out' as const,
};

/** Extra top room for `LabelList` on area charts */
const CHART_MARGIN_WITH_TOP_LABELS = { top: 22, right: 8, left: 0, bottom: 4 };

function formatAxisTick(n: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 10_000) return `${(v / 1_000).toFixed(1)}k`;
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
}

/** Integer ticks for order counts — avoids duplicate tick labels when Recharts uses fractional steps. */
function buildIntegerYTicks(max: number, maxSteps = 6): number[] {
  const maxVal = Math.max(0, Math.ceil(Number(max)));
  if (maxVal === 0) return [0];
  if (maxVal <= maxSteps) return Array.from({ length: maxVal + 1 }, (_, i) => i);
  const step = Math.max(1, Math.ceil(maxVal / (maxSteps - 1)));
  const ticks: number[] = [0];
  for (let v = step; v < maxVal; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] !== maxVal) ticks.push(maxVal);
  return ticks;
}

/** Short labels above columns (matches stylized “bubble” values). */
function formatColumnTopLabel(n: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  return formatAxisTick(v);
}


const CHART_GLASS_INNER =
  'relative overflow-hidden rounded-2xl border border-primary/[0.12] bg-gradient-to-br from-primary/[0.05] via-card/95 to-primary/[0.03] p-1 shadow-[inset_0_1px_0_0_rgb(var(--primary)/0.08)]';

/** Cream header strip + icon row — matches “Top shops” widget chrome */
function FulfillmentWidgetHeader({
  icon,
  title,
  badge,
}: {
  icon: string;
  title: string;
  badge?: ReactNode;
}) {
  return (
    <div className="relative z-[1] flex shrink-0 items-center justify-between gap-2 border-b border-primary/10 bg-surface-warm/70 px-4 py-3 dark:bg-primary/[0.06]">
      <div className="flex min-w-0 items-center gap-2.5">
        <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25 shadow-sm">
          <Iconify icon={icon} className="text-primary" width={20} />
        </Box>
        <Typography variant="subtitle2" className="font-semibold text-foreground">
          {title}
        </Typography>
      </div>
      {badge != null ? <div className="shrink-0">{badge}</div> : null}
    </div>
  );
}

function FulfillmentHeaderBadge({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="caption"
      className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary"
    >
      {children}
    </Typography>
  );
}

function UserGrowthGlowActiveDot(props: { cx?: number; cy?: number }) {
  const cx = props.cx ?? 0;
  const cy = props.cy ?? 0;
  return (
    <g>
      <circle cx={cx} cy={cy} r={16} fill="#ec4899" fillOpacity={0.22} />
      <circle cx={cx} cy={cy} r={7} fill="#ec4899" stroke="#ffffff" strokeWidth={2} />
    </g>
  );
}

type OrdersByDayRow = { day: string; count: number };

/** Dark “equity gauge” style card: semi-circular arc + weekly total + peak pill + min/max footer */
function OrdersByDayGaugeCard({
  data,
  t,
  peakVsAvg,
  className,
}: {
  data: OrdersByDayRow[];
  t: TFunction;
  peakVsAvg: { peakPct: number; peakDay: string; peakCount: number; avg: number };
  className?: string;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const maxC = Math.max(...data.map((d) => d.count), 0);
  const minC = Math.min(...data.map((d) => d.count), maxC);
  const minRow = data.find((d) => d.count === minC);
  const maxRow = data.find((d) => d.count === maxC);
  const pieData = data.map((d, i) => ({
    name: d.day.length > 10 ? `${d.day.slice(0, 9)}…` : d.day,
    value: Math.max(d.count, 0),
    fullName: d.day,
    gradId: `dayArc-${i}`,
  }));

  const peakShort =
    peakVsAvg.peakDay.length > 14 ? `${peakVsAvg.peakDay.slice(0, 13)}…` : peakVsAvg.peakDay;

  return (
    <m.div
      className={[
        'flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] bg-card p-6 text-card-foreground shadow-[var(--shadow-lg)] ring-1 ring-border/60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      dir="ltr"
    >
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <Typography variant="h3" className="text-3xl font-bold tracking-tight text-foreground">
            {total.toLocaleString()}
          </Typography>
          <Typography
            variant="overline"
            className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            {t('statistics.ordersDayGaugeWeekly')}
          </Typography>
        </div>
        <Iconify icon="solar:history-bold" className="mt-1 shrink-0 text-muted-foreground/70" width={22} />
      </div>

      <div className="mx-auto mt-1 flex min-h-0 w-full max-w-[340px] flex-1 flex-col">
        <div className="relative min-h-[200px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
              <defs>
                {pieData.map((row, i) => {
                  const [t0, t1] = GAUGE_ARC_GRADIENT_PAIRS[i % GAUGE_ARC_GRADIENT_PAIRS.length];
                  return (
                    <linearGradient key={row.gradId} id={row.gradId} x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor={t0} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={t1} stopOpacity={1} />
                    </linearGradient>
                  );
                })}
              </defs>
              <Pie
                data={[{ name: 'track', value: 1 }]}
                dataKey="value"
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius="56%"
                outerRadius="92%"
                fill="rgb(var(--primary) / 0.12)"
                stroke="none"
                isAnimationActive={false}
              />
              <Pie
                {...CHART_ANIM}
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius="58%"
                outerRadius="90%"
                paddingAngle={1.8}
                cornerRadius={5}
                stroke="rgb(var(--card))"
                strokeWidth={2}
              >
                {pieData.map((entry, i) => (
                  <Cell key={entry.fullName} fill={`url(#${entry.gradId})`} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(v, name, props) => {
                  const p = props as { payload?: { fullName?: string } };
                  const label = p?.payload?.fullName ?? String(name);
                  return formatTooltipPair(v, label);
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 shrink-0 rounded-xl border border-border bg-muted/50 px-4 py-3 text-center shadow-sm backdrop-blur-[2px]">
          <span className="inline-block rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-[var(--shadow-primary-sm)]">
            {t('statistics.ordersDayGaugePeakPill')}
          </span>
          <Typography variant="subtitle1" className="mt-2 line-clamp-2 font-bold text-foreground">
            {peakShort}
          </Typography>
          <Typography variant="body2" className="mt-1 font-semibold tabular-nums text-foreground">
            {peakVsAvg.peakPct >= 0 ? '+' : ''}
            {peakVsAvg.peakPct}% {t('statistics.ordersDayGaugeVsAvg')}
          </Typography>
          <Typography variant="caption" className="mt-1.5 block text-muted-foreground">
            {t('statistics.ordersDayGaugeAvgPerDay', { value: peakVsAvg.avg.toFixed(1) })}
          </Typography>
        </div>
      </div>

      <div className="mt-6 flex shrink-0 items-end justify-between gap-4 border-t border-border pt-4">
        <div>
          <Typography variant="h6" className="font-bold tabular-nums text-foreground">
            {(minRow?.count ?? 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('statistics.ordersDayGaugeLowest')}
          </Typography>
          {minRow && (
            <Typography variant="caption" className="mt-0.5 line-clamp-1 block text-muted-foreground/90">
              {minRow.day}
            </Typography>
          )}
        </div>
        <div className="text-end">
          <Typography variant="h6" className="font-bold tabular-nums text-foreground">
            {(maxRow?.count ?? 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('statistics.ordersDayGaugeHighest')}
          </Typography>
          {maxRow && (
            <Typography variant="caption" className="mt-0.5 line-clamp-1 block text-muted-foreground/90">
              {maxRow.day}
            </Typography>
          )}
        </div>
      </div>
    </m.div>
  );
}

function formatTooltipPair(
  value: unknown,
  label: string,
  opts?: { decimals?: number }
): [string, string] {
  if (value === undefined || value === null) return ['—', label];
  if (Array.isArray(value)) {
    const s = value
      .map((x) => (typeof x === 'number' ? x.toLocaleString() : String(x)))
      .join(', ');
    return [s, label];
  }
  if (typeof value === 'number') {
    const s =
      opts?.decimals !== undefined
        ? value.toLocaleString(undefined, {
            maximumFractionDigits: opts.decimals,
            minimumFractionDigits: opts.decimals,
          })
        : value.toLocaleString();
    return [s, label];
  }
  return [String(value), label];
}

const STATS_MOTION = {
  shell: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    },
  },
};

const CHART_TOOLTIP_STYLE: CSSProperties = {
  borderRadius: 8,
  border: 'none',
  /** Tokens are RGB triplets (`--card: R G B`), not HSL — use `rgb()` */
  backgroundColor: 'rgb(var(--card))',
  color: 'rgb(var(--card-foreground))',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

function StatsSectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-1 rounded-full bg-primary shadow-[var(--shadow-primary-sm)]" />
      <div className="space-y-0.5">
        <Typography
          variant="overline"
          className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary"
        >
          {kicker}
        </Typography>
        <Typography variant="h5" className="font-bold tracking-tight text-foreground">
          {title}
        </Typography>
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const { i18n, t } = useTranslation('table');
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
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
      /** Unique per day (avoids repeated “Sat” on the X axis) */
      xAxisShort: d.date ? dayjs(d.date).format('D MMM') : d.day_name,
      revenue: d.revenue,
      orders: d.orders,
    }));
  }, [revenueTrendData]);

  const revenueOrdersAxisTicks = useMemo(() => {
    if (revenueChartData.length === 0) return [0];
    const maxO = Math.max(...revenueChartData.map((d) => d.orders), 0);
    return buildIntegerYTicks(maxO, 6);
  }, [revenueChartData]);

  const ordersPieData = useMemo(() => Object.entries(ordersByStatus)
      .filter(([, v]) => (v as number) > 0)
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: value as number,
      })), [ordersByStatus]);

  const categoriesPieData = useMemo(() => {
    const raw = topCategoriesData?.data?.data ?? [];
    return raw.map((d) => ({
      name: (d.category_name?.[lang as 'ar' | 'en'] ?? d.category_name?.en ?? '') || t('notAvailableShort'),
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
  /** Same driver order and color in all three charts; real units (not normalized %). */
  const driverComparisonRows = useMemo(() => {
    const raw = driverComparisonData?.data?.data ?? [];
    return [...raw]
      .sort((a, b) => b.total_orders - a.total_orders)
      .map((d, i) => ({
        ...d,
        /** Unique per row so Recharts category axis does not merge duplicate labels. */
        chartCategoryKey: `driver-${i}`,
        shortName:
          d.driver_name.length > 22 ? `${d.driver_name.slice(0, 20)}…` : d.driver_name,
      }));
  }, [driverComparisonData]);
  const stockLevelsChartData = useMemo(
    () => stockLevelsData?.data?.data ?? [],
    [stockLevelsData]
  );
  const salesHeatmapChartData = useMemo(
    () => salesHeatmapData?.data?.data ?? [],
    [salesHeatmapData]
  );

  const categoriesWithRevenue = useMemo(
    () => categoriesPieData.filter((d) => d.value > 0),
    [categoriesPieData]
  );

  const orderFunnelWithData = useMemo(
    () => orderFunnelChartData.filter((d) => d.count > 0),
    [orderFunnelChartData]
  );

  const hasOrdersByDay = ordersByDayChartData.some((d) => d.count > 0);
  const hasOrdersByHour = ordersByHourChartData.some((d) => d.count > 0);
  const hasRevenuePoints = revenueChartData.some((d) => d.revenue > 0 || d.orders > 0);
  const hasHeatmapValues = salesHeatmapChartData.some((d) => d.value > 0);
  const hasStockLevels = stockLevelsChartData.some((d) => d.value > 0);
  const hasUserGrowth = userGrowthChartData.some(
    (d) => d.new_users > 0 || d.total_users > 0
  );
  const hasAvgOrderValue = avgOrderValueChartData.some((d) => d.average_order_value > 0);
  const showKpi = counts != null;

  const peakVsAvg = useMemo(() => {
    if (ordersByDayChartData.length === 0) {
      return { peakPct: 0, peakDay: '', peakCount: 0, avg: 0 };
    }
    const avg =
      ordersByDayChartData.reduce((s, d) => s + d.count, 0) / ordersByDayChartData.length;
    const peak = ordersByDayChartData.reduce(
      (a, d) => (d.count > a.count ? d : a),
      ordersByDayChartData[0]
    );
    const peakPct = avg > 0 ? Math.round(((peak.count - avg) / avg) * 100) : 0;
    return { peakPct, peakDay: peak.day, peakCount: peak.count, avg };
  }, [ordersByDayChartData]);

  const dateRangeLabel = useMemo(() => {
    if (!dateFrom && !dateTo) return t('statistics.periodAll');
    const f = dateFrom ? dayjs(dateFrom).format('D MMM, YYYY') : '…';
    const to = dateTo ? dayjs(dateTo).format('D MMM, YYYY') : '…';
    return `${f} — ${to}`;
  }, [dateFrom, dateTo, t]);

  const ordersPieTotal = useMemo(
    () => ordersPieData.reduce((s, d) => s + d.value, 0),
    [ordersPieData]
  );

  if (isLoadingDashboard) return <LoadingScreen />;

  const tableContainerClass =
    'w-full bg-card overflow-hidden rounded-2xl shadow-sm ring-1 ring-primary/[0.06] hover:shadow-md hover:ring-primary/[0.12] transition-all duration-300 hover:-translate-y-0.5';

  const surfaceCard = 'rounded-2xl bg-card shadow-[0_4px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-primary/[0.06]';

  return (
    <>
      <title>{t('form.statisticsIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <m.div className="flex w-full flex-col p-4 sm:p-6" {...STATS_MOTION.shell}>
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary/20 via-card to-primary/10 p-1 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.25)] sm:p-1.5">
          <div className="rounded-[24px] bg-card/95 p-4 shadow-2xl backdrop-blur-sm sm:p-6 md:p-8">
            <m.div
              className="flex w-full flex-col gap-6"
              variants={STATS_MOTION.container}
              initial="hidden"
              animate="show"
            >
              {/* Header — title, period, filters */}
              <m.div
                variants={STATS_MOTION.item}
                className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
              >
                <Box className="flex min-w-0 items-start gap-4">
                  <Box className="relative shrink-0">
                    <span
                      className="absolute -inset-1 rounded-2xl bg-primary/25 opacity-90 blur-md"
                      aria-hidden
                    />
                    <Box className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-[var(--shadow-primary-md)]">
                      <Iconify icon="solar:chart-2-bold" className="text-primary-foreground" width={28} height={28} />
                    </Box>
                  </Box>
                  <Box className="min-w-0 pt-1">
                    <Typography variant="h3" className="font-extrabold tracking-tight text-foreground">
                      {t('statistics.title')}
                    </Typography>
                    <Typography variant="body2" className="mt-1.5 max-w-xl leading-relaxed text-muted-foreground">
                      {t('statistics.subtitle')}
                    </Typography>
                  </Box>
                </Box>

                <Box className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
                  <Box className="inline-flex items-center gap-2 self-stretch rounded-full bg-muted/40 px-4 py-2 text-sm text-muted-foreground lg:self-end">
                    <Iconify icon="solar:calendar-bold" width={18} className="shrink-0 text-primary" />
                    <Typography component="span" variant="body2" className="font-medium text-foreground">
                      {dateRangeLabel}
                    </Typography>
                  </Box>

                  <Box className="flex w-full flex-col gap-3 rounded-2xl bg-muted/25 p-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end">
                    <Box className="flex flex-1 flex-wrap items-end gap-3 min-[480px]:flex-nowrap">
                      <Box className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-[140px]">
                        <Typography
                          variant="caption"
                          className="font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {t('statistics.from')}
                        </Typography>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="h-10 w-full min-w-0 border-0 bg-card text-sm shadow-sm sm:w-[156px]"
                        />
                      </Box>
                      <Box className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-[140px]">
                        <Typography
                          variant="caption"
                          className="font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {t('statistics.to')}
                        </Typography>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="h-10 w-full min-w-0 border-0 bg-card text-sm shadow-sm sm:w-[156px]"
                        />
                      </Box>
                    </Box>
                    <Box className="flex flex-wrap items-center gap-2 sm:pb-0.5">
                      <Button
                        variant="contained"
                        onClick={handleApply}
                        disabled={!dateFrom && !dateTo}
                        className="h-10 gap-2 px-5 text-sm font-semibold shadow-[0_2px_12px_-4px_rgb(var(--primary)_/_0.45)]"
                      >
                        <Iconify icon="solar:filter-bold" width={18} />
                        {t('statistics.apply')}
                      </Button>
                      {appliedFilter && (
                        <Button
                          variant="soft"
                          color="inherit"
                          onClick={handleReset}
                          className="h-10 gap-2 px-4 text-sm"
                        >
                          <Iconify icon="solar:restart-bold" width={16} />
                          {t('statistics.reset')}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </m.div>

              {/* KPI row */}
              {showKpi && (
              <m.div variants={STATS_MOTION.item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: t('statistics.totalUsers'),
                value: counts?.total_users ?? 0,
                sub: t('statistics.activeCount', { count: counts?.active_users ?? 0 }),
                icon: 'solar:users-group-rounded-bold',
                accent: 'text-primary',
                iconBg: 'bg-primary/15',
                cardClass: 'stat-card-primary',
                topBar: 'from-primary/0 via-primary/50 to-primary/0',
              },
              {
                label: t('statistics.totalOrders'),
                value: counts?.total_orders ?? 0,
                sub: t('statistics.completedCount', { count: counts?.completed_orders ?? 0 }),
                icon: 'solar:cart-large-2-bold',
                accent: 'text-primary',
                iconBg: 'bg-primary/15',
                cardClass: 'stat-card-primary',
                topBar: 'from-primary/0 via-primary/50 to-primary/0',
              },
              {
                label: t('statistics.products'),
                value: counts?.total_products ?? 0,
                sub: t('statistics.activeCount', { count: counts?.active_products ?? 0 }),
                icon: 'solar:box-bold',
                accent: 'text-primary',
                iconBg: 'bg-primary/15',
                cardClass: 'stat-card-primary',
                topBar: 'from-primary/0 via-primary/50 to-primary/0',
              },
              {
                label: t('statistics.shopsAndVendors'),
                value: (counts?.total_shops ?? 0) + (counts?.total_vendors ?? 0),
                sub: t('statistics.shopsVendorsCount', { shops: counts?.active_shops ?? 0, vendors: counts?.total_vendors ?? 0 }),
                icon: 'solar:shop-2-bold',
                accent: 'text-primary',
                iconBg: 'bg-primary/15',
                cardClass: 'stat-card-primary',
                topBar: 'from-primary/0 via-primary/50 to-primary/0',
              },
            ].map(({ label, value, sub, icon, accent, iconBg, cardClass, topBar }) => (
              <Box
                key={label}
                className={`relative overflow-hidden rounded-xl border-0 p-5 shadow-sm ring-0 outline-none hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${cardClass}`}
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${topBar} rounded-t-xl`} />

                <Box className="flex items-start justify-between gap-3">
                  <Box className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                    <Iconify icon={icon} className={accent} width={24} height={24} />
                  </Box>
                  <Box className="text-right flex-1 min-w-0">
                    <Typography variant="h4" className={`font-bold leading-tight ${accent}`}>
                      {value.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Box className="mt-3">
                  <Typography variant="subtitle2" className="font-semibold text-foreground leading-snug">
                    {label}
                  </Typography>
                  {sub && (
                    <Typography variant="caption" className="text-muted-foreground text-xs mt-0.5 block leading-relaxed">
                      {sub}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
              </m.div>
              )}

              {/* Orders & fulfillment: day-of-week, status mix, top shops snapshot */}
              {(hasOrdersByDay || ordersPieData.length > 0 || topShops.length > 0) && (
                <m.div variants={STATS_MOTION.item} className="space-y-3">
                  <StatsSectionHeading
                    kicker={t('statistics.sectionOrdersKicker')}
                    title={t('statistics.sectionOrdersTitle')}
                  />
                  <div className="grid gap-4 xl:grid-cols-12 xl:items-stretch">
                  {hasOrdersByDay && (
                    <Box
                      className={`${surfaceCard} flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-primary/20 p-0 xl:col-span-5`}
                    >
                      <FulfillmentWidgetHeader
                        icon="solar:calendar-mark-bold"
                        title={t('statistics.ordersByDayOfWeek')}
                        badge={
                          <FulfillmentHeaderBadge>
                            {ordersByDayChartData
                              .reduce((s, d) => s + d.count, 0)
                              .toLocaleString()}
                          </FulfillmentHeaderBadge>
                        }
                      />
                      <div className="flex min-h-0 flex-1 flex-col p-4 pt-3">
                        <OrdersByDayGaugeCard
                          data={ordersByDayChartData}
                          t={t}
                          peakVsAvg={peakVsAvg}
                          className="rounded-xl border-0 p-4 shadow-md ring-1 ring-border/50"
                        />
                      </div>
                    </Box>
                  )}

                  {ordersPieData.length > 0 && (
                    <Box
                      className={`${surfaceCard} relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-primary/20 p-0 xl:col-span-4`}
                    >
                      <FulfillmentWidgetHeader
                        icon="solar:chart-2-bold"
                        title={t('statistics.ordersByStatus')}
                        badge={
                          <FulfillmentHeaderBadge>
                            {ordersPieTotal.toLocaleString()}
                          </FulfillmentHeaderBadge>
                        }
                      />
                      <Box className="relative h-full min-h-[260px] flex-1 px-4 pb-4" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 0, right: 0, bottom: 8, left: 0 }}>
                            <Pie
                              {...CHART_ANIM}
                              data={ordersPieData}
                              cx="50%"
                              cy="46%"
                              innerRadius={62}
                              outerRadius={92}
                              paddingAngle={2.5}
                              cornerRadius={6}
                              dataKey="value"
                              nameKey="name"
                              label={false}
                            >
                              {ordersPieData.map((_, idx) => (
                                <Cell
                                  key={idx}
                                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                  stroke="rgb(var(--card))"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={CHART_TOOLTIP_STYLE}
                              formatter={(v, name) => formatTooltipPair(v, String(name))}
                            />
                            <Legend
                              verticalAlign="bottom"
                              align="center"
                              layout="horizontal"
                              wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute left-1/2 top-[46%] z-10 -translate-x-1/2 -translate-y-1/2 text-center">
                          <Typography
                            component="p"
                            variant="caption"
                            className="text-muted-foreground"
                          >
                            {t('statistics.donutCenterLabel')}
                          </Typography>
                          <Typography
                            component="p"
                            variant="h5"
                            className="font-bold text-foreground tabular-nums"
                          >
                            {ordersPieTotal.toLocaleString()}
                          </Typography>
                        </div>
                      </Box>
                    </Box>
                  )}

                  {topShops.length > 0 && (
                  <Box className="flex h-full min-h-0 min-w-0 flex-col xl:col-span-3">
                    {(() => {
                      const snapshot = topShops.slice(0, 6);
                      const maxSnapOrders = Math.max(...snapshot.map((s) => s.total_orders), 1);
                      return (
                      <Box
                        className={`${surfaceCard} relative flex h-full min-h-0 flex-1 flex-col overflow-hidden border border-primary/20 p-0`}
                      >
                        <FulfillmentWidgetHeader
                          icon="solar:shop-2-bold"
                          title={t('statistics.topShopsSnapshot')}
                          badge={
                            <FulfillmentHeaderBadge>
                              {Math.min(6, topShops.length)}/{topShops.length}
                            </FulfillmentHeaderBadge>
                          }
                        />
                        <div className="relative flex min-h-0 flex-1 flex-col p-4">
                        <div
                          className="pointer-events-none absolute -right-8 top-8 h-36 w-36 rounded-full bg-primary/15 blur-3xl"
                          aria-hidden
                        />
                        <div className="pointer-events-none absolute bottom-4 left-0 h-24 w-24 rounded-full bg-[#0d9488]/10 blur-2xl dark:bg-[#0d9488]/15" aria-hidden />
                        <div className="relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
                          {snapshot.map((shop, idx) => {
                            const accent = CHART_COLORS[idx % CHART_COLORS.length];
                            const pct = (shop.total_orders / maxSnapOrders) * 100;
                            return (
                              <m.div
                                key={shop.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                className="flex items-stretch gap-3 rounded-xl border border-border/60 bg-card/80 p-2.5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
                              >
                                <div
                                  className="flex w-9 shrink-0 flex-col items-center justify-center rounded-lg text-xs font-bold text-white shadow-inner"
                                  style={{ backgroundColor: accent }}
                                >
                                  {idx + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start gap-2">
                                    <Typography variant="caption" className="line-clamp-2 flex-1 font-semibold leading-snug text-foreground">
                                      {shop.name?.[lang as 'ar' | 'en'] ?? shop.name?.en ?? '-'}
                                    </Typography>
                                    <span
                                      className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ring-2 ring-card ${
                                        shop.is_active ? 'bg-primary ring-primary/35' : 'bg-muted-foreground/45'
                                      }`}
                                      title={shop.is_active ? t('active') : t('inactive')}
                                    />
                                  </div>
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                                      <m.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: accent }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.65, delay: 0.1 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                      />
                                    </div>
                                    <Typography variant="caption" className="shrink-0 tabular-nums font-bold text-foreground">
                                      {shop.total_orders}
                                    </Typography>
                                  </div>
                                  <Typography variant="caption" className="mt-0.5 block text-muted-foreground">
                                    {t('statistics.ordersLabel')}
                                  </Typography>
                                </div>
                              </m.div>
                            );
                          })}
                        </div>
                        </div>
                      </Box>
                      );
                    })()}
                  </Box>
                  )}
                  </div>
                </m.div>
              )}

              {/* Revenue, funnel, categories */}
          {(hasRevenuePoints ||
            orderFunnelWithData.length > 0 ||
            hasAvgOrderValue ||
            categoriesWithRevenue.length > 0) && (
            <m.div variants={STATS_MOTION.item} className="space-y-4">
              <StatsSectionHeading
                kicker={t('statistics.sectionCommerceKicker')}
                title={t('statistics.sectionCommerceTitle')}
              />
          {hasRevenuePoints && (
            <Box className={`${tableContainerClass} p-5`}>
              <Typography variant="h6" className="font-bold mb-4 text-foreground">
                {t('statistics.revenueTrend')}
              </Typography>
              <Box className="h-[300px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={CHART_MARGIN_WITH_TOP_LABELS}>
                    <defs>
                      <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fillOrdersTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 8"
                      stroke="rgb(var(--border))"
                      vertical={false}
                      opacity={0.65}
                    />
                    <XAxis
                      dataKey="xAxisShort"
                      tick={{ fontSize: 9, fill: 'rgb(var(--foreground))' }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgb(var(--border))' }}
                      interval="preserveStartEnd"
                      minTickGap={16}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatAxisTick}
                      width={44}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 'auto']}
                      allowDecimals={false}
                      ticks={revenueOrdersAxisTicks}
                      tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => String(Math.round(Number(v)))}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      labelFormatter={(label, payload) => {
                        const row = payload?.[0]?.payload as
                          | { date?: string; label?: string }
                          | undefined;
                        if (row?.date) {
                          return `${dayjs(row.date).format('D MMM YYYY')}${row.label ? ` · ${row.label}` : ''}`;
                        }
                        return String(label ?? row?.label ?? '');
                      }}
                      formatter={(v, name) => formatTooltipPair(v, String(name))}
                      cursor={{ stroke: 'rgb(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 8 }} iconType="circle" iconSize={8} />
                    <Area
                      {...CHART_ANIM}
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0d9488"
                      strokeWidth={2}
                      fill="url(#fillRevenue)"
                      name={t('statistics.revenueLabel')}
                    >
                      <LabelList
                        dataKey="revenue"
                        content={(props: any) => {
                          const { x, y, value, index } = props;
                          if (x == null || y == null || value == null || index == null) return null;
                          const last = revenueChartData.length - 1;
                          if (index % 4 !== 0 && index !== last) return null;
                          return (
                            <text
                              x={Number(x)}
                              y={Number(y)}
                              dy={-6}
                              fontSize={9}
                              fill="#0d9488"
                              textAnchor="middle"
                              fontWeight={600}
                            >
                              {formatAxisTick(Number(value))}
                            </text>
                          );
                        }}
                      />
                    </Area>
                    <Area
                      {...CHART_ANIM}
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#fillOrdersTrend)"
                      name={t('statistics.ordersLabel')}
                    >
                      <LabelList
                        dataKey="orders"
                        content={(props: any) => {
                          const { x, y, value, index } = props;
                          if (x == null || y == null || value == null || index == null) return null;
                          const last = revenueChartData.length - 1;
                          if (index % 4 !== 0 && index !== last) return null;
                          return (
                            <text
                              x={Number(x)}
                              y={Number(y)}
                              dy={-6}
                              fontSize={9}
                              fill="#2563eb"
                              textAnchor="middle"
                              fontWeight={600}
                            >
                              {String(Math.round(Number(value)))}
                            </text>
                          );
                        }}
                      />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {(orderFunnelWithData.length > 0 || hasAvgOrderValue) && (
          <Box className="grid gap-4 lg:grid-cols-2">
            {orderFunnelWithData.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="h6" className="font-bold mb-4 text-foreground">
                  {t('statistics.orderStatusFunnel')}
                </Typography>
                <Box className="h-[280px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={orderFunnelWithData}
                      layout="vertical"
                      margin={{ top: 8, right: 36, left: 8, bottom: 8 }}
                    >
                      <defs>
                        <linearGradient id="funnelBarGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#0891b2" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#0891b2" stopOpacity={0.95} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 8"
                        stroke="rgb(var(--border))"
                        horizontal={false}
                        opacity={0.65}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: 'rgb(var(--foreground))' }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgb(var(--border))' }}
                        tickFormatter={formatAxisTick}
                      />
                      <YAxis
                        dataKey="stage"
                        type="category"
                        width={112}
                        tick={{
                          fontSize: 12,
                          fill: 'rgb(var(--foreground))',
                          fontWeight: 500,
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelFormatter={(label) => String(label ?? '')}
                        formatter={(value, _name, item) => {
                          const stage = (item?.payload as { stage?: string })?.stage;
                          const [formatted] = formatTooltipPair(value, t('statistics.ordersLabel'));
                          return [formatted, stage ?? t('statistics.ordersLabel')];
                        }}
                        cursor={{ fill: 'rgb(var(--muted) / 0.08)' }}
                      />
                      <Bar
                        {...CHART_ANIM}
                        dataKey="count"
                        name={t('statistics.ordersLabel')}
                        radius={[0, 10, 10, 0]}
                        barSize={20}
                        fill="url(#funnelBarGrad)"
                      >
                        <LabelList
                          dataKey="count"
                          position="right"
                          offset={8}
                          formatter={(v: unknown) =>
                            typeof v === 'number' ? v.toLocaleString() : String(v ?? '')
                          }
                          fill="rgb(var(--foreground))"
                          fontSize={12}
                          fontWeight={600}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
            {hasAvgOrderValue && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="h6" className="font-bold mb-4 text-foreground">
                  {t('statistics.avgOrderValueTrend')}
                </Typography>
                <Box className="h-[280px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={avgOrderValueChartData} margin={CHART_MARGIN_WITH_TOP_LABELS}>
                      <defs>
                        <linearGradient id="fillAvgOrder" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={GAUGE_PRIMARY.main} stopOpacity={0.38} />
                          <stop offset="100%" stopColor={GAUGE_PRIMARY.main} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 8"
                        stroke="rgb(var(--border))"
                        vertical={false}
                        opacity={0.65}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: 'rgb(var(--foreground))' }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgb(var(--border))' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatAxisTick}
                        width={44}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelFormatter={(label) => String(label ?? '')}
                        formatter={(v) =>
                          formatTooltipPair(v, t('statistics.avgOrderValueLabel'), { decimals: 2 })
                        }
                        cursor={{ stroke: 'rgb(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 8 }} iconType="circle" iconSize={8} />
                      <Area
                        {...CHART_ANIM}
                        type="monotone"
                        dataKey="average_order_value"
                        stroke={GAUGE_PRIMARY.main}
                        strokeWidth={2.5}
                        fill="url(#fillAvgOrder)"
                        dot={{ r: 4, fill: GAUGE_PRIMARY.main, strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name={t('statistics.avgOrderValueLabel')}
                      >
                        <LabelList
                          dataKey="average_order_value"
                          position="top"
                          offset={10}
                          formatter={(v: unknown) => {
                            const n = Number(v);
                            if (!Number.isFinite(n)) return '';
                            if (n <= 0) return '';
                            return n >= 1000
                              ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
                              : n.toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                  minimumFractionDigits: 0,
                                });
                          }}
                          fill="rgb(var(--foreground))"
                          fontSize={10}
                          fontWeight={600}
                        />
                      </Area>
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </Box>
          )}

          {/* Top categories — ranked leaderboard cards */}
          {categoriesWithRevenue.length > 0 && (() => {
            const totalRev = categoriesWithRevenue.reduce((s, d) => s + d.value, 0);
            const maxRev = Math.max(...categoriesWithRevenue.map((d) => d.value), 1);
            const RANK_COLORS = [
              { bg: 'bg-amber-500/15', text: 'text-amber-600', bar: 'from-amber-400 to-amber-600', icon: 'solar:crown-bold', iconColor: 'text-amber-500' },
              { bg: 'bg-slate-400/15', text: 'text-slate-500', bar: 'from-slate-300 to-slate-500', icon: 'solar:medal-ribbon-star-bold', iconColor: 'text-slate-400' },
              { bg: 'bg-orange-400/15', text: 'text-orange-500', bar: 'from-orange-300 to-orange-500', icon: 'solar:medal-ribbon-bold', iconColor: 'text-orange-400' },
            ];
            const defaultRank = { bg: 'bg-primary/10', text: 'text-primary', bar: 'from-primary/60 to-primary', icon: '', iconColor: '' };
            return (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="h6" className="mb-4 font-bold text-foreground">
                  {t('statistics.topCategoriesByRevenue')}
                </Typography>
                <div className="space-y-2">
                  {categoriesWithRevenue.map((cat, i) => {
                    const pct = totalRev > 0 ? (cat.value / totalRev) * 100 : 0;
                    const widthPct = Math.max(8, (cat.value / maxRev) * 100);
                    const rank = RANK_COLORS[i] ?? defaultRank;
                    return (
                      <m.div
                        key={cat.name}
                        className="group relative overflow-hidden rounded-xl border border-border/60 bg-card px-4 py-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div
                          className={`pointer-events-none absolute inset-y-0 start-0 bg-gradient-to-r ${rank.bar} opacity-[0.10] transition-all duration-500 group-hover:opacity-[0.18]`}
                          style={{ width: `${widthPct}%` }}
                        />

                        <div className="relative flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${rank.bg}`}>
                            {i < 3 ? (
                              <Iconify icon={rank.icon} className={rank.iconColor} width={20} />
                            ) : (
                              <span className={`text-sm font-bold ${rank.text}`}>{i + 1}</span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <Typography
                              variant="subtitle2"
                              className="truncate font-semibold text-foreground"
                            >
                              {cat.name}
                            </Typography>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                <m.div
                                  className={`h-full rounded-full bg-gradient-to-r ${rank.bar}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${widthPct}%` }}
                                  transition={{ delay: 0.2 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                />
                              </div>
                              <Typography variant="caption" className="shrink-0 tabular-nums text-muted-foreground">
                                {pct.toFixed(1)}%
                              </Typography>
                            </div>
                          </div>

                          <Typography
                            variant="subtitle2"
                            className={`shrink-0 font-bold tabular-nums ${i === 0 ? 'text-amber-600' : 'text-foreground'}`}
                          >
                            {cat.value.toLocaleString()}
                          </Typography>
                        </div>
                      </m.div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <Typography variant="caption" className="font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('statistics.revenueLabel')}
                  </Typography>
                  <Typography variant="subtitle2" className="font-bold tabular-nums text-foreground">
                    {totalRev.toLocaleString()}
                  </Typography>
                </div>
              </Box>
            );
          })()}
            </m.div>
          )}

          {/* Top Shops */}
          {topShops.length > 0 && (
            <m.div variants={STATS_MOTION.item} className="space-y-3">
              <StatsSectionHeading
                kicker={t('statistics.sectionMerchantsKicker')}
                title={t('statistics.sectionMerchantsTitle')}
              />
            <Box className={tableContainerClass}>
              <Box className="relative overflow-hidden bg-gradient-to-r from-primary/[0.14] via-primary/[0.05] to-transparent px-5 py-4">
                <div
                  className="pointer-events-none absolute inset-y-0 end-0 w-2/5 max-w-md bg-gradient-to-l from-[#2563eb]/[0.07] to-transparent dark:from-[#2563eb]/10"
                  aria-hidden
                />
                <div className="relative flex flex-wrap items-center gap-3">
                  <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 shadow-md ring-1 ring-primary/25">
                    <Iconify icon="solar:shop-bold" className="text-primary" width={24} />
                  </Box>
                  <div>
                    <Typography variant="h6" className="font-bold text-foreground">
                      {t('statistics.topShops')}
                    </Typography>
                  </div>
                </div>
              </Box>
              <Box className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/25">
                      <th className="w-14 py-3 ps-5 pe-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('statistics.topShopsRank')}
                      </th>
                      <th className="py-3 px-4 text-start font-medium text-muted-foreground">{t('statistics.shopColumn')}</th>
                      <th className="py-3 px-4 text-end font-medium text-muted-foreground">{t('statistics.ordersColumn')}</th>
                      <th className="py-3 px-4 text-end font-medium text-muted-foreground">{t('statistics.ratingColumn')}</th>
                      <th className="py-3 pe-5 ps-2 text-center font-medium text-muted-foreground">{t('statistics.statusColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topShops.map((shop, idx) => {
                      const accent = CHART_COLORS[idx % CHART_COLORS.length];
                      return (
                      <tr
                        key={shop.id}
                        className="group border-b border-border/40 transition-colors last:border-0 hover:bg-primary/[0.04]"
                      >
                        <td className="py-3 ps-5 pe-2 align-middle">
                          <span
                            className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: accent }}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="max-w-[240px] py-3 px-4 align-middle font-medium text-foreground">
                          <div className="flex items-start gap-2.5">
                            <div
                              className="mt-0.5 min-h-[2.25rem] w-1 shrink-0 rounded-full opacity-90 group-hover:opacity-100"
                              style={{ backgroundColor: accent }}
                              aria-hidden
                            />
                            <span className="line-clamp-2 leading-snug">
                              {shop.name?.[lang as 'ar' | 'en'] ?? shop.name?.en ?? '-'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-end align-middle tabular-nums font-semibold text-foreground">
                          {shop.total_orders}
                        </td>
                        <td className="py-3 px-4 text-end align-middle tabular-nums text-foreground">
                          {shop.average_rating != null ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-muted/80 px-2 py-0.5 font-semibold ring-1 ring-border/60">
                              {shop.average_rating.toFixed(1)}
                              <Iconify icon="solar:star-bold" width={14} className="text-primary opacity-90" />
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 pe-5 ps-2 text-center align-middle">
                          {shop.is_active ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/25">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {t('active')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              {t('inactive')}
                            </span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            </Box>
            </m.div>
          )}

          {/* Demand timing: hour + day×hour heatmap */}
          {(hasOrdersByHour || hasHeatmapValues) && (
            <m.div variants={STATS_MOTION.item} className="space-y-4">
              <StatsSectionHeading
                kicker={t('statistics.sectionPatternsKicker')}
                title={t('statistics.sectionPatternsTitle')}
              />
          {hasOrdersByHour && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="h6" className="mb-4 font-bold text-foreground">
                  {t('statistics.ordersByHour')}
                </Typography>
                <div className={CHART_GLASS_INNER} dir="ltr">
                  <Box className="h-[300px] px-1 pb-1 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ordersByHourChartData}
                        margin={{ top: 18, right: 6, left: 0, bottom: 4 }}
                      >
                        <defs>
                          {ordersByHourChartData.map((_, i) => {
                            const c = CHART_COLORS[i % CHART_COLORS.length];
                            return (
                              <linearGradient
                                key={`hour-col-grad-${i}`}
                                id={`hourColGrad-${i}`}
                                x1="0"
                                y1="1"
                                x2="0"
                                y2="0"
                              >
                                <stop offset="0%" stopColor={c} stopOpacity={0.3} />
                                <stop offset="60%" stopColor="#6366f1" stopOpacity={0.85} />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                              </linearGradient>
                            );
                          })}
                        </defs>
                        <CartesianGrid
                          strokeDasharray="4 8"
                          stroke="rgb(var(--border))"
                          vertical={false}
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="hour"
                          type="category"
                          tick={{
                            fontSize: 10,
                            fill: 'rgb(var(--foreground))',
                            fontWeight: 500,
                          }}
                          tickLine={false}
                          axisLine={{ stroke: 'rgb(var(--border))' }}
                          interval={0}
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: 'rgb(var(--muted-foreground))',
                          }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={formatAxisTick}
                          width={36}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={CHART_TOOLTIP_STYLE}
                          formatter={(v) => formatTooltipPair(v, t('statistics.ordersLabel'))}
                          cursor={{ fill: 'rgb(var(--muted) / 0.1)' }}
                        />
                        <Bar
                          {...CHART_ANIM}
                          dataKey="count"
                          name={t('statistics.ordersLabel')}
                          radius={[14, 14, 0, 0]}
                          maxBarSize={48}
                        >
                          {ordersByHourChartData.map((_, i) => (
                            <Cell key={`hour-cell-${i}`} fill={`url(#hourColGrad-${i})`} />
                          ))}
                          <LabelList
                            dataKey="count"
                            position="top"
                            formatter={(v: unknown) => formatColumnTopLabel(Number(v))}
                            fill="rgb(var(--foreground))"
                            fontSize={11}
                            fontWeight={600}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </div>
              </Box>
          )}
          {hasHeatmapValues && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="h6" className="mb-4 font-bold text-foreground">
                  {t('statistics.salesHeatmap')}
                </Typography>
                <HeatmapGrid data={salesHeatmapChartData} />
              </Box>
          )}
            </m.div>
          )}

          {/* User Growth */}
          {hasUserGrowth && (
            <m.div variants={STATS_MOTION.item} className="space-y-3">
              <StatsSectionHeading
                kicker={t('statistics.sectionAudienceKicker')}
                title={t('statistics.sectionAudienceTitle')}
              />
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="h6" className="mb-4 font-bold text-foreground">
                  {t('statistics.userGrowth')}
                </Typography>
                <Box className="h-[300px] overflow-hidden rounded-xl bg-card/40 px-1 pt-2" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={userGrowthChartData}
                      margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient id="userGrowthStrokeNew" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#fb923c" />
                          <stop offset="45%" stopColor="#f472b6" />
                          <stop offset="100%" stopColor="#db2777" />
                        </linearGradient>
                        <linearGradient id="userGrowthStrokeTotal" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        horizontal={false}
                        vertical
                        stroke="#EDEDED"
                        strokeOpacity={0.9}
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tick={(tickProps) => {
                          const p = tickProps as {
                            x?: number | string;
                            y?: number | string;
                            payload?: { value?: string } | string;
                            index?: number;
                          };
                          const x = typeof p.x === 'number' ? p.x : Number(p.x);
                          const y = typeof p.y === 'number' ? p.y : Number(p.y);
                          const label =
                            typeof p.payload === 'object' && p.payload && 'value' in p.payload
                              ? String(p.payload.value)
                              : String(p.payload ?? '');
                          const index = p.index ?? 0;
                          const isLast = index === userGrowthChartData.length - 1;
                          return (
                            <text
                              x={x}
                              y={y}
                              dy={14}
                              textAnchor="middle"
                              fill={isLast ? '#db2777' : 'rgb(var(--muted-foreground))'}
                              fontSize={11}
                              fontWeight={isLast ? 600 : 400}
                            >
                              {label}
                            </text>
                          );
                        }}
                      />
                      <YAxis yAxisId="newUsers" hide domain={['auto', 'auto']} />
                      <YAxis yAxisId="totalUsers" orientation="right" hide domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(v, name) => formatTooltipPair(v, String(name))}
                        cursor={{ stroke: 'rgb(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} iconType="line" iconSize={14} />
                      <Line
                        {...CHART_ANIM}
                        yAxisId="newUsers"
                        type="monotone"
                        dataKey="new_users"
                        name={t('statistics.newUsersLabel')}
                        stroke="url(#userGrowthStrokeNew)"
                        strokeWidth={3.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        dot={false}
                        activeDot={(dotProps: unknown) => {
                          const p = dotProps as { cx?: number; cy?: number };
                          return <UserGrowthGlowActiveDot cx={p.cx} cy={p.cy} />;
                        }}
                      />
                      <Line
                        {...CHART_ANIM}
                        yAxisId="totalUsers"
                        type="monotone"
                        dataKey="total_users"
                        name={t('statistics.totalUsersLabel')}
                        stroke="url(#userGrowthStrokeTotal)"
                        strokeWidth={3.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        dot={false}
                        activeDot={{ r: 5, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </m.div>
          )}

          {/* Driver comparison (real units) & Stock Levels */}
          {(driverComparisonRows.length > 0 || hasStockLevels) && (
          <m.div variants={STATS_MOTION.item} className="space-y-4">
            <StatsSectionHeading
              kicker={t('statistics.sectionOperationsKicker')}
              title={t('statistics.sectionOperationsTitle')}
            />
          <Box className="grid gap-4 lg:grid-cols-2">
            {driverComparisonRows.length > 0 && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="h6" className="font-bold text-foreground">
                  {t('statistics.driverPerformance')}
                </Typography>
                <Typography variant="caption" className="mb-3 mt-1 block max-w-2xl leading-relaxed text-muted-foreground">
                  {t('statistics.driverRadarFootnote')}
                </Typography>
                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
                  {driverComparisonRows.map((row, idx) => (
                    <span key={row.driver_name} className="flex max-w-[200px] items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                      />
                      <span className="truncate font-medium text-foreground" title={row.driver_name}>
                        {row.driver_name}
                      </span>
                    </span>
                  ))}
                </div>
                <DriverComparisonBars rows={driverComparisonRows} t={t} />
              </Box>
            )}
            {hasStockLevels && (
              <Box className={`${tableContainerClass} p-5`}>
                <Typography variant="h6" className="font-bold mb-4 text-foreground">
                  {t('statistics.productStockLevels')}
                </Typography>
                <Box className="grid grid-cols-3 gap-4">
                  {stockLevelsChartData
                    .filter((item) => item.value > 0)
                    .map((item, idx) => {
                    const colorClasses =
                      item.color === 'green'
                        ? 'bg-green-500/10'
                        : item.color === 'orange'
                          ? 'bg-orange-500/10'
                          : 'bg-red-500/10';
                    return (
                      <Box
                        key={idx}
                        className={`rounded-xl p-4 text-center ${colorClasses}`}
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
          </m.div>
          )}
            </m.div>
        </div>
      </div>
    </m.div>
    </>
  );
}

type DriverComparisonRow = DriverComparisonPoint & {
  shortName: string;
  chartCategoryKey: string;
};

/** SVG text must stay high-contrast; muted tokens are often too faint on light cards. */
const DRIVER_CHART_AXIS_TICK = {
  fontSize: 12,
  fill: 'rgb(var(--foreground))',
  fontWeight: 500,
} as const;

function DriverComparisonBars({
  rows,
  t,
}: {
  rows: DriverComparisonRow[];
  t: (key: string) => string;
}) {
  const chartHeight = Math.max(160, rows.length * 40 + 72);
  const rowByCategory = useMemo(() => {
    const categoryMap = new Map<string, DriverComparisonRow>();
    rows.forEach((r) => categoryMap.set(r.chartCategoryKey, r));
    return categoryMap;
  }, [rows]);

  const metrics: {
    key: keyof Pick<DriverComparisonPoint, 'total_orders' | 'average_rating' | 'avg_delivery_time'>;
    title: string;
    hint?: string;
    domain?: [number, number];
    tickFormat: (v: number) => string;
    formatTooltip: (v: number) => string;
  }[] = [
    {
      key: 'total_orders',
      title: t('statistics.driverMetricOrders'),
      tickFormat: formatAxisTick,
      formatTooltip: (v) => Math.round(v).toLocaleString(),
    },
    {
      key: 'average_rating',
      title: t('statistics.driverMetricRating'),
      domain: [0, 5],
      tickFormat: (v) => v.toFixed(1),
      formatTooltip: (v) => `${v.toFixed(1)} / 5`,
    },
    {
      key: 'avg_delivery_time',
      title: t('statistics.driverMetricDelivery'),
      hint: t('statistics.driverDeliveryHint'),
      tickFormat: formatAxisTick,
      formatTooltip: (v) =>
        `${Math.round(v)} ${t('statistics.driverDeliveryUnit')}`,
    },
  ];

  return (
    <Box className="grid gap-6 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Box key={metric.key}>
          <div className="mb-2">
            <Typography variant="caption" className="block font-semibold text-foreground">
              {metric.title}
            </Typography>
            {metric.hint ? (
              <Typography variant="caption" className="mt-0.5 block text-muted-foreground">
                {metric.hint}
              </Typography>
            ) : null}
          </div>
          <Box className="w-full text-foreground" dir="ltr" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="rgb(var(--border))"
                  strokeOpacity={0.55}
                />
                <XAxis
                  type="number"
                  domain={metric.domain ?? ['auto', 'auto']}
                  tick={DRIVER_CHART_AXIS_TICK}
                  tickLine={false}
                  axisLine={{ stroke: 'rgb(var(--border))', strokeWidth: 1 }}
                  tickFormatter={metric.tickFormat}
                />
                <YAxis
                  type="category"
                  dataKey="chartCategoryKey"
                  width={118}
                  tick={DRIVER_CHART_AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(key) => rowByCategory.get(String(key))?.shortName ?? ''}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value, _name, item) => {
                    const row = item?.payload as DriverComparisonRow | undefined;
                    const v = typeof value === 'number' ? value : Number(value);
                    const main =
                      Number.isFinite(v) ? metric.formatTooltip(v) : '—';
                    return [main, row?.driver_name ?? ''];
                  }}
                  cursor={{ fill: 'rgb(var(--muted) / 0.12)' }}
                />
                <Bar
                  {...CHART_ANIM}
                  dataKey={metric.key}
                  radius={[0, 6, 6, 0]}
                  barSize={22}
                  maxBarSize={28}
                >
                  {rows.map((_, i) => (
                    <Cell key={`${metric.key}-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      ))}
    </Box>
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
                        color: opacity > 0.5 ? 'white' : 'rgb(var(--foreground))',
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
