import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { WARRANTY_PERMISSION } from '@/pages/dashboard/warranties/permissions';
import { warrantyColumns, type WarrantyTableItem } from '@/columns/one/warranties/one';
import { useDeleteWarranty, useFetchWarranties } from '@/pages/dashboard/warranties/hooks/warranty';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: response, isLoading } = useFetchWarranties({
    page: currentPage,
    per_page: pageSize,
    ...(search.trim() ? { name: search.trim() } : {}),
  });
  const deleteMutation = useDeleteWarranty();

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('deleteSuccess'));
      setDeletingId(null);
    } catch {
      /* handled */
    }
  };
  const onDeleteCancel = () => setDeletingId(null);

  const items = (response?.data?.items ?? []) as WarrantyTableItem[];
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
  const canAct = (action: 'create' | 'update' | 'delete') => can(WARRANTY_PERMISSION[action]);

  return (
    <>
      <title>{t('form.warrantiesIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t('tableNames.warranty')}
        columns={warrantyColumns(t, {
          permissions: { update: canAct('update'), delete: canAct('delete') },
          onDelete,
          isDeleting: deleteMutation.isPending,
          isDeleteDialogOpen: deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
        })}
        data={items}
        createPath={paths.dashboard.warranty.create}
        hasDetails
        detailsLink="/products/warranties/update"
        permissions={{
          create: canAct('create'),
          update: canAct('update'),
          delete: canAct('delete'),
        }}
        isLoading={isLoading}
        onSearchChange={setSearch}
        searchPlaceholder={t('search')}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          status: t('columns.status'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </>
  );
}
