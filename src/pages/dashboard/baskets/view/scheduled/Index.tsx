import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchSchedules } from '@/pages/dashboard/schedules/hooks/schedule';
import { scheduleSelectLabel } from '@/pages/dashboard/baskets/utils/scheduled-basket-schedule';
import { scheduledBasketColumns, type ScheduledBasketFormValues } from '@/columns/one/scheduled-baskets/one';
import { useFetchScheduledBaskets, useDeleteScheduledBasket } from '@/pages/dashboard/baskets/hooks/scheduled-basket';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');
  const [scheduleFilter, setScheduleFilter] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, scheduleFilter]);

  const { data: schedulesResponse } = useFetchSchedules({ page: 1, per_page: 100 });
  const scheduleFilterOptions = schedulesResponse?.data?.items ?? [];

  const { data: scheduledBasketsResponse, isLoading, error } = useFetchScheduledBaskets(currentPage, pageSize, {
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(scheduleFilter ? { schedule_id: Number(scheduleFilter) } : {}),
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
        toast.success(t('deleteSuccess'));
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
      <title>{t('form.scheduledBasketsIndexDocumentTitle', { appName: CONFIG.appName })}</title>
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
        createPath="/scheduled-baskets/create"
        hasDetails
        detailsLink="/scheduled-baskets/details"
        permissions={{
          create: hasPermission('create', 'schedulebasket'),
          update: hasPermission('update', 'schedulebasket'),
          delete: hasPermission('delete', 'schedulebasket'),
        }}
        isLoading={isLoading}
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
          schedule: t('columns.schedule'),
          is_active: t('columns.status'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={setSearch}
        activeFilterCount={scheduleFilter ? 1 : 0}
        onFilterReset={() => {
          setScheduleFilter('');
          setCurrentPage(1);
        }}
        filterSidebar={
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t('columns.schedule')}
              </label>
              <select
                className="w-full h-10 rounded-lg border border-border/60 bg-background px-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-colors"
                value={scheduleFilter}
                onChange={(e) => setScheduleFilter(e.target.value)}
              >
                <option value="">{t('all')}</option>
                {scheduleFilterOptions.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {scheduleSelectLabel(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />
    </>
  );
}
