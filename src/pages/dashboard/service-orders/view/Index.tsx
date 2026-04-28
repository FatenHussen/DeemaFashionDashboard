import type { ServiceOrderStatus } from '../types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useMemo, useState, useEffect, useCallback, type ReactNode } from 'react';
import { serviceOrderColumns, type ServiceOrderRow } from '@/columns/one/service-orders/one';

import { CONFIG } from 'src/global-config';

import { useFetchServiceOrders, useChangeServiceOrderStatus } from '../hooks';

// ----------------------------------------------------------------------

const STATUS_FILTERS: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: 'all', icon: 'solar:list-bold' },
  { key: 'pending', label: 'statusPending', icon: 'solar:hourglass-bold' },
  { key: 'confirmed', label: 'statusConfirmed', icon: 'solar:check-circle-bold' },
  { key: 'in_progress', label: 'statusInProgress', icon: 'solar:play-circle-bold' },
  { key: 'completed', label: 'statusCompleted', icon: 'solar:check-square-bold' },
  { key: 'canceled', label: 'statusCancelled', icon: 'solar:close-circle-bold' },
  { key: 'rejected', label: 'statusRejected', icon: 'solar:close-square-bold' },
];

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [changingOrderId, setChangingOrderId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: response, isLoading } = useFetchServiceOrders(
    currentPage,
    pageSize,
    statusFilter,
    search.trim() || undefined
  );
  const changeStatusMutation = useChangeServiceOrderStatus();

  const handleStatusChange = useCallback(
    async (orderId: number, newStatus: ServiceOrderStatus) => {
      setChangingOrderId(orderId);
      try {
        await changeStatusMutation.mutateAsync({ id: orderId, status: newStatus });
        toast.success(t('statusChangedSuccess'));
      } catch (err: any) {
        toast.error(err?.message || t('statusChangeFailed'));
      } finally {
        setChangingOrderId(null);
      }
    },
    [changeStatusMutation, t]
  );

  const items: ServiceOrderRow[] = response?.data?.items || [];
  const apiPagination = response?.data?.pagination;
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

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  const columns = useMemo(
    () =>
      serviceOrderColumns(
        { update: hasPermission('update', 'serviceorder') },
        t,
        handleStatusChange,
        changingOrderId
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleStatusChange, changingOrderId]
  );

  const sidebarContent = (
    <FilterGroup label={t('columns.status')}>
      <div className="flex flex-col gap-2">
        {STATUS_FILTERS.map(({ key, label, icon }) => {
          const active = (key === 'all' && !statusFilter) || statusFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => { setStatusFilter(key === 'all' ? undefined : key); setCurrentPage(1); }}
              className={`inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
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
    </FilterGroup>
  );

  return (
    <>
      <title>{t('form.serviceOrdersIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.serviceOrder')}
        columns={columns}
        data={items}
        filterSidebar={sidebarContent}
        activeFilterCount={statusFilter ? 1 : 0}
        onFilterReset={() => { setStatusFilter(undefined); setCurrentPage(1); }}
        permissions={{
          create: false,
          update: hasPermission('update', 'serviceorder'),
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          user: t('columns.user'),
          shop: t('columns.shop'),
          vendor_service: t('columns.vendorService'),
          status: t('columns.status'),
          scheduled_at: t('columns.scheduledAt'),
          created_at: t('columns.createdAt'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        onSearchChange={setSearch}
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
