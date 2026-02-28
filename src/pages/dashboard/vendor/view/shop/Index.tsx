import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { shopColumns, type ShopFormValues } from '@/columns/one/shop/one';
import { useFetchShops, useDeleteShop } from '@/pages/dashboard/vendor/hooks/shop';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Shops | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch shops using the hook
  const { data: shopsResponse, isLoading, error } = useFetchShops(currentPage, pageSize);
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
        toast.success(t('deleteSuccess') || 'Shop deleted successfully');
        setDeletingId(null);
      } catch {}
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

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName="Shop"
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
          deletingId
        )}
        data={shopData}
        createPath="/shop/create"
        hasDetails
        detailsLink="/shop/details"
        permissions={{
          create: hasPermission('create', 'shop'),
          update: hasPermission('update', 'shop'),
          delete: hasPermission('delete', 'shop'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          vendor: 'Vendor',
          rating: 'Rating',
          is_open_now: 'Open Now',
          status: 'Status',
          created_at: 'Created At',
          actions: 'Actions',
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
