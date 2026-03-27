import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { scheduledBasketColumns, type ScheduledBasketFormValues } from '@/columns/one/scheduled-baskets/one';
import { useFetchScheduledBaskets, useDeleteScheduledBasket } from '@/pages/dashboard/baskets/hooks/scheduled-basket';

import { Input } from 'src/shared/ui';
import { CONFIG } from 'src/global-config';

const metadata = { title: `Scheduled Baskets | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const { data: scheduledBasketsResponse, isLoading, error } = useFetchScheduledBaskets(currentPage, pageSize, {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });
  const deleteScheduledBasketMutation = useDeleteScheduledBasket();

  if (error) console.error('Error fetching scheduled baskets:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };
  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteScheduledBasketMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Scheduled basket deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };
  const onDeleteCancel = () => setDeletingId(null);
  const handleEdit = (row: { original: ScheduledBasketFormValues }) => {
    navigate(`/scheduled-baskets/update/${row.original.id}`, { state: { scheduledBasket: row.original } });
  };

  const scheduledBasketData: ScheduledBasketFormValues[] = scheduledBasketsResponse?.data?.items || [];
  const apiPagination = scheduledBasketsResponse?.data?.pagination;
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
        tableName={t("tableNames.scheduledBasket")}
        columns={scheduledBasketColumns(
          { update: hasPermission('update', 'schedulebasket'), delete: hasPermission('delete', 'schedulebasket') },
          t,
          onDelete,
          deleteScheduledBasketMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          handleEdit
        )}
        data={scheduledBasketData}
        searchColumns={[]}
        createPath="/scheduled-baskets/create"
        hasDetails
        detailsLink="/scheduled-baskets/details"
        permissions={{
          create: hasPermission('create', 'schedulebasket'),
          update: hasPermission('update', 'schedulebasket'),
          delete: hasPermission('delete', 'schedulebasket'),
        }}
        isLoading={isLoading}
        toolbarFilter={
          <Input
            placeholder={t('search')}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-xs"
          />
        }
        columnTranslations={{
          id: t('columns.id'),
          image: t('columns.image'),
          name: t('columns.name'),
          category: t('columns.category'),
          original_price: t('columns.originalPrice'),
          final_price: t('columns.finalPrice'),
          discount: t('columns.discount'),
          rating: t('columns.rating'),
          num_sold: t('columns.numSold'),
          schedule_count: t('columns.scheduleCount'),
          is_active: t('columns.status'),
          actions: t('columns.action'),
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
