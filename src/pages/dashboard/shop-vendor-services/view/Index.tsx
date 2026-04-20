import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  shopVendorServiceColumns,
  type ShopVendorServiceRow,
} from '@/columns/one/shop-vendor-services/one';

import { CONFIG } from 'src/global-config';

import { useFetchShopVendorServices, useDeleteShopVendorService } from '../hooks';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: response, isLoading } = useFetchShopVendorServices(
    currentPage,
    pageSize,
    search.trim() || undefined
  );
  const deleteMutation = useDeleteShopVendorService();

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteCancel = () => setDeletingId(null);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch {
        return;
      }
    }
  };

  const items: ShopVendorServiceRow[] = response?.data?.items || [];
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

  return (
    <>
      <title>{t('form.shopVendorServicesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.shopVendorService')}
        columns={shopVendorServiceColumns(
          {
            update: hasPermission('update', 'shopvendorservice'),
            delete: hasPermission('delete', 'shopvendorservice'),
          },
          t,
          onDelete,
          deleteMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={items}
        createPath="/shop-vendor-services/create"
        hasDetails
        detailsLink="/shop-vendor-services/update"
        permissions={{
          create: hasPermission('create', 'shopvendorservice'),
          update: hasPermission('update', 'shopvendorservice'),
          delete: hasPermission('delete', 'shopvendorservice'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          shop: t('columns.shop'),
          vendor_service: t('columns.vendorService'),
          price: t('columns.price'),
          duration: t('columns.duration'),
          status: t('columns.status'),
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
