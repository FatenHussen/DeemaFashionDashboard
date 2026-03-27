import type { ScheduleListParams } from '@/pages/dashboard/schedules/types/schedule.types';

import { toast } from 'react-toastify';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { scheduleColumns, type ScheduleTableItem } from '@/columns/one/schedules/one';
import { useFetchSchedules, useDeleteSchedule } from '@/pages/dashboard/schedules/hooks/schedule';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Schedules | Dashboard - ${CONFIG.appName}` };

const SORT_FIELDS = ['id', 'name', 'interval_days', 'discount_value', 'created_at'] as const;

function scheduleSortFieldLabel(f: (typeof SORT_FIELDS)[number], t: (k: string) => string): string {
  switch (f) {
    case 'id':
      return t('columns.id');
    case 'name':
      return t('columns.name');
    case 'interval_days':
      return t('form.intervalDays');
    case 'discount_value':
      return t('form.discountValue');
    case 'created_at':
      return t('columns.created');
    default:
      return f;
  }
}

const SCHEDULE_PER_PAGE_MAX = 100;
const SCHEDULE_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [sortField, setSortField] = useState<(typeof SORT_FIELDS)[number]>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const listParams = useMemo((): ScheduleListParams => {
    const params: ScheduleListParams = {
      page: currentPage,
      per_page: Math.min(pageSize, SCHEDULE_PER_PAGE_MAX),
      sort_field: sortField,
      sort_order: sortOrder,
    };
    if (appliedSearch.trim()) params.search = appliedSearch.trim();
    if (activeFilter === 'true') params.is_active = true;
    if (activeFilter === 'false') params.is_active = false;
    if (discountTypeFilter !== 'all') params.discount_type = discountTypeFilter;
    return params;
  }, [currentPage, pageSize, appliedSearch, activeFilter, discountTypeFilter, sortField, sortOrder]);

  const { data: response, isLoading } = useFetchSchedules(listParams);
  const deleteMutation = useDeleteSchedule();

  const handleApplySearch = () => {
    setAppliedSearch(search.trim());
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setActiveFilter('all');
    setDiscountTypeFilter('all');
    setSortField('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

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

  const handleEdit = (row: { original: ScheduleTableItem }) => {
    navigate(`/schedules/update/${row.original.id}`);
  };

  const rawItems = response?.data?.items ?? [];
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

  const hasFilters =
    !!appliedSearch ||
    activeFilter !== 'all' ||
    discountTypeFilter !== 'all' ||
    sortField !== 'created_at' ||
    sortOrder !== 'desc';

  const filterContent = (
    <div className="flex w-full max-w-full flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
          placeholder={t('form.scheduleListSearchPlaceholder')}
          className="h-10 min-w-[180px] flex-1 rounded-xl border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={handleApplySearch}
          className="h-10 rounded-xl border border-input bg-background px-4 text-sm font-medium hover:bg-muted"
        >
          {t('apply')}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase text-muted-foreground">{t('columns.status')}</span>
        {(['all', 'true', 'false'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setActiveFilter(k);
              setCurrentPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === k
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {k === 'all' ? t('all') : k === 'true' ? t('active') : t('inactive')}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase text-muted-foreground">{t('form.discountType')}</span>
        <select
          value={discountTypeFilter}
          onChange={(e) => {
            setDiscountTypeFilter(e.target.value as 'all' | 'percentage' | 'fixed');
            setCurrentPage(1);
          }}
          className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
        >
          <option value="all">{t('form.scheduleDiscountTypeAll')}</option>
          <option value="percentage">{t('form.percentageDiscount')}</option>
          <option value="fixed">{t('form.fixedDiscount')}</option>
        </select>
        <select
          value={sortField}
          onChange={(e) => {
            setSortField(e.target.value as (typeof SORT_FIELDS)[number]);
            setCurrentPage(1);
          }}
          className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
        >
          {SORT_FIELDS.map((f) => (
            <option key={f} value={f}>
              {t('subscriptionSortField')}: {scheduleSortFieldLabel(f, t)}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as 'asc' | 'desc');
            setCurrentPage(1);
          }}
          className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
        >
          <option value="asc">{t('subscriptionSortAsc')}</option>
          <option value="desc">{t('subscriptionSortDesc')}</option>
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('clearFilters')} ×
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <title>{metadata.title}</title>
      <DataTable
        tableName={t('tableNames.schedule')}
        columns={scheduleColumns(
          { update: hasPermission('update', 'schedule'), delete: hasPermission('delete', 'schedule') },
          t,
          onDelete,
          deleteMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          handleEdit
        )}
        data={rawItems as ScheduleTableItem[]}
        createPath="/schedules/create"
        hasDetails={false}
        toolbarFilter={filterContent}
        pageSizeOptions={[...SCHEDULE_PAGE_SIZE_OPTIONS]}
        permissions={{
          create: hasPermission('create', 'schedule'),
          update: hasPermission('update', 'schedule'),
          delete: hasPermission('delete', 'schedule'),
        }}
        isLoading={isLoading}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}
