import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  vendorPackageColumns,
  type VendorPackageFormValues,
} from '@/columns/one/vendor-packages/one';
import {
  useFetchVendorPackages,
  useDeleteVendorPackage,
} from '@/pages/dashboard/vendor/hooks/vendor-package';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filters: Record<string, any> = {};
  if (isActiveFilter !== '') filters.is_active = parseInt(isActiveFilter, 10);
  if (minPrice !== '') filters.min_price = parseFloat(minPrice);
  if (maxPrice !== '') filters.max_price = parseFloat(maxPrice);

  const { data: response, isLoading, error } = useFetchVendorPackages(
    currentPage,
    pageSize,
    Object.keys(filters).length > 0 ? filters : undefined
  );
  const deleteMutation = useDeleteVendorPackage();

  if (error) console.error('Error fetching vendor packages:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleDeleteRequest = (id: number) => setDeletingId(id);
  const handleDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Vendor package deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };
  const handleDeleteCancel = () => setDeletingId(null);

  const items: VendorPackageFormValues[] = response?.data?.items || [];
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

  const resetFilters = () => {
    setIsActiveFilter('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const hasActiveFilters = isActiveFilter !== '' || minPrice !== '' || maxPrice !== '';

  const filterContent = (
    <>
      <select
        value={isActiveFilter}
        onChange={(e) => {
          setIsActiveFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="h-10 min-w-[120px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t('allStatus')}</option>
        <option value="1">{t('active')}</option>
        <option value="0">{t('inactive')}</option>
      </select>
      <input
        type="number"
        placeholder={t('minPrice')}
        value={minPrice}
        onChange={(e) => {
          setMinPrice(e.target.value);
          setCurrentPage(1);
        }}
        className="h-10 w-28 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        type="number"
        placeholder={t('maxPrice')}
        value={maxPrice}
        onChange={(e) => {
          setMaxPrice(e.target.value);
          setCurrentPage(1);
        }}
        className="h-10 w-28 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {t('resetFilter')}
        </button>
      )}
    </>
  );

  return (
    <>
      <title>{t('form.vendorPackagesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.vendorPackage')}
        columns={vendorPackageColumns(
          { update: hasPermission('update', 'vendorpackage'), delete: hasPermission('delete', 'vendorpackage') },
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
        detailsLink="/vendor-packages/details"
        createPath="/vendor-packages/create"
        toolbarFilter={filterContent}
        permissions={{
          create: hasPermission('create', 'vendorpackage'),
          update: hasPermission('update', 'vendorpackage'),
          delete: hasPermission('delete', 'vendorpackage'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          price: t('columns.price'),
          duration_days: t('columns.durationDays'),
          max_products: t('columns.maxProducts'),
          commission_rate: t('columns.commissionPercent'),
          is_active: t('columns.status'),
          active_subscriptions_count: t('columns.activeSubs'),
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
