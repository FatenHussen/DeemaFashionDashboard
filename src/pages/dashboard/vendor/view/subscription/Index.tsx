import type { TFunction } from 'i18next';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useState, type ReactNode } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { paths } from '@/routes/paths';
import {
  useFetchVendorSubscriptions,
  useDeleteVendorSubscription,
} from '@/pages/dashboard/vendor/hooks/vendor-subscription';
import { VENDOR_SUBSCRIPTION_STATUSES } from '@/pages/dashboard/vendor/types/vendor-subscription.types';
import {
  vendorSubscriptionColumns,
  type VendorSubscriptionFormValues,
} from '@/columns/one/vendor-subscriptions/one';

import { CONFIG } from 'src/global-config';

function vendorSubscriptionStatusOptionLabel(status: string, t: TFunction<'table'>): string {
  const s = String(status).toLowerCase();
  if (s === 'active') return t('active');
  if (s === 'expired') return t('expired');
  if (s === 'cancelled') return t('statusCancelled');
  if (s === 'pending') return t('columns.pending');
  return status;
}

export default function Page() {
  const { t } = useTranslation('table');
  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const deleteMutation = useDeleteVendorSubscription();

  const { data: response, isLoading, error } = useFetchVendorSubscriptions(
    currentPage,
    pageSize,
    {
      status: statusFilter || undefined,
      search: appliedSearch || undefined,
    }
  );

  if (error) console.error('Error fetching vendor subscriptions:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleApplySearch = () => {
    setAppliedSearch(search);
    setCurrentPage(1);
  };

  const handleDeleteRequest = (id: number) => setDeletingId(id);
  const handleDeleteConfirm = async () => {
    if (deletingId != null) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch {
        return;
      }
    }
  };
  const handleDeleteCancel = () => setDeletingId(null);

  const items: VendorSubscriptionFormValues[] = response?.data?.items || [];
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

  const toolbarSearch = (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
        placeholder={t('searchByShopName')}
        className="h-10 min-w-[180px] flex-1 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50"
      />
      <button
        type="button"
        onClick={handleApplySearch}
        className="h-10 rounded-xl border border-input bg-background px-4 text-sm font-medium hover:bg-muted shrink-0"
      >
        {t('apply')}
      </button>
    </div>
  );

  const sidebarContent = (
    <FilterGroup label={t('columns.status')}>
      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t('allStatuses')}</option>
        {VENDOR_SUBSCRIPTION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {vendorSubscriptionStatusOptionLabel(s, t)}
          </option>
        ))}
      </select>
    </FilterGroup>
  );

  return (
    <>
      <title>{t('form.vendorSubscriptionsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.vendorSubscription')}
        columns={vendorSubscriptionColumns(
          {
            update: false,
            delete: hasPermission('remove', 'vendorsubscription'),
          },
          t,
          handleDeleteRequest,
          deleteMutation.isPending,
          deletingId !== null,
          handleDeleteConfirm,
          handleDeleteCancel,
          deletingId
        )}
        data={items}
        hasDetails
        detailsLink="/vendor-subscriptions"
        createPath={paths.dashboard.vendorSubscriptionsCreate}
        toolbarFilter={toolbarSearch}
        filterSidebar={sidebarContent}
        activeFilterCount={statusFilter ? 1 : 0}
        onFilterReset={() => { setStatusFilter(''); setCurrentPage(1); }}
        permissions={{
          create: hasPermission('create', 'vendorsubscription'),
          update: false,
          delete: hasPermission('remove', 'vendorsubscription'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          shop_name: t('columns.shop'),
          package: t('columns.package'),
          starts_at: t('vendorSubscriptionStartsAt'),
          ends_at: t('vendorSubscriptionEndsAt'),
          auto_renew: t('columns.autoRenew'),
          status: t('columns.status'),
          created_at: t('columns.created'),
          actions: t('columns.action'),
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

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
