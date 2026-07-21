import type { ColumnDef } from '@tanstack/react-table';
import type { DriverData } from '@/pages/dashboard/driver/types/driver.types';

import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { useNavigate, useSearchParams } from 'react-router';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { useFetchDrivers } from '@/pages/dashboard/driver/hooks/driver';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { driverWalletTransactionColumns } from '@/columns/one/driver-wallet-transactions/one';
import { useFetchDriverWalletTransactions } from '@/pages/dashboard/driver-wallet-transactions/hooks/driver-wallet-transaction';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

const DEFAULT_SORT_FIELD = 'created_at' as const;
const DEFAULT_SORT_ORDER = 'desc' as const;

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDriverId = searchParams.get('driver_id')?.trim() ?? '';
  const selectedDriverName = searchParams.get('driver_name')?.trim() ?? '';
  const isTransactionsView = Boolean(selectedDriverId);

  const [driversCurrentPage, setDriversCurrentPage] = useState(1);
  const [driversPageSize, setDriversPageSize] = useState(10);
  const [driversSearch, setDriversSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [txSearch, setTxSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [txSearch, selectedDriverId]);

  const [type, setType] = useState<'paid_by_user' | 'paid_by_system' | ''>('');
  const [orderId, setOrderId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortField, setSortField] = useState<
    'id' | 'created_at' | 'amount' | 'type'
  >(DEFAULT_SORT_FIELD);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULT_SORT_ORDER);

  const driverListFilters = useMemo(() => {
    const f: { status?: string; is_active?: number; search?: string } = {};
    if (statusFilter) f.status = statusFilter;
    if (isActiveFilter !== '') f.is_active = parseInt(isActiveFilter, 10);
    if (driversSearch.trim()) f.search = driversSearch.trim();
    return Object.keys(f).length ? f : undefined;
  }, [statusFilter, isActiveFilter, driversSearch]);

  const txFilters = useMemo(() => {
    const oid = orderId.trim() ? Number(orderId) : NaN;
    return {
      ...(txSearch.trim() ? { search: txSearch.trim() } : {}),
      ...(type ? { type } : {}),
      ...(selectedDriverId ? { driver_id: selectedDriverId } : {}),
      ...(!Number.isNaN(oid) ? { order_id: oid } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(minAmount !== '' && !Number.isNaN(Number(minAmount)) ? { min_amount: Number(minAmount) } : {}),
      ...(maxAmount !== '' && !Number.isNaN(Number(maxAmount)) ? { max_amount: Number(maxAmount) } : {}),
      sort_field: sortField,
      sort_order: sortOrder,
    };
  }, [
    txSearch,
    type,
    selectedDriverId,
    orderId,
    from,
    to,
    minAmount,
    maxAmount,
    sortField,
    sortOrder,
  ]);

  const { data: transactionsResponse, isLoading: isTransactionsLoading } = useFetchDriverWalletTransactions(
    currentPage,
    pageSize,
    txFilters
  );

  const { data: driversResponse, isLoading: isDriversLoading } = useFetchDrivers(
    driversCurrentPage,
    driversPageSize,
    driverListFilters
  );

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const txItems = transactionsResponse?.data?.items ?? [];
  const txApiPagination = transactionsResponse?.data?.pagination;
  const txPagination = txApiPagination
    ? {
        current_page: txApiPagination.current_page,
        last_page: txApiPagination.last_page,
        per_page: txApiPagination.per_page,
        total: txApiPagination.total,
        from: (txApiPagination.current_page - 1) * txApiPagination.per_page + 1,
        to: Math.min(txApiPagination.current_page * txApiPagination.per_page, txApiPagination.total),
      }
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const txActiveFilterCount =
    [type, orderId.trim(), from, to, minAmount, maxAmount].filter(Boolean).length +
    (sortField !== DEFAULT_SORT_FIELD || sortOrder !== DEFAULT_SORT_ORDER ? 1 : 0);

  const driverItems = driversResponse?.data?.items ?? [];
  const driverApiPagination = driversResponse?.data?.pagination;
  const driverPagination = driverApiPagination
    ? {
        current_page: driverApiPagination.current_page,
        last_page: driverApiPagination.last_page,
        per_page: driverApiPagination.per_page,
        total: driverApiPagination.total,
        from: (driverApiPagination.current_page - 1) * driverApiPagination.per_page + 1,
        to: Math.min(driverApiPagination.current_page * driverApiPagination.per_page, driverApiPagination.total),
      }
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const driversActiveFilterCount =
    (statusFilter ? 1 : 0) + (isActiveFilter !== '' ? 1 : 0);

  const driversSidebarContent = (
    <div className="flex flex-col gap-5">
      <FilterGroup label={t('columns.status')}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setDriversCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('all')}</option>
          <option value="available">{t('driverAvailAvailable')}</option>
          <option value="busy">{t('driverAvailBusy')}</option>
          <option value="inactive">{t('driverAvailInactive')}</option>
        </select>
      </FilterGroup>
      <FilterGroup label={t('columns.active')}>
        <select
          value={isActiveFilter}
          onChange={(e) => {
            setIsActiveFilter(e.target.value);
            setDriversCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('all')}</option>
          <option value="1">{t('yes')}</option>
          <option value="0">{t('no')}</option>
        </select>
      </FilterGroup>
    </div>
  );

  const driversColumns: ColumnDef<DriverData>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-0">
          <Iconify icon="solar:user-rounded-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
          <span className="text-sm text-foreground font-medium truncate">{row.original.name || '-'}</span>
        </div>
      ),
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.phone')} />,
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
      cell: ({ row }) => {
        const status = String(row.original.status || '').toLowerCase();
        if (status === 'available') return t('driverAvailAvailable');
        if (status === 'busy') return t('driverAvailBusy');
        if (status === 'inactive') return t('driverAvailInactive');
        return row.original.status || '-';
      },
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.active')} />,
      cell: ({ row }) => (row.original.is_active ? t('yes') : t('no')),
    },
    {
      id: 'wallet_transactions',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.action')} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSearchParams({
                driver_id: String(row.original.id),
                driver_name: row.original.name || '',
              });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
          >
            <Iconify icon="solar:wallet-money-bold" width={14} height={14} />
            {t('form.viewDriverWalletTransactions')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                `/driver-wallet-transactions/driver/${row.original.id}/orders?driver_name=${encodeURIComponent(
                  row.original.name || ''
                )}`
              );
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-300/300 bg-violet-500/0 px-3 py-1.5 text-xs font-semibold text-dark-600 hover:bg-white-500/15 dark:text-violet-300"
          > 
            <Iconify icon="solar:bag-5-bold" width={14} height={14} />
            {t('form.viewDriverOrders')}
          </button>
        </div>
      ),
    },
  ];

  const txSidebarContent = (
    <>
      <FilterGroup label={t('form.driverWalletTxFilterType')}>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as '' | 'paid_by_user' | 'paid_by_system');
            setCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('form.driverWalletTxTypeAll')}</option>
          <option value="paid_by_user">{t('form.driverWalletTxType_paid_by_user')}</option>
          <option value="paid_by_system">{t('form.driverWalletTxType_paid_by_system')}</option>
        </select>
      </FilterGroup>

      <FilterGroup label={t('form.driverWalletTxFilterOrderId')}>
        <input
          type="text"
          inputMode="numeric"
          value={orderId}
          onChange={(e) => {
            setOrderId(e.target.value.replace(/\D/g, ''));
            setCurrentPage(1);
          }}
          placeholder={t('form.driverWalletTxOrderIdPlaceholder')}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('form.driverWalletTxDateFrom')}>
        <input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setCurrentPage(1); 
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('form.driverWalletTxDateTo')}>
        <input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('form.driverWalletTxMinAmount')}>
        <input
          type="number"
          min={0}
          step="any"
          value={minAmount}
          onChange={(e) => {
            setMinAmount(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('form.driverWalletTxMaxAmount')}>
        <input
          type="number"
          min={0}
          step="any"
          value={maxAmount}
          onChange={(e) => {
            setMaxAmount(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('form.driverWalletTxSortField')}>
        <select
          value={sortField}
          onChange={(e) => {
            setSortField(e.target.value as 'id' | 'created_at' | 'amount' | 'type');
            setCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="id">{t('columns.id')}</option>
          <option value="created_at">{t('columns.createdAt')}</option>
          <option value="amount">{t('columns.amount')}</option>
          <option value="type">{t('columns.type')}</option>
        </select>
      </FilterGroup>

      <FilterGroup label={t('form.driverWalletTxSortOrder')}>
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as 'asc' | 'desc');
            setCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="asc">{t('form.driverWalletTxSortAsc')}</option>
          <option value="desc">{t('form.driverWalletTxSortDesc')}</option>
        </select>
      </FilterGroup>
    </>
  );

  return (
    <>
      <title>{t('form.driverWalletTxIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      {isTransactionsView ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('columns.driver')}</p>
              <p className="truncate text-sm font-semibold">
                {selectedDriverName || `${t('columns.driver')} #${selectedDriverId}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted/40"
            >
              <Iconify icon="solar:arrow-left-bold" width={14} height={14} />
              {t('form.backToDriversList')}
            </button>
          </div>

          <DataTable
            tableName={t('tableNames.driverWalletTransaction')}
            columns={driverWalletTransactionColumns(t)}
            data={txItems}
            hasDetails
            rowClickToDetails
            detailsLink={paths.dashboard.driverWalletTransactions}
            filterSidebar={txSidebarContent}
            activeFilterCount={txActiveFilterCount}
            onFilterReset={() => {
              setTxSearch('');
              setType('');
              setOrderId('');
              setFrom('');
              setTo('');
              setMinAmount('');
              setMaxAmount('');
              setSortField(DEFAULT_SORT_FIELD);
              setSortOrder(DEFAULT_SORT_ORDER);
              setCurrentPage(1);
            }}
            permissions={{ create: false, update: false, delete: false }}
            isLoading={isTransactionsLoading}
            columnTranslations={{
              id: t('columns.id'),
              driver_id: t('form.driverWalletTxDriverId'),
              driver: t('columns.driver'),
              type: t('columns.type'),
              amount: t('columns.amount'),
              delivery_fee: t('form.driverWalletTxDeliveryFee'),
              rate_percent: t('form.driverWalletTxRatePercent'),
              order_id: t('columns.order'),
              created_at: t('columns.createdAt'),
              actions: t('columns.action'),
            }}
            pagination={txPagination}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={setTxSearch}
            searchPlaceholder={t('form.driverWalletTxSearchPlaceholder')}
          />
        </div>
      ) : (
        <DataTable
          tableName={t('tableNames.driver')}
          columns={driversColumns}
          data={driverItems}
          filterSidebar={driversSidebarContent}
          activeFilterCount={driversActiveFilterCount}
          onFilterReset={() => {
            setStatusFilter('');
            setIsActiveFilter('');
            setDriversCurrentPage(1);
          }}
          permissions={{ create: false, update: false, delete: false }}
          isLoading={isDriversLoading}
          columnTranslations={{
            name: t('columns.name'),
            phone: t('columns.phone'),
            status: t('columns.status'),
            is_active: t('columns.active'),
            wallet_transactions: t('columns.action'),
          }}
          pagination={driverPagination}
          currentPage={driversCurrentPage}
          pageSize={driversPageSize}
          onPageChange={setDriversCurrentPage}
          onPageSizeChange={(size) => {
            setDriversPageSize(size);
            setDriversCurrentPage(1);
          }}
          onSearchChange={setDriversSearch}
          searchPlaceholder={t('search')}
        />
      )}
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
