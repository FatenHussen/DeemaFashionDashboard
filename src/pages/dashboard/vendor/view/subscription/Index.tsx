import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { useFetchVendorSubscriptions } from '@/pages/dashboard/vendor/hooks/vendor-subscription';
import { VENDOR_SUBSCRIPTION_STATUSES } from '@/pages/dashboard/vendor/types/vendor-subscription.types';
import {
  vendorSubscriptionColumns,
  type VendorSubscriptionFormValues,
} from '@/columns/one/vendor-subscriptions/one';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Vendor Subscriptions | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const { data: response, isLoading, error } = useFetchVendorSubscriptions(
    currentPage,
    pageSize,
    {
      status: statusFilter || undefined,
      search: appliedSearch || undefined,
    }
  );

  if (error) console.error('Error fetching vendor subscriptions:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedSearch(search);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setSearch('');
    setAppliedSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = !!statusFilter || !!appliedSearch;

  const items: VendorSubscriptionFormValues[] = response?.data?.items || [];
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

  return (
    <>
      <title>{metadata.title}</title>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4 shadow-sm rtl:flex-row-reverse">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
          placeholder={t('searchByShopName')}
          className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('allStatuses')}</option>
          {VENDOR_SUBSCRIPTION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleApplyFilters}
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('apply')}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-9 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t('resetFilter')}
          </button>
        )}
      </div>

      <DataTable
        tableName="Vendor Subscriptions"
        columns={vendorSubscriptionColumns(t)}
        data={items}
        hasDetails
        detailsLink="/vendor-subscriptions"
        permissions={{
          create: false,
          update: false,
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          shop_name: 'Shop',
          package: 'Package',
          starts_at: 'Starts',
          ends_at: 'Ends',
          auto_renew: 'Auto Renew',
          status: 'Status',
          created_at: 'Created',
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
