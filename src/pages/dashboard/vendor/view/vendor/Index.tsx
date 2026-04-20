import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { vendorColumns, type VendorFormValues } from '@/columns/one/vendor/one';
import { useFetchVendors, useDeleteVendor } from '@/pages/dashboard/vendor/hooks/vendor';

import { CONFIG } from 'src/global-config';

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

  const { data: vendorsResponse, isLoading, error } = useFetchVendors(
    currentPage,
    pageSize,
    search.trim() ? { search: search.trim() } : undefined
  );
  const deleteVendorMutation = useDeleteVendor();

  if (error) console.error('Error fetching vendors:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteVendorMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };
  const onDeleteCancel = () => setDeletingId(null);

  const vendorData: VendorFormValues[] = vendorsResponse?.data?.items || [];
  const apiPagination = vendorsResponse?.data?.pagination;
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
      <title>{t('form.vendorsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t("tableNames.vendor")}
        columns={vendorColumns(
          {
            update: hasPermission('update', 'vendor'),
            delete: hasPermission('delete', 'vendor'),
          },
          t,
          onDelete,
          deleteVendorMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={vendorData}
        createPath="/vendor/create"
        hasDetails
        detailsLink="/vendor/update"
        permissions={{
          create: hasPermission('create', 'vendor'),
          update: hasPermission('update', 'vendor'),
          delete: hasPermission('delete', 'vendor'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          owner_name: t('columns.ownerName'),
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
