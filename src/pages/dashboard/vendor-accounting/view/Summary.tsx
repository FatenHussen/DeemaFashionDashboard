import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { formatDecimal } from '@/utils/format-currency';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useFetchVendorAccountingSummary } from '../hooks';

// ----------------------------------------------------------------------

type SummaryCard = {
  label: string;
  key: string;
  icon: string;
  color: string;
  bg: string;
  isMoney: boolean;
};

const SUMMARY_CARDS: SummaryCard[] = [
  {
    label: 'totalVendors',
    key: 'vendors_count',
    icon: 'solar:shop-bold',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50',
    isMoney: false,
  },
  {
    label: 'activeVendors',
    key: 'active_vendors_count',
    icon: 'solar:check-circle-bold',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50',
    isMoney: false,
  },
  {
    label: 'grossSales',
    key: 'gross_sales',
    icon: 'solar:chart-bold',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/50',
    isMoney: true,
  },
  {
    label: 'platformCommission',
    key: 'platform_commission',
    icon: 'solar:dollar-minimalistic-bold',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50',
    isMoney: true,
  },
  {
    label: 'discountsShare',
    key: 'discounts_share',
    icon: 'solar:tag-bold',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800/50',
    isMoney: true,
  },
  {
    label: 'refunds',
    key: 'refunds',
    icon: 'solar:arrow-left-bold',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50',
    isMoney: true,
  },
  {
    label: 'netDue',
    key: 'net_due',
    icon: 'solar:calculator-bold',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/50',
    isMoney: true,
  },
  {
    label: 'paid',
    key: 'paid',
    icon: 'solar:card-transfer-bold',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/50',
    isMoney: true,
  },
  {
    label: 'pendingWithdrawals',
    key: 'pending_withdrawals',
    icon: 'solar:clock-circle-bold',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/50',
    isMoney: true,
  },
  {
    label: 'availableForWithdraw',
    key: 'available_for_withdraw',
    icon: 'solar:wallet-bold',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50',
    isMoney: true,
  },
];

export default function VendorAccountingSummaryPage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedParams, setAppliedParams] = useState<{
    from_date?: string;
    to_date?: string;
  }>({});

  const { data: response, isLoading } = useFetchVendorAccountingSummary(appliedParams);
  const summary = response?.data;

  const handleApply = () => {
    setAppliedParams({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    });
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setAppliedParams({});
  };

  return (
    <>
      <title>{t('form.vendorAccountingSummaryDocumentTitle', { appName: CONFIG.appName })}</title>

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">{t('vendorAccountingTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('vendorAccountingSubtitle')}</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('fromDate')}
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('toDate')}
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Iconify icon="solar:filter-bold" width={16} height={16} />
              {t('apply')}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <Iconify icon="solar:refresh-bold" width={16} height={16} />
              {t('clear')}
            </button>
          </div>
          <div className="ms-auto">
            <button
              type="button"
              onClick={() => navigate(paths.dashboard.vendorAccounting.vendors)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-medium text-primary transition hover:bg-primary/10"
            >
              <Iconify icon="solar:users-group-two-rounded-bold" width={16} height={16} />
              {t('viewVendorsList')}
              <Iconify icon="solar:arrow-right-bold" width={14} height={14} />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {SUMMARY_CARDS.map((card) => (
              <div
                key={card.key}
                className="h-28 animate-pulse rounded-xl border border-border/60 bg-muted/30"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {SUMMARY_CARDS.map((card) => {
              const raw = summary?.[card.key as keyof typeof summary] as number | undefined;
              const display = card.isMoney ? formatDecimal(raw) : (raw?.toLocaleString() ?? '—');
              return (
                <div
                  key={card.key}
                  className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm ${card.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t(card.label)}
                    </span>
                    <div className={`rounded-lg p-1.5 ${card.bg}`}>
                      <Iconify icon={card.icon} width={20} height={20} className={card.color} />
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${card.color}`}>{display}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate(paths.dashboard.vendorAccounting.vendors)}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5 text-start shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="rounded-xl bg-primary/10 p-3">
              <Iconify icon="solar:users-group-two-rounded-bold" className="text-primary" width={24} height={24} />
            </div>
            <div>
              <div className="font-semibold text-foreground">{t('vendorAccountingVendors')}</div>
              <div className="text-sm text-muted-foreground">{t('vendorAccountingVendorsDesc')}</div>
            </div>
            <Iconify icon="solar:arrow-right-bold" className="ms-auto text-muted-foreground" width={18} height={18} />
          </button>
          <button
            type="button"
            onClick={() => navigate(paths.dashboard.vendorWithdrawRequests)}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5 text-start shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="rounded-xl bg-amber-500/10 p-3">
              <Iconify icon="solar:wallet-money-bold" className="text-amber-500" width={24} height={24} />
            </div>
            <div>
              <div className="font-semibold text-foreground">{t('vendorWithdrawRequests')}</div>
              <div className="text-sm text-muted-foreground">{t('vendorWithdrawRequestsDesc')}</div>
            </div>
            <Iconify icon="solar:arrow-right-bold" className="ms-auto text-muted-foreground" width={18} height={18} />
          </button>
        </div>
      </div>
    </>
  );
}
