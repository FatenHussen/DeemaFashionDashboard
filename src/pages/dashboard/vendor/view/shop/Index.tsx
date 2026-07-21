import { toast } from 'react-toastify';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { useState, useEffect, type ReactNode } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { shopColumns, type ShopFormValues } from '@/columns/one/shop/one';
import { useFetchShops, useDeleteShop } from '@/pages/dashboard/vendor/hooks/shop';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const SHOP_STATUS_FILTERS: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: 'all', icon: 'solar:list-bold' },
  { key: 'open', label: 'shopStatusFilterOpen', icon: 'solar:shop-2-bold' },
  { key: 'closed', label: 'shopStatusFilterClosed', icon: 'solar:close-circle-bold' },
  { key: 'active', label: 'shopStatusFilterActive', icon: 'solar:check-circle-bold' },
  { key: 'inactive', label: 'shopStatusFilterInactive', icon: 'solar:moon-sleep-bold' },
];

export default function Page() {
  const { t } = useTranslation('table');
  const { pathname } = useLocation();
  const isRestaurantRoute = pathname.startsWith('/restaurants');
  const basePath = isRestaurantRoute ? '/restaurants' : '/shop';
  const forcedShopType = isRestaurantRoute ? 'restaurant' : 'store';

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [shopStatusFilter, setShopStatusFilter] = useState('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Fetch shops using the hook
  const { data: shopsResponse, isLoading, error } = useFetchShops(currentPage, pageSize, {
    ...(shopStatusFilter ? { shop_status: shopStatusFilter } : {}),
    shop_type: forcedShopType,
    ...(search.trim() ? { search: search.trim() } : {}),
  });
  const deleteShopMutation = useDeleteShop();

  // Log error for debugging
  if (error) {
    console.error('Error fetching shops:', error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const onDelete = (id: number) => {
    setDeletingId(id);
  };

  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteShopMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const shopData: ShopFormValues[] = shopsResponse?.data?.items || [];
  const apiPagination = shopsResponse?.data?.pagination;
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

  const sidebarContent = (
    <div className="flex flex-col gap-5">
      <FilterGroup label={t('shopStatusFilterLabel')}>
        <div className="flex flex-col gap-2">
          {SHOP_STATUS_FILTERS.map(({ key, label, icon }) => {
            const active = (key === 'all' && !shopStatusFilter) || shopStatusFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setShopStatusFilter(key === 'all' ? '' : key);
                  setCurrentPage(1);
                }}
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

    </div>
  );

  return (
    <>
      <title>
        {isRestaurantRoute
          ? t('form.restaurantsIndexDocumentTitle', { appName: CONFIG.appName })
          : t('form.shopsIndexDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <DataTable
        tableName={isRestaurantRoute ? t('tableNames.restaurants') : t('tableNames.shop')}
        filterSidebar={sidebarContent}
        activeFilterCount={shopStatusFilter ? 1 : 0}
        onFilterReset={() => {
          setShopStatusFilter('');
          setCurrentPage(1);
        }}
        columns={shopColumns(
          {
            update: hasPermission('update', 'shop'),
            delete: hasPermission('delete', 'shop'),
          },
          t,
          onDelete,
          deleteShopMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          {
            viewDetailsBase: `${basePath}/details`,
            editItemBase: `${basePath}/update`,
          },
          { hideShopTypeColumn: true }
        )}
        data={shopData}
        createPath={`${basePath}/create`}
        hasDetails
        detailsLink={`${basePath}/details`}
        permissions={{
          create: hasPermission('create', 'shop'),
          update: hasPermission('update', 'shop'),
          delete: hasPermission('delete', 'shop'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          vendor: t('columns.vendor'),
          rating: t('columns.rating'),
          is_open_now: t('columns.openNow'),
          status: t('columns.status'),
          created_at: t('columns.createdAt'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
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
