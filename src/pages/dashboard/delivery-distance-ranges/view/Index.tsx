import { toast } from 'react-toastify';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  deliveryDistanceRangeColumns,
  type DeliveryDistanceRangeTableItem,
} from '@/columns/one/delivery-distance-ranges/one';
import {
  useDeleteDeliveryDistanceRange,
  useFetchDeliveryDistanceRanges,
} from '@/pages/dashboard/delivery-distance-ranges/hooks/delivery-distance-range';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: response, isLoading, error } = useFetchDeliveryDistanceRanges(currentPage, pageSize);
  const deleteMutation = useDeleteDeliveryDistanceRange();

  if (error) console.error('Error fetching delivery distance ranges:', error);

  const onDelete = (id: number) => setDeletingId(id);
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
  const onDeleteCancel = () => setDeletingId(null);

  const handleEdit = (row: { original: DeliveryDistanceRangeTableItem }) => {
    navigate(`/delivery-distance-ranges/update/${row.original.id}`);
  };

  const rawItems = response?.data?.items ?? [];
  const items = useMemo(
    () => [...rawItems].sort((a, b) => a.min_distance - b.min_distance),
    [rawItems]
  );

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
    : {
        current_page: 1,
        last_page: 1,
        per_page: pageSize,
        total: items.length,
        from: items.length ? 1 : 0,
        to: items.length,
      };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{t('form.deliveryDistanceRangesIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t('tableNames.deliveryDistanceRange')}
        columns={deliveryDistanceRangeColumns(
          {
            update: hasPermission('update', 'deliverydistancerange'),
            delete: hasPermission('delete', 'deliverydistancerange'),
          },
          t,
          onDelete,
          deleteMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          handleEdit
        )}
        data={items as DeliveryDistanceRangeTableItem[]}
        createPath="/delivery-distance-ranges/create"
        hasDetails
        detailsLink="/delivery-distance-ranges/details"
        permissions={{
          create: hasPermission('create', 'deliverydistancerange'),
          update: hasPermission('update', 'deliverydistancerange'),
          delete: hasPermission('delete', 'deliverydistancerange'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          min_distance: t('columns.minDistance'),
          max_distance: t('columns.maxDistance'),
          multiplier: t('columns.multiplier'),
          created_at: t('columns.createdAt'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page: number) => setCurrentPage(page)}
        onPageSizeChange={(size: number) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </>
  );
}
