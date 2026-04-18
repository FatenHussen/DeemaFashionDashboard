import type { ReactNode } from 'react';
import type { VendorAccountingRow, VendorSettlementCycle } from '../types';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { vendorAccountingColumns } from '@/columns/one/vendor-accounting/vendors';

import { CONFIG } from 'src/global-config';

import { useFetchVendorAccounting, useFetchVendorAccountingSummary } from '../hooks';

// ----------------------------------------------------------------------

const metadata = { title: `Vendor Accounting | Dashboard - ${CONFIG.appName}` };

const formatCurrency = (val: number) =>
  val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface SummaryCardProps {
  label: string;
  value: string;
  icon: string;
  colorClass: string;
}

function SummaryCard({ label, value, icon, colorClass }: SummaryCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Iconify icon={icon} width={20} height={20} />
        </div>
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  );
}

// ----------------------------------------------------------------------

export default function VendorAccountingPage() {
  const { t } = useTranslation('table');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [settlementCycle, setSettlementCycle] = useState<'' | VendorSettlementCycle>('');
  const [appliedRange, setAppliedRange] = useState<{
    from_date?: string;
    to_date?: string;
    settlement_cycle?: VendorSettlementCycle;
  }>({});

  const { data: summaryData, isLoading: summaryLoading, isError: summaryError, error: summaryErr } =
    useFetchVendorAccountingSummary(appliedRange);
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    isError: vendorsQueryError,
    error: vendorsErr,
    refetch: refetchVendors,
  } = useFetchVendorAccounting({
    page: currentPage,
    per_page: pageSize,
    search: search || undefined,
    is_active: isActiveFilter !== '' ? isActiveFilter === 'true' : undefined,
    ...appliedRange,
  });

  const applySidebarFilters = () => {
    setSearch(searchInput);
    setAppliedRange({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      settlement_cycle: settlementCycle || undefined,
    });
    setCurrentPage(1);
  };

  const resetSidebarFilters = () => {
    setSearchInput('');
    setSearch('');
    setIsActiveFilter('');
    setFromDate('');
    setToDate('');
    setSettlementCycle('');
    setAppliedRange({});
    setCurrentPage(1);
  };

  const activeFilterCount = [
    search,
    isActiveFilter,
    appliedRange.from_date,
    appliedRange.to_date,
    appliedRange.settlement_cycle,
  ].filter(Boolean).length;

  const summary = summaryData?.data;
  const items: VendorAccountingRow[] = vendorsData?.data?.items ?? [];
  const apiPagination = vendorsData?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(apiPagination.current_page * apiPagination.per_page, apiPagination.total),
      }
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const summaryCards = summary
    ? [
        {
          label: t('vendorAccounting.grossSales'),
          value: formatCurrency(summary.gross_sales),
          icon: 'solar:chart-2-bold',
          colorClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        },
        {
          label: t('vendorAccounting.platformCommission'),
          value: formatCurrency(summary.platform_commission),
          icon: 'solar:percent-bold',
          colorClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        },
        {
          label: t('vendorAccounting.discountsShare'),
          value: formatCurrency(summary.discounts_share),
          icon: 'solar:tag-bold',
          colorClass: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        },
        {
          label: t('vendorAccounting.refunds'),
          value: formatCurrency(summary.refunds),
          icon: 'solar:arrow-left-bold',
          colorClass: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        },
        {
          label: t('vendorAccounting.netDue'),
          value: formatCurrency(summary.net_due),
          icon: 'solar:wallet-bold',
          colorClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        },
        {
          label: t('vendorAccounting.paid'),
          value: formatCurrency(summary.paid),
          icon: 'solar:check-circle-bold',
          colorClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        },
        {
          label: t('vendorAccounting.pendingWithdrawals'),
          value: formatCurrency(summary.pending_withdrawals),
          icon: 'solar:clock-circle-bold',
          colorClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
        },
        {
          label: t('vendorAccounting.availableForWithdraw'),
          value: formatCurrency(summary.available_for_withdraw),
          icon: 'solar:banknote-bold',
          colorClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        },
      ]
    : [];

  return (
    <>
      <title>{metadata.title}</title>

      <div className="flex flex-col gap-6 p-1">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Iconify icon="solar:wallet-money-bold" className="text-primary" width={22} height={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {t('vendorAccounting.pageTitle')}
            </h1>
            {summary && !summaryLoading && (
              <p className="text-sm text-muted-foreground">
                {summary.vendors_count} {t('vendorAccounting.totalVendors')} •{' '}
                {summary.active_vendors_count} {t('vendorAccounting.activeVendors')}
              </p>
            )}
          </div>
        </div>

        {summaryError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {summaryErr instanceof Error ? summaryErr.message : t('errorLoading')}
          </div>
        )}

        {vendorsQueryError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-destructive">
              {vendorsErr instanceof Error ? vendorsErr.message : t('errorLoading')}
            </span>
            <button
              type="button"
              onClick={() => refetchVendors()}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-destructive/10 self-start sm:self-auto"
            >
              {t('retry')}
            </button>
          </div>
        )}

        {/* Summary Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-border bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <SummaryCard key={card.label} {...card} />
            ))}
          </div>
        )}

        {/* Vendors Table — filters in shared table sidebar */}
        <DataTable
          tableName={t('tableNames.vendorAccounting')}
          columns={vendorAccountingColumns(t)}
          data={items}
          searchColumns={[]}
          filterSidebar={
            <div className="flex flex-col gap-5">
              <FilterGroup label={t('filterSearch')}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('vendorAccounting.searchVendors')}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </FilterGroup>

              <FilterGroup label={t('filterByActive')}>
                {[
                  { key: '', label: t('all') },
                  { key: 'true', label: t('active') },
                  { key: 'false', label: t('inactive') },
                ].map(({ key, label }) => (
                  <button
                    key={key || 'all'}
                    type="button"
                    onClick={() => {
                      setIsActiveFilter(key);
                      setCurrentPage(1);
                    }}
                    className={`inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      isActiveFilter === key
                        ? 'border-primary/30 bg-primary text-primary-foreground shadow-sm'
                        : 'border-border/60 bg-background text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </FilterGroup>

              <FilterGroup label={t('fromDate')}>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </FilterGroup>

              <FilterGroup label={t('toDate')}>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </FilterGroup>

              <FilterGroup label={t('vendorAccounting.filterSettlementCycle')}>
                <select
                  value={settlementCycle}
                  onChange={(e) => setSettlementCycle(e.target.value as '' | VendorSettlementCycle)}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                >
                  <option value="">{t('all')}</option>
                  <option value="weekly">{t('vendorAccounting.settlementWeekly')}</option>
                  <option value="monthly">{t('vendorAccounting.settlementMonthly')}</option>
                </select>
              </FilterGroup>
            </div>
          }
          activeFilterCount={activeFilterCount}
          onFilterReset={resetSidebarFilters}
          onFilterApply={applySidebarFilters}
          permissions={{ create: false, update: false, delete: false }}
          isLoading={vendorsLoading}
          columnTranslations={{
            vendor: t('columns.vendor'),
            commission_rate: t('vendorAccounting.commissionRate'),
            gross_sales: t('vendorAccounting.grossSales'),
            platform_commission: t('vendorAccounting.platformCommission'),
            net_due: t('vendorAccounting.netDue'),
            paid: t('vendorAccounting.paid'),
            available_for_withdraw: t('vendorAccounting.availableForWithdraw'),
            status: t('columns.status'),
            actions: t('columns.action') ?? 'Actions',
          }}
          pagination={pagination}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
