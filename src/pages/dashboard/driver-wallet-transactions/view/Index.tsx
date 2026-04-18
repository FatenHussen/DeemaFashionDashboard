import { useTranslation } from 'react-i18next';
import { useMemo, useState, type ReactNode } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { driverWalletTransactionColumns } from '@/columns/one/driver-wallet-transactions/one';
import { useFetchDriverWalletTransactions } from '@/pages/dashboard/driver-wallet-transactions/hooks/driver-wallet-transaction';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

const DEFAULT_SORT_FIELD = 'created_at' as const;
const DEFAULT_SORT_ORDER = 'desc' as const;

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [type, setType] = useState<'paid_by_user' | 'paid_by_system' | ''>('');
  const [driverId, setDriverId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortField, setSortField] = useState<
    'id' | 'created_at' | 'amount' | 'type'
  >(DEFAULT_SORT_FIELD);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULT_SORT_ORDER);

  const filters = useMemo(() => {
    const oid = orderId.trim() ? Number(orderId) : NaN;
    const did = driverId.trim() ? driverId.trim() : '';
    return {
      ...(appliedSearch.trim() ? { search: appliedSearch.trim() } : {}),
      ...(type ? { type } : {}),
      ...(did ? { driver_id: did } : {}),
      ...(!Number.isNaN(oid) ? { order_id: oid } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(minAmount !== '' && !Number.isNaN(Number(minAmount)) ? { min_amount: Number(minAmount) } : {}),
      ...(maxAmount !== '' && !Number.isNaN(Number(maxAmount)) ? { max_amount: Number(maxAmount) } : {}),
      sort_field: sortField,
      sort_order: sortOrder,
    };
  }, [
    appliedSearch,
    type,
    driverId,
    orderId,
    from,
    to,
    minAmount,
    maxAmount,
    sortField,
    sortOrder,
  ]);

  const { data: response, isLoading } = useFetchDriverWalletTransactions(
    currentPage,
    pageSize,
    filters
  );

  const handleApplySearch = () => {
    setAppliedSearch(search);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const items = response?.data?.items ?? [];
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

  const activeFilterCount =
    [type, driverId.trim(), orderId.trim(), from, to, minAmount, maxAmount].filter(Boolean).length +
    (sortField !== DEFAULT_SORT_FIELD || sortOrder !== DEFAULT_SORT_ORDER ? 1 : 0);

  const toolbarSearch = (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <input
        type="text"
        placeholder={t('form.driverWalletTxSearchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
        className="h-10 min-w-[200px] flex-1 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="button"
        onClick={handleApplySearch}
        className="h-10 rounded-xl border border-input bg-background px-4 text-sm font-medium hover:bg-muted shrink-0"
      >
        {t('apply')}
      </button>
    </div>
  );

  const sidebarContent = (
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

      <FilterGroup label={t('form.driverWalletTxFilterDriverId')}>
        <input
          type="text"
          inputMode="numeric"
          value={driverId}
          onChange={(e) => {
            setDriverId(e.target.value.replace(/\D/g, ''));
            setCurrentPage(1);
          }}
          placeholder={t('form.driverWalletTxDriverIdPlaceholder')}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
          <option value="id">id</option>
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
      <DataTable
        tableName={t('tableNames.driverWalletTransaction')}
        columns={driverWalletTransactionColumns(t)}
        data={items}
        hasDetails
        rowClickToDetails
        detailsLink={paths.dashboard.driverWalletTransactions}
        toolbarFilter={toolbarSearch}
        filterSidebar={sidebarContent}
        activeFilterCount={activeFilterCount}
        onFilterReset={() => {
          setSearch('');
          setAppliedSearch('');
          setType('');
          setDriverId('');
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
        isLoading={isLoading}
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
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
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
