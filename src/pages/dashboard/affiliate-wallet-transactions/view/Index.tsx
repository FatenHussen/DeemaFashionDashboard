import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { affiliateWalletTransactionColumns } from '@/columns/one/affiliate-wallet-transactions/one';
import { useFetchAffiliateWalletTransactions } from '@/pages/dashboard/affiliate-wallet-transactions/hooks/affiliate-wallet-transaction';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

const DEFAULT_SORT_FIELD = 'created_at' as const;
const DEFAULT_SORT_ORDER = 'desc' as const;

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState('');

  const [type, setType] = useState<'commission' | 'withdraw' | ''>('');
  const [affiliateId, setAffiliateId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortField, setSortField] = useState<
    'id' | 'created_at' | 'amount' | 'type'
  >(DEFAULT_SORT_FIELD);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULT_SORT_ORDER);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filters = useMemo(() => {
    const oid = orderId.trim() ? Number(orderId) : NaN;
    return {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(type ? { type } : {}),
      ...(affiliateId.trim() ? { affiliate_id: affiliateId.trim() } : {}),
      ...(!Number.isNaN(oid) ? { order_id: oid } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(minAmount !== '' && !Number.isNaN(Number(minAmount)) ? { min_amount: Number(minAmount) } : {}),
      ...(maxAmount !== '' && !Number.isNaN(Number(maxAmount)) ? { max_amount: Number(maxAmount) } : {}),
      sort_field: sortField,
      sort_order: sortOrder,
    };
  }, [
    search,
    type,
    affiliateId,
    orderId,
    from,
    to,
    minAmount,
    maxAmount,
    sortField,
    sortOrder,
  ]);

  const { data: response, isLoading } = useFetchAffiliateWalletTransactions(
    currentPage,
    pageSize,
    filters
  );

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
    [type, affiliateId.trim(), orderId.trim(), from, to, minAmount, maxAmount].filter(Boolean)
      .length +
    (sortField !== DEFAULT_SORT_FIELD || sortOrder !== DEFAULT_SORT_ORDER ? 1 : 0);

  const sidebarContent = (
    <>
      <FilterGroup label={t('form.affiliateWalletTxFilterType')}>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as '' | 'commission' | 'withdraw');
            setCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('form.affiliateWalletTxTypeAll')}</option>
          <option value="commission">{t('form.affiliateWalletTxType_commission')}</option>
          <option value="withdraw">{t('form.affiliateWalletTxType_withdraw')}</option>
        </select>
      </FilterGroup>

      <FilterGroup label={t('form.affiliateWalletTxFilterAffiliateId')}>
        <input
          type="text"
          value={affiliateId}
          onChange={(e) => {
            setAffiliateId(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('form.affiliateWalletTxAffiliateIdPlaceholder')}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('form.affiliateWalletTxFilterOrderId')}>
        <input
          type="text"
          inputMode="numeric"
          value={orderId}
          onChange={(e) => {
            setOrderId(e.target.value.replace(/\D/g, ''));
            setCurrentPage(1);
          }}
          placeholder={t('form.affiliateWalletTxOrderIdPlaceholder')}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('form.affiliateWalletTxDateFrom')}>
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

      <FilterGroup label={t('form.affiliateWalletTxDateTo')}>
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

      <FilterGroup label={t('form.affiliateWalletTxMinAmount')}>
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

      <FilterGroup label={t('form.affiliateWalletTxMaxAmount')}>
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

      <FilterGroup label={t('form.affiliateWalletTxSortField')}>
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

      <FilterGroup label={t('form.affiliateWalletTxSortOrder')}>
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as 'asc' | 'desc');
            setCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="asc">{t('form.affiliateWalletTxSortAsc')}</option>
          <option value="desc">{t('form.affiliateWalletTxSortDesc')}</option>
        </select>
      </FilterGroup>
    </>
  );

  return (
    <>
      <title>{t('form.affiliateWalletTxIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t('tableNames.affiliateWalletTransaction')}
        columns={affiliateWalletTransactionColumns(t)}
        data={items}
        hasDetails
        rowClickToDetails
        detailsLink={paths.dashboard.affiliateWalletTransactions}
        filterSidebar={sidebarContent}
        activeFilterCount={activeFilterCount}
        onFilterReset={() => {
          setSearch('');
          setType('');
          setAffiliateId('');
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
          affiliate_id: t('form.affiliateWalletTxAffiliateCode'),
          affiliate: t('columns.affiliate'),
          type: t('columns.type'),
          amount: t('columns.amount'),
          order_id: t('columns.order'),
          created_at: t('columns.createdAt'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={setSearch}
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
