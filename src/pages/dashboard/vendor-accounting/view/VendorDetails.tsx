import type { ColumnDef } from '@tanstack/react-table';
import type { WithdrawStatus, WithdrawRequest } from '../types';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useFetchVendorStatement } from '../hooks';

// ----------------------------------------------------------------------

function formatCurrency(value: number | undefined | null) {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getVendorName(name: Record<string, string> | undefined) {
  if (!name) return '—';
  return name.en || name.ar || Object.values(name)[0] || '—';
}

const WALLET_CARDS = [
  { key: 'orders_count', label: 'ordersCount', icon: 'solar:cart-2-bold', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50', isMoney: false },
  { key: 'gross_sales', label: 'grossSales', icon: 'solar:chart-bold', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/50', isMoney: true },
  { key: 'platform_commission', label: 'platformCommission', icon: 'solar:dollar-minimalistic-bold', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50', isMoney: true },
  { key: 'discounts_share', label: 'discountsShare', icon: 'solar:tag-bold', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800/50', isMoney: true },
  { key: 'refunds', label: 'refunds', icon: 'solar:arrow-left-bold', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50', isMoney: true },
  { key: 'net_due', label: 'netDue', icon: 'solar:calculator-bold', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/50', isMoney: true },
  { key: 'paid', label: 'paid', icon: 'solar:card-transfer-bold', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/50', isMoney: true },
  { key: 'pending_withdrawals', label: 'pendingWithdrawals', icon: 'solar:clock-circle-bold', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/50', isMoney: true },
  { key: 'available_for_withdraw', label: 'availableForWithdraw', icon: 'solar:wallet-bold', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50', isMoney: true },
];

const STATUS_CONFIG: Record<WithdrawStatus, { icon: string; className: string }> = {
  pending: {
    icon: 'solar:hourglass-bold',
    className: 'border-amber-700 bg-amber-500',
  },
  paid: {
    icon: 'solar:check-circle-bold',
    className: 'border-emerald-800 bg-emerald-600',
  },
  rejected: {
    icon: 'solar:close-circle-bold',
    className: 'border-red-800 bg-red-600',
  },
};

function translateWithdrawPaymentMethod(t: (key: string) => string, method: string | undefined | null) {
  if (!method) return '—';
  if (method === 'bank_transfer') return t('vendorAccounting.bankTransfer');
  if (method === 'cash') return t('vendorAccounting.cash');
  if (method === 'wallet') return t('vendorAccounting.walletMethod');
  if (method === 'other') return t('vendorAccounting.other');
  return method.replace(/_/g, ' ');
}

const WITHDRAW_STATUS_FILTERS: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: 'all', icon: 'solar:list-bold' },
  { key: 'pending', label: 'withdrawStatusPending', icon: 'solar:hourglass-bold' },
  { key: 'paid', label: 'withdrawStatusPaid', icon: 'solar:check-circle-bold' },
  { key: 'rejected', label: 'withdrawStatusRejected', icon: 'solar:close-circle-bold' },
];

export default function VendorAccountingVendorDetailsPage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [withdrawStatus, setWithdrawStatus] = useState<string | undefined>(undefined);

  const params = {
    page: currentPage,
    withdraw_per_page: pageSize,
    withdraw_status: withdrawStatus as 'pending' | 'paid' | 'rejected' | undefined,
  };

  const { data: response, isLoading } = useFetchVendorStatement(vendorId!, params);

  const vendor = response?.data?.vendor;
  const wallet = response?.data?.wallet;
  const withdrawRequests: WithdrawRequest[] = response?.data?.withdraw_requests?.items || [];
  const apiPagination = response?.data?.withdraw_requests?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(
          apiPagination.current_page * apiPagination.per_page,
          apiPagination.total
        ),
      }
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const columns: ColumnDef<WithdrawRequest>[] = [
    {
      id: 'id',
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
      cell: ({ row }) => (
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">{row.original.id}</span>
        </div>
      ),
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.amount')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.original.status as WithdrawStatus;
        const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
        const statusLabel =
          status === 'pending'
            ? t('withdrawStatusPending')
            : status === 'paid'
              ? t('withdrawStatusPaid')
              : t('withdrawStatusRejected');
        return (
          <TableTonedStatusPill icon={config.icon} className={config.className}>
            {statusLabel}
          </TableTonedStatusPill>
        );
      },
    },
    {
      id: 'payment_method',
      accessorKey: 'payment_method',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.paymentMethod')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {translateWithdrawPaymentMethod(t, row.original.payment_method)}
        </span>
      ),
    },
    {
      id: 'requested_at',
      accessorKey: 'requested_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.requestedAt')} />
      ),
      cell: ({ row }) => {
        const date = row.original.requested_at ?? row.original.created_at;
        return (
          <div className="flex items-center gap-2">
            <Iconify icon="solar:calendar-date-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
            <span className="text-sm text-muted-foreground">{date ?? '—'}</span>
          </div>
        );
      },
    },
    {
      id: 'note',
      accessorKey: 'note',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('note')} />
      ),
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate text-sm text-muted-foreground">
          {row.original.note || row.original.rejection_reason || '—'}
        </span>
      ),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col gap-2">
      {WITHDRAW_STATUS_FILTERS.map(({ key, label, icon }) => {
        const active = (key === 'all' && !withdrawStatus) || withdrawStatus === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => { setWithdrawStatus(key === 'all' ? undefined : key); setCurrentPage(1); }}
            className={`inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? 'border-primary/30 bg-primary text-primary-foreground shadow-sm'
                : 'border-border/60 bg-background text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground'
            }`}
          >
            <Iconify icon={icon} width={16} height={16} className="shrink-0" />
            <span>{t(label)}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <title>{t('form.vendorDetailsAccountingDocumentTitle', { appName: CONFIG.appName })}</title>

      <div className="space-y-6 p-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(paths.dashboard.vendorAccounting.vendors)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={16} height={16} />
          {t('backToVendors')}
        </button>

        {/* Vendor Info Header */}
        {isLoading ? (
          <div className="h-20 animate-pulse rounded-xl border border-border/60 bg-muted/30" />
        ) : vendor ? (
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Iconify icon="solar:shop-bold" className="text-primary" width={24} height={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-foreground truncate">
                {getVendorName(vendor.name)}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Iconify icon="solar:user-bold" width={14} height={14} />
                  {vendor.owner_name}
                </span>
                <span className="flex items-center gap-1">
                  <Iconify icon="solar:percent-bold" width={14} height={14} />
                  {t('commissionRateValue', { rate: vendor.commission_rate })}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    vendor.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400'
                  }`}
                >
                  <Iconify
                    icon={vendor.is_active ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                    width={12}
                    height={12}
                  />
                  {vendor.is_active ? t('active') : t('inactive')}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Wallet Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {WALLET_CARDS.map((c) => (
              <div key={c.key} className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/30" />
            ))}
          </div>
        ) : wallet ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {WALLET_CARDS.map((card) => {
              const raw = wallet[card.key as keyof typeof wallet] as number | undefined;
              const display = card.isMoney ? formatCurrency(raw) : (raw?.toLocaleString() ?? '—');
              return (
                <div key={card.key} className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm ${card.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t(card.label)}
                    </span>
                    <Iconify icon={card.icon} width={18} height={18} className={card.color} />
                  </div>
                  <div className={`text-xl font-bold ${card.color}`}>{display}</div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Withdraw Requests Table */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">{t('withdrawRequests')}</h3>
          <DataTable
            tableName={t('tableNames.vendorWithdrawRequests')}
            columns={columns}
            data={withdrawRequests}
            searchColumns={[]}
            filterSidebar={sidebarContent}
            activeFilterCount={withdrawStatus ? 1 : 0}
            onFilterReset={() => { setWithdrawStatus(undefined); setCurrentPage(1); }}
            permissions={{ create: false, update: false, delete: false }}
            isLoading={isLoading}
            columnTranslations={{
              id: t('columns.id'),
              amount: t('columns.amount'),
              status: t('columns.status'),
              payment_method: t('columns.paymentMethod'),
              requested_at: t('columns.requestedAt'),
              note: t('note'),
              actions: t('columns.action'),
            }}
            pagination={pagination}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </div>
      </div>
    </>
  );
}
