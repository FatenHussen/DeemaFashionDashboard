import type { SubscriptionListParams } from '@/pages/dashboard/subscriptions/types/subscription.types';

import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { useFetchSubscriptions } from '@/pages/dashboard/subscriptions/hooks/subscription';
import { subscriptionColumns, type SubscriptionRow } from '@/columns/one/subscriptions/one';

import { CONFIG } from 'src/global-config';

/** Admin API: `per_page` default 10, max 100 */
const SUBSCRIPTION_PER_PAGE_MAX = 100;
const SUBSCRIPTION_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const SORT_FIELDS = ['id', 'start_date', 'end_date', 'created_at', 'status'] as const;

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>('');
  const [userId, setUserId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [startFrom, setStartFrom] = useState('');
  const [startTo, setStartTo] = useState('');
  const [sortField, setSortField] = useState<(typeof SORT_FIELDS)[number]>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const listParams = useMemo((): SubscriptionListParams => {
    const uid = userId.trim() ? Number(userId) : undefined;
    const pid = packageId.trim() ? Number(packageId) : undefined;
    return {
      page: currentPage,
      per_page: Math.min(pageSize, SUBSCRIPTION_PER_PAGE_MAX),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(uid !== undefined && !Number.isNaN(uid) && uid > 0 ? { user_id: uid } : {}),
      ...(pid !== undefined && !Number.isNaN(pid) && pid > 0 ? { package_id: pid } : {}),
      ...(startFrom ? { start_date_from: startFrom } : {}),
      ...(startTo ? { start_date_to: startTo } : {}),
      sortField,
      sortOrder,
    };
  }, [currentPage, pageSize, statusFilter, search, userId, packageId, startFrom, startTo, sortField, sortOrder]);

  const { data: response, isLoading, error } = useFetchSubscriptions(listParams);

  if (error) console.error('Error fetching subscriptions:', error);

  const items: SubscriptionRow[] = response?.data?.items ?? [];
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

  const columns = useMemo(() => subscriptionColumns(t), [t]);

  const activeFilterCount = [
    statusFilter,
    userId.trim() || undefined,
    packageId.trim() || undefined,
    startFrom || undefined,
    startTo || undefined,
    sortField !== 'created_at' ? sortField : undefined,
    sortOrder !== 'desc' ? sortOrder : undefined,
  ].filter(Boolean).length;

  const sidebarContent = (
    <>
      <FilterGroup label={t('columns.status')}>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'active', 'expired', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatusFilter(s === 'all' ? undefined : s); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                (s === 'all' && !statusFilter) || statusFilter === s
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {s === 'all' ? t('all') : s === 'active' ? t('active') : s === 'expired' ? t('expired') : t('statusCancelled')}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label={t('subscriptionFilterUserId')}>
        <input
          type="number"
          min={1}
          placeholder={t('subscriptionFilterUserId')}
          value={userId}
          onChange={(e) => { setUserId(e.target.value); setCurrentPage(1); }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('subscriptionFilterPackageId')}>
        <input
          type="number"
          min={1}
          placeholder={t('subscriptionFilterPackageId')}
          value={packageId}
          onChange={(e) => { setPackageId(e.target.value); setCurrentPage(1); }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('subscriptionStartFrom')}>
        <input
          type="date"
          value={startFrom}
          onChange={(e) => { setStartFrom(e.target.value); setCurrentPage(1); }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('subscriptionStartTo')}>
        <input
          type="date"
          value={startTo}
          onChange={(e) => { setStartTo(e.target.value); setCurrentPage(1); }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('subscriptionSortField')}>
        <select
          value={sortField}
          onChange={(e) => { setSortField(e.target.value as (typeof SORT_FIELDS)[number]); setCurrentPage(1); }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {SORT_FIELDS.map((f) => (
            <option key={f} value={f}>
              {t(`form.subscriptionSortField_${f}`)}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label={t('subscriptionSortAsc')}>
        <select
          value={sortOrder}
          onChange={(e) => { setSortOrder(e.target.value as 'asc' | 'desc'); setCurrentPage(1); }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="asc">{t('subscriptionSortAsc')}</option>
          <option value="desc">{t('subscriptionSortDesc')}</option>
        </select>
      </FilterGroup>
    </>
  );

  return (
    <>
      <title>{t('form.subscriptionsIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t('tableNames.subscription')}
        columns={columns}
        data={items}
        hasDetails
        detailsLink="/subscriptions/details"
        pageSizeOptions={[...SUBSCRIPTION_PAGE_SIZE_OPTIONS]}
        filterSidebar={sidebarContent}
        activeFilterCount={activeFilterCount}
        onFilterReset={() => {
          setStatusFilter(undefined);
          setUserId('');
          setPackageId('');
          setStartFrom('');
          setStartTo('');
          setSortField('created_at');
          setSortOrder('desc');
          setCurrentPage(1);
        }}
        permissions={{
          create: false,
          update: false,
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          user: t('columns.user'),
          package: t('columns.package'),
          start_date: t('columns.start'),
          end_date: t('columns.end'),
          remaining_orders: t('columns.remainingOrders'),
          remaining_free_deliveries: t('columns.remainingFreeDeliveries'),
          status: t('columns.status'),
          is_active: t('columns.active'),
          created_at: t('columns.created'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page: number) => setCurrentPage(page)}
        onPageSizeChange={(size: number) => { setPageSize(size); setCurrentPage(1); }}
        onSearchChange={setSearch}
      />
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
