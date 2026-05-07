import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchOrders } from '@/pages/dashboard/orders/hooks/order';
import { orderColumns, type OrderFormValues } from '@/columns/one/orders/one';
import { useMemo, useState, useEffect, useCallback, type ReactNode } from 'react';
import { RejectOrderModal } from '@/pages/dashboard/orders/components/RejectOrderModal';
import { AssignDriverModal } from '@/pages/dashboard/orders/components/AssignDriverModal';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: ordersResponse, isLoading, error } = useFetchOrders(
    currentPage,
    pageSize,
    statusFilter,
    search.trim() || undefined
  );
  const [assignDriverOrder, setAssignDriverOrder] = useState<OrderFormValues | null>(null);
  const [rejectOrder, setRejectOrder] = useState<OrderFormValues | null>(null);

  const openAssignDriverModal = useCallback((order: OrderFormValues) => {
    setAssignDriverOrder(order);
  }, []);

  const closeAssignDriverModal = useCallback(() => {
    setAssignDriverOrder(null);
  }, []);

  const openRejectModal = useCallback((order: OrderFormValues) => {
    setRejectOrder(order);
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectOrder(null);
  }, []);

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
          onOpenAssignDriverModal: openAssignDriverModal,
          onOpenRejectModal: openRejectModal,
        }
      ),
    [t, navigate, hasPermission, openAssignDriverModal, openRejectModal]
  );

  const statusChips = [
    { key: 'all' as const, label: t('all'), icon: 'solar:list-bold' },
    { key: 'pending' as const, label: t('statusPending'), icon: 'solar:hourglass-bold' },
    { key: 'preparing' as const, label: t('statusPreparing'), icon: 'solar:chef-hat-bold' },
    { key: 'out_delivery' as const, label: t('statusOutDelivery'), icon: 'solar:delivery-bold' },
    { key: 'delivered' as const, label: t('statusDelivered'), icon: 'solar:check-circle-bold' },
    { key: 'cancelled' as const, label: t('statusCancelled'), icon: 'solar:close-circle-bold' },
    {
      key: 'cancelled_by_admin' as const,
      label: t('statusCancelledByAdmin'),
      icon: 'solar:shield-cross-bold',
    },
    { key: 'faild_deliver' as const, label: t('statusFaildDeliver'), icon: 'solar:danger-triangle-bold' },
    { key: 'returned_by_user' as const, label: t('statusReturnedByUser'), icon: 'solar:undo-left-bold' },
  ];

  const sidebarContent = (
    <FilterGroup label={t('columns.status')}>
      <div className="flex flex-col gap-2">
        {statusChips.map(({ key: s, label, icon }) => {
          const active = (s === 'all' && !statusFilter) || statusFilter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => { setStatusFilter(s === 'all' ? undefined : s); setCurrentPage(1); }}
              className={`inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'border-primary/30 bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/60 bg-background text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground'
              }`}
            >
              <Iconify icon={icon} width={16} height={16} className="shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </FilterGroup>
  );

  return (
    <>
      <title>{t('form.ordersIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <AssignDriverModal
        open={!!assignDriverOrder}
        onClose={closeAssignDriverModal}
        order={assignDriverOrder}
        t={t}
      />

      <RejectOrderModal
        open={!!rejectOrder}
        onClose={closeRejectModal}
        order={rejectOrder}
        t={t}
      />

      <DataTable
        tableName={t("tableNames.order")}
        columns={columns}
        data={orderData}
        hasDetails
        detailsLink="/orders/details"
        filterSidebar={sidebarContent}
        activeFilterCount={statusFilter ? 1 : 0}
        onFilterReset={() => { setStatusFilter(undefined); setCurrentPage(1); }}
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
          payment_method: t('columns.paymentMethod'),
          status: t('columns.status'),
          driver: t('columns.driver'),
          created_at: t('columns.date'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={setSearch}
        searchPlaceholder={t('searchOrders')}
      />
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
