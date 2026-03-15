import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { subscriptionColumns, type SubscriptionFormValues } from '@/columns/one/subscriptions/one';
import { useFetchSubscriptions, useDeleteSubscription } from '@/pages/dashboard/subscriptions/hooks/subscription';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Subscriptions | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: response, isLoading, error } = useFetchSubscriptions(currentPage, pageSize);
  const deleteMutation = useDeleteSubscription();

  if (error) console.error('Error fetching subscriptions:', error);

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Subscription deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };
  const onDeleteCancel = () => setDeletingId(null);
  const handleEdit = (row: { original: SubscriptionFormValues }) => {
    navigate(`/subscriptions/update/${row.original.id}`, { state: { subscription: row.original } });
  };

  const items: SubscriptionFormValues[] = response?.data?.items || [];
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
      <title>{metadata.title}</title>
      <DataTable
        tableName="Subscription"
        columns={subscriptionColumns(
          { update: hasPermission('update', 'subscription'), delete: hasPermission('delete', 'subscription') },
          t, onDelete, deleteMutation.isPending, deletingId !== null, onDeleteConfirm, onDeleteCancel, deletingId, handleEdit
        )}
        data={items}
        createPath="/subscriptions/create"
        hasDetails
        detailsLink="/subscriptions/details"
        permissions={{
          create: hasPermission('create', 'subscription'),
          update: hasPermission('update', 'subscription'),
          delete: hasPermission('delete', 'subscription'),
        }}
        isLoading={isLoading}
        columnTranslations={{ id: 'ID', user: 'User', package: 'Package', start_date: 'Start', end_date: 'End', status: 'Status', is_active: 'Active', created_at: 'Created', actions: 'Actions' }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page: number) => setCurrentPage(page)}
        onPageSizeChange={(size: number) => { setPageSize(size); setCurrentPage(1); }}
      />
    </>
  );
}
