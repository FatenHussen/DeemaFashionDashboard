import type { OrderStatus } from '@/pages/dashboard/orders/types/order.types';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { orderColumns, type OrderFormValues } from '@/columns/one/orders/one';
import { useFetchOrders, useChangeOrderStatus } from '@/pages/dashboard/orders/hooks/order';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Orders | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(undefined);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      const v = searchInput.trim();
      setDebouncedSearch(v || undefined);
    }, 400);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data: ordersResponse, isLoading, error } = useFetchOrders(
    currentPage,
    pageSize,
    statusFilter,
    debouncedSearch
  );
  const changeStatusMutation = useChangeOrderStatus();
  const [changingOrderId, setChangingOrderId] = useState<number | null>(null);

  const handleStatusChange = useCallback(
    async (orderId: number, newStatus: OrderStatus) => {
      setChangingOrderId(orderId);
      try {
        await changeStatusMutation.mutateAsync({
          id: orderId,
          data: { status: newStatus },
        });
        toast.success(t('statusChangedSuccess'));
      } catch (err: any) {
        toast.error(err?.message || t('statusChangeFailed'));
      } finally {
        setChangingOrderId(null);
      }
    },
    [changeStatusMutation, t]
  );

  if (error) {
    console.error('Error fetching orders:', error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const orderData: OrderFormValues[] = ordersResponse?.data?.items || [];
  const apiPagination = ordersResponse?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(apiPagination.current_page * apiPagination.per_page, apiPagination.total),
      }
    : {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  const columns = useMemo(
    () =>
      orderColumns(
        { update: hasPermission('update', 'order'), delete: false },
        t,
        navigate,
        {
          onStatusChange: handleStatusChange,
          changingOrderId,
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleStatusChange, changingOrderId]
  );

  const statusChips = [
    { key: 'all' as const, label: t('all'), icon: 'solar:list-bold' },
    { key: 'pending' as const, label: t('statusPending'), icon: 'solar:hourglass-bold' },
    { key: 'preparing' as const, label: t('statusPreparing'), icon: 'solar:chef-hat-bold' },
    { key: 'out_delivery' as const, label: t('statusOutDelivery'), icon: 'solar:delivery-bold' },
    { key: 'delivered' as const, label: t('statusDelivered'), icon: 'solar:check-circle-bold' },
    { key: 'cancelled' as const, label: t('statusCancelled'), icon: 'solar:close-circle-bold' },
  ];

  const filterContent = (
    <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
      {/* Single API search — full width on small screens */}
      <div className="relative min-w-0 flex-1 max-w-full lg:max-w-md">
        <span className="pointer-events-none absolute start-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
          <Iconify icon="solar:magnifer-bold" width={18} height={18} />
        </span>
        <input
          type="search"
          enterKeyHint="search"
          placeholder={t('searchOrders')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-11 w-full rounded-2xl border border-border/60 bg-background/90 py-2.5 ps-10 pe-10 text-sm shadow-sm backdrop-blur-sm transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/25"
          aria-label={t('searchOrders')}
        />
        {searchInput ? (
          <button
            type="button"
            onClick={() => setSearchInput('')}
            className="absolute end-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t('clear')}
          >
            <Iconify icon="solar:close-circle-bold" width={18} height={18} />
          </button>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusChips.map(({ key: s, label, icon }) => {
            const active = (s === 'all' && !statusFilter) || statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusFilter(s === 'all' ? undefined : s);
                  setCurrentPage(1);
                }}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition-all duration-200 sm:text-sm ${
                  active
                    ? 'border-primary/30 bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/25 scale-[1.02]'
                    : 'border-border/70 bg-card/80 text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground active:scale-[0.98]'
                }`}
              >
                <Iconify icon={icon} width={16} height={16} className="shrink-0 opacity-90" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>

        {(statusFilter || debouncedSearch) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter(undefined);
              setSearchInput('');
              setDebouncedSearch(undefined);
              setCurrentPage(1);
            }}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-all hover:bg-destructive/15 sm:self-center sm:text-sm"
          >
            <Iconify icon="solar:restart-bold" width={16} height={16} />
            {t('clearFilters')}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName={t("tableNames.order")}
        columns={columns}
        data={orderData}
        searchColumns={[]}
        toolbarFilter={filterContent}
        permissions={{
          create: false,
          update: hasPermission('update', 'order'),
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          order_code: t('columns.orderNumber'),
          user: t('columns.user'),
          total: t('columns.total'),
          status: t('columns.status'),
          driver: t('columns.driver'),
          created_at: t('columns.date'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}
