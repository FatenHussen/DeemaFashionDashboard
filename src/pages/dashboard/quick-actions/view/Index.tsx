import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { quickActionColumns, type QuickActionRow } from '@/columns/one/quick-actions/one';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useFetchQuickActions, useDeleteQuickAction } from '../hooks';

// ----------------------------------------------------------------------

const metadata = { title: `Quick Actions | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: response, isLoading } = useFetchQuickActions(currentPage, pageSize);
  const deleteMutation = useDeleteQuickAction();

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

  const items: QuickActionRow[] = response?.data?.items || [];
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
  const hasPermission = (action: string) => can(`quickaction.${action}`);

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName={t('tableNames.quickAction')}
        columns={quickActionColumns(
          {
            update: hasPermission('update'),
            delete: hasPermission('delete'),
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
        createPath={paths.dashboard.quickActions.create}
        hasDetails
        detailsLink="/quick-actions/update"
        permissions={{
          create: hasPermission('create'),
          update: hasPermission('update'),
          delete: hasPermission('delete'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          icon: t('columns.icon'),
          title: t('columns.title'),
          page: t('columns.page'),
          order: t('columns.order'),
          status: t('columns.status'),
          created_at: t('columns.createdAt'),
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
      />
    </>
  );
}
