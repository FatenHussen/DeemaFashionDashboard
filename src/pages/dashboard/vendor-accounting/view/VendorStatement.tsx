import type { WithdrawStatus, WithdrawRequest } from '../types';

import { useState } from 'react';
import { paths } from '@/routes/paths';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { withdrawRequestColumns } from '@/columns/one/vendor-accounting/withdraw-requests';

import { CONFIG } from 'src/global-config';

import { useFetchVendorStatement } from '../hooks';
import { ProcessWithdrawRequestModal } from '../components/process-withdraw-request-modal';

// ----------------------------------------------------------------------

const metadata = { title: `Vendor Statement | Dashboard - ${CONFIG.appName}` };

const formatCurrency = (val: number) =>
  val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface WalletStatProps {
  label: string;
  value: string;
  icon: string;
  colorClass: string;
}

function WalletStat({ label, value, icon, colorClass }: WalletStatProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Iconify icon={icon} width={18} height={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground truncate">{label}</div>
        <div className="text-base font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------

export default function VendorStatementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('table');

  const [withdrawPage, setWithdrawPage] = useState(1);
  const [withdrawPerPage, setWithdrawPerPage] = useState(10);
  const [withdrawStatus, setWithdrawStatus] = useState<WithdrawStatus | undefined>(undefined);
  const [processingRequest, setProcessingRequest] = useState<WithdrawRequest | null>(null);

  const { data, isLoading, isError, error, refetch } = useFetchVendorStatement(id!, {
    page: withdrawPage,
    withdraw_per_page: withdrawPerPage,
    withdraw_status: withdrawStatus,
  });

  const vendor = data?.data?.vendor;
  const wallet = data?.data?.wallet;
  const withdrawRequests: WithdrawRequest[] = data?.data?.withdraw_requests?.items ?? [];
  const apiPagination = data?.data?.withdraw_requests?.pagination;
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

  const handleProcessWithdraw = (requestId: number) => {
    const req = withdrawRequests.find((r) => r.id === requestId);
    if (req) setProcessingRequest(req);
  };

  const walletStats = wallet
    ? [
        {
          label: t('vendorAccounting.grossSales'),
          value: formatCurrency(wallet.gross_sales),
          icon: 'solar:chart-2-bold',
          colorClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        },
        {
          label: t('vendorAccounting.platformCommission'),
          value: formatCurrency(wallet.platform_commission),
          icon: 'solar:percent-bold',
          colorClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        },
        {
          label: t('vendorAccounting.discountsShare'),
          value: formatCurrency(wallet.discounts_share),
          icon: 'solar:tag-bold',
          colorClass: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        },
        {
          label: t('vendorAccounting.refunds'),
          value: formatCurrency(wallet.refunds),
          icon: 'solar:arrow-left-bold',
          colorClass: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        },
        {
          label: t('vendorAccounting.netDue'),
          value: formatCurrency(wallet.net_due),
          icon: 'solar:wallet-bold',
          colorClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        },
        {
          label: t('vendorAccounting.paid'),
          value: formatCurrency(wallet.paid),
          icon: 'solar:check-circle-bold',
          colorClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        },
        {
          label: t('vendorAccounting.pendingWithdrawals'),
          value: formatCurrency(wallet.pending_withdrawals),
          icon: 'solar:clock-circle-bold',
          colorClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
        },
        {
          label: t('vendorAccounting.availableForWithdraw'),
          value: formatCurrency(wallet.available_for_withdraw),
          icon: 'solar:banknote-bold',
          colorClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        },
      ]
    : [];

  return (
    <>
      <title>{metadata.title}</title>

      {processingRequest && (
        <ProcessWithdrawRequestModal
          request={processingRequest}
          onClose={() => setProcessingRequest(null)}
          onSuccess={() => {
            setProcessingRequest(null);
            refetch();
          }}
        />
      )}

      <div className="flex flex-col gap-6 p-1">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(paths.dashboard.vendorAccounting.root)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <Iconify icon="solar:arrow-left-bold" width={16} height={16} />
          {t('back')}
        </button>

        {isError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-destructive">
              <Iconify icon="solar:danger-bold" width={18} height={18} className="shrink-0 mt-0.5" />
              <span>{error instanceof Error ? error.message : t('errorLoading')}</span>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              {t('retry')}
            </button>
          </div>
        )}

        {/* Vendor Info Card */}
        {isLoading ? (
          <div className="h-32 rounded-2xl border border-border bg-muted/40 animate-pulse" />
        ) : vendor ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify icon="solar:shop-bold" className="text-primary" width={28} height={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {formatTranslated(vendor.name)}
                  </h2>
                  <p className="text-sm text-muted-foreground">{vendor.owner_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        vendor.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}
                    >
                      <Iconify
                        icon={vendor.is_active ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                        width={12}
                        height={12}
                      />
                      {vendor.is_active ? t('active') : t('inactive')}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t('vendorAccounting.commissionRate')}: {vendor.commission_rate}%
                    </span>
                  </div>
                </div>
              </div>
              {wallet && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{t('vendorAccounting.ordersCount')}</div>
                  <div className="text-2xl font-bold text-foreground">{wallet.orders_count}</div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Wallet Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-border bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : wallet ? (
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">
              {t('vendorAccounting.walletSummary')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {walletStats.map((stat) => (
                <WalletStat key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Withdraw Requests Table */}
        <div>
          <DataTable
            tableName={t('vendorAccounting.withdrawRequests')}
            columns={withdrawRequestColumns(t, handleProcessWithdraw)}
            data={withdrawRequests}
            isLoading={isLoading}
            columnTranslations={{
              id: t('columns.id'),
              vendor: t('columns.vendor'),
              amount: t('vendorAccounting.amount'),
              status: t('columns.status'),
              payment_method: t('vendorAccounting.paymentMethod'),
              requested_at: t('vendorAccounting.requestedAt'),
              actions: t('columns.action') ?? 'Actions',
            }}
            pagination={pagination}
            currentPage={withdrawPage}
            pageSize={withdrawPerPage}
            onPageChange={setWithdrawPage}
            onPageSizeChange={(size) => {
              setWithdrawPerPage(size);
              setWithdrawPage(1);
            }}
            toolbarFilter={
              <select
                value={withdrawStatus ?? ''}
                onChange={(e) => {
                  const val = e.target.value as WithdrawStatus | '';
                  setWithdrawStatus(val || undefined);
                  setWithdrawPage(1);
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t('all')}</option>
                <option value="pending">{t('statusPending')}</option>
                <option value="paid">{t('vendorAccounting.statusPaid')}</option>
                <option value="rejected">{t('statusRejected')}</option>
              </select>
            }
          />
        </div>
      </div>
    </>
  );
}
