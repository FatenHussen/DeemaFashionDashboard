import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchOrders, useChangeOrderStatus } from '@/pages/dashboard/orders/hooks/order';
import { orderColumns, type OrderFormValues } from '@/columns/one/orders/one';
import type { OrderStatus } from '@/pages/dashboard/orders/types/order.types';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Orders | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data: ordersResponse, isLoading, error } = useFetchOrders(currentPage, pageSize, statusFilter, search);
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
        toast.error(err?.message || 'Failed to update status');
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

  return (
    <>
      <title>{metadata.title}</title>

      <div className="flex w-full flex-col">

      {/* Filter bar */}
      <div className="mx-6 mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-card/60 px-4 py-3 shadow-sm rtl:flex-row-reverse">
        {/* Search */}
        <input
          type="text"
          placeholder={t('searchOrders')}
          value={search ?? ''}
          onChange={(e) => {
            setSearch(e.target.value || undefined);
            setCurrentPage(1);
          }}
          className="h-8 w-52 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />

        {/* Divider */}
        <div className="h-5 w-px bg-border/60" />

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5 rtl:flex-row-reverse">
          {(['all', 'pending', 'preparing', 'out_delivery', 'delivered'] as const).map((s) => {
            const labels: Record<string, string> = {
              all: t('all'),
              pending: t('statusPending'),
              preparing: t('statusPreparing'),
              out_delivery: t('statusOutDelivery'),
              delivered: t('statusDelivered'),
            };
            return (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s === 'all' ? undefined : s);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  (s === 'all' && !statusFilter) || statusFilter === s
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>

        {/* Active filter indicator */}
        {(statusFilter || search) && (
          <button
            onClick={() => {
              setStatusFilter(undefined);
              setSearch(undefined);
              setCurrentPage(1);
            }}
            className="ms-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('clearFilters')} ×
          </button>
        )}
      </div>

      <DataTable
        tableName="Order"
        columns={columns}
        data={orderData}
        permissions={{
          create: false,
          update: hasPermission('update', 'order'),
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          order_number: 'Order #',
          user: 'Customer',
          total: 'Total',
          status: 'Status',
          driver: 'Driver',
          created_at: 'Date',
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      </div>
    </>
  );
}
