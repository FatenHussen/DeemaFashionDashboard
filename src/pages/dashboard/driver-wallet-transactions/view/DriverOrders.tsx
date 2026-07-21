import type { ReactNode } from 'react';
import type { OrderFormValues } from '@/columns/one/orders/one';

import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { Iconify } from '@/shared/components/iconify';
import { orderColumns } from '@/columns/one/orders/one';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { useFetchOrders } from '@/pages/dashboard/orders/hooks/order';
import { useParams, useNavigate, useSearchParams } from 'react-router';

import { CONFIG } from 'src/global-config';

export default function DriverOrdersPage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const { driverId } = useParams<{ driverId: string }>();
  const [searchParams] = useSearchParams();
  const driverName = searchParams.get('driver_name')?.trim() || '';

  const parsedDriverId = Number(driverId);
  const safeDriverId =
    Number.isFinite(parsedDriverId) && parsedDriverId > 0 ? parsedDriverId : undefined;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, safeDriverId]);

  const { data: ordersResponse, isLoading } = useFetchOrders(
    currentPage,
    pageSize,
    statusFilter,
    search.trim() || undefined,
    safeDriverId
  );

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

  const columns = useMemo(
    () => orderColumns({ update: false, delete: false }, t, navigate),
    [t, navigate]
  );

  const statusChips = [
    { key: 'all' as const, label: t('all'), icon: 'solar:list-bold' },
    { key: 'pending' as const, label: t('statusPending'), icon: 'solar:hourglass-bold' },
    { key: 'preparing' as const, label: t('statusPreparing'), icon: 'solar:chef-hat-bold' },
    { key: 'out_delivery' as const, label: t('statusOutDelivery'), icon: 'solar:delivery-bold' },
    { key: 'delivered' as const, label: t('statusDelivered'), icon: 'solar:check-circle-bold' },
    { key: 'cancelled' as const, label: t('statusCancelled'), icon: 'solar:close-circle-bold' },
  ];

  const sidebarContent = (
    <FilterGroup label={t('columns.status')}>
      <div className="flex flex-col gap-2">
        {statusChips.map(({ key, label, icon }) => {
          const active = (key === 'all' && !statusFilter) || statusFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key === 'all' ? undefined : key)}
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
      <title>{t('form.driverOrdersDocumentTitle', { appName: CONFIG.appName })}</title>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('columns.driver')}</p>
            <p className="truncate text-sm font-semibold">
              {driverName || `${t('columns.driver')} #${safeDriverId ?? '-'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/driver-wallet-transactions')}
            className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted/40"
          >
            <Iconify icon="solar:arrow-left-bold" width={14} height={14} />
            {t('form.backToDriversList')}
          </button>
        </div>

        <DataTable
          tableName={t('tableNames.order')}
          columns={columns}
          data={orderData}
          hasDetails
          detailsLink="/orders/details"
          filterSidebar={sidebarContent}
          activeFilterCount={statusFilter ? 1 : 0}
          onFilterReset={() => {
            setStatusFilter(undefined);
            setCurrentPage(1);
          }}
          permissions={{ create: false, update: false, delete: false }}
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
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onSearchChange={setSearch}
          searchPlaceholder={t('searchOrders')}
        />
      </div>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
