import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { basketColumns, type BasketFormValues } from '@/columns/one/baskets/one';
import { useFetchBaskets, useDeleteBasket } from '@/pages/dashboard/baskets/hooks/basket';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Baskets | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: basketsResponse, isLoading, error } = useFetchBaskets(currentPage, pageSize);
  const deleteBasketMutation = useDeleteBasket();

  if (error) console.error('Error fetching baskets:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };
  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteBasketMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Basket deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };
  const onDeleteCancel = () => setDeletingId(null);
  const handleEdit = (row: { original: BasketFormValues }) => {
    navigate(`/baskets/update/${row.original.id}`, { state: { basket: row.original } });
  };

  const basketData: BasketFormValues[] =
    (basketsResponse?.data as { items?: BasketFormValues[]; data?: BasketFormValues[] } | undefined)
      ?.items ?? (basketsResponse?.data as { data?: BasketFormValues[] } | undefined)?.data ?? [];
  const apiPagination = basketsResponse?.data?.pagination;
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
        tableName={t("tableNames.basket")}
        columns={basketColumns(
          { update: hasPermission('update', 'basket'), delete: hasPermission('delete', 'basket') },
          t,
          onDelete,
          deleteBasketMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          handleEdit
        )}
        data={basketData}
        createPath="/baskets/create"
        hasDetails
        detailsLink="/baskets/details"
        permissions={{
          create: hasPermission('create', 'basket'),
          update: hasPermission('update', 'basket'),
          delete: hasPermission('delete', 'basket'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          category: 'Category',
          discount: 'Discount',
          items_count: 'Items',
          created_at: 'Created',
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
