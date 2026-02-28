import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { giftColumns, type GiftFormValues } from '@/columns/one/gifts/one';
import { useFetchGifts, useDeleteGift } from '@/pages/dashboard/gifts/hooks/gift';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Gifts | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: response, isLoading, error } = useFetchGifts(currentPage, pageSize);
  const deleteMutation = useDeleteGift();

  if (error) console.error('Error fetching gifts:', error);

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Gift deleted successfully');
        setDeletingId(null);
      } catch {}
    }
  };
  const onDeleteCancel = () => setDeletingId(null);
  const handleEdit = (row: { original: GiftFormValues }) => {
    navigate(`/gifts/update/${row.original.id}`, { state: { gift: row.original } });
  };

  const items: GiftFormValues[] = response?.data?.items || [];
  const apiPagination = response?.data?.pagination;
  const pagination = apiPagination
    ? { current_page: apiPagination.current_page, last_page: apiPagination.last_page, per_page: apiPagination.per_page, total: apiPagination.total, from: (apiPagination.current_page - 1) * apiPagination.per_page + 1, to: Math.min(apiPagination.current_page * apiPagination.per_page, apiPagination.total) }
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{metadata.title}</title>
      <DataTable
        tableName="Gift"
        columns={giftColumns(
          { update: hasPermission('update', 'gift'), delete: hasPermission('delete', 'gift') },
          t, onDelete, deleteMutation.isPending, deletingId !== null, onDeleteConfirm, onDeleteCancel, deletingId, handleEdit
        )}
        data={items}
        createPath="/gifts/create"
        hasDetails
        detailsLink="/gifts/details"
        permissions={{ create: hasPermission('create', 'gift'), update: hasPermission('update', 'gift'), delete: hasPermission('delete', 'gift') }}
        isLoading={isLoading}
        columnTranslations={{ id: 'ID', name: 'Name', points_required: 'Points', stock_quantity: 'Stock', is_active: 'Status', created_at: 'Created', actions: 'Actions' }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page: number) => setCurrentPage(page)}
        onPageSizeChange={(size: number) => { setPageSize(size); setCurrentPage(1); }}
      />
    </>
  );
}
