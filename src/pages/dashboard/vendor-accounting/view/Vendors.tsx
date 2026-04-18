import type { ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { VendorAccountingRow } from '../types';

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useFetchVendorAccounting } from '../hooks';

// ----------------------------------------------------------------------

const metadata = { title: `Vendors Accounting | Dashboard - ${CONFIG.appName}` };

function formatCurrency(value: number | undefined | null) {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getVendorName(name: Record<string, string> | undefined) {
  if (!name) return '—';
  return name.en || name.ar || Object.values(name)[0] || '—';
}

export default function VendorAccountingVendorsPage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const params = {
    page: currentPage,
    per_page: pageSize,
    search: search || undefined,
    is_active: isActiveFilter !== '' ? isActiveFilter === 'true' : undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };

  const { data: response, isLoading } = useFetchVendorAccounting(params);

  const items: VendorAccountingRow[] = response?.data?.items || [];
  const apiPagination = response?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(
          apiPagination.current_page * apiPagination.per_page,
          apiPagination.total
        ),
      }
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const handleApplyFilters = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearch('');
    setIsActiveFilter('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const activeFilterCount = [
    search,
    isActiveFilter,
    fromDate,
    toDate,
  ].filter(Boolean).length;

  const columns: ColumnDef<VendorAccountingRow>[] = [
    {
      id: 'id',
      accessorKey: 'vendor.id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
      cell: ({ row }) => (
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">{row.original.vendor.id}</span>
        </div>
      ),
    },
    {
      id: 'vendor',
      accessorKey: 'vendor.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.vendorName')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-muted border border-border/60 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:shop-bold" className="text-muted-foreground" width={16} height={16} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {getVendorName(row.original.vendor.name)}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {row.original.vendor.owner_name}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      accessorKey: 'vendor.is_active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.status')} />
      ),
      cell: ({ row }) => {
        const active = row.original.vendor.is_active;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/50'
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50'
            }`}
          >
            <Iconify
              icon={active ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
              width={12}
              height={12}
            />
            {active ? t('active') : t('inactive')}
          </span>
        );
      },
    },
    {
      id: 'commission_rate',
      accessorKey: 'wallet.commission_rate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.commissionRate')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.original.wallet.commission_rate}%
        </span>
      ),
    },
    {
      id: 'gross_sales',
      accessorKey: 'wallet.gross_sales',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.grossSales')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {formatCurrency(row.original.wallet.gross_sales)}
        </span>
      ),
    },
    {
      id: 'net_due',
      accessorKey: 'wallet.net_due',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.netDue')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
          {formatCurrency(row.original.wallet.net_due)}
        </span>
      ),
    },
    {
      id: 'paid',
      accessorKey: 'wallet.paid',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.paid')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
          {formatCurrency(row.original.wallet.paid)}
        </span>
      ),
    },
    {
      id: 'available_for_withdraw',
      accessorKey: 'wallet.available_for_withdraw',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.availableForWithdraw')} />
      ),
      cell: ({ row }) => {
        const val = row.original.wallet.available_for_withdraw;
        return (
          <span
            className={`text-sm font-semibold ${
              val > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'
            }`}
          >
            {formatCurrency(val)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() =>
            navigate(paths.dashboard.vendorAccounting.vendorDetails(row.original.vendor.id))
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
        >
          <Iconify icon="solar:document-text-bold" width={14} height={14} />
          {t('viewStatement')}
        </button>
      ),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col gap-5">
      <FilterGroup label={t('filterSearch')}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t('filterSearch')}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </FilterGroup>

      <FilterGroup label={t('filterByActive')}>
        {[
          { key: '', label: t('all') },
          { key: 'true', label: t('active') },
          { key: 'false', label: t('inactive') },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setIsActiveFilter(key); setCurrentPage(1); }}
            className={`inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
              isActiveFilter === key
                ? 'border-primary/30 bg-primary text-primary-foreground shadow-sm'
                : 'border-border/60 bg-background text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label={t('fromDate')}>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </FilterGroup>

      <FilterGroup label={t('toDate')}>
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </FilterGroup>

      <button
        type="button"
        onClick={handleApplyFilters}
        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        <Iconify icon="solar:filter-bold" width={16} height={16} />
        {t('apply')}
      </button>
    </div>
  );

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName={t('tableNames.vendorAccounting')}
        columns={columns}
        data={items}
        searchColumns={[]}
        filterSidebar={sidebarContent}
        activeFilterCount={activeFilterCount}
        onFilterReset={handleResetFilters}
        permissions={{ create: false, update: false, delete: false }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          vendor: t('columns.vendorName'),
          status: t('columns.status'),
          commission_rate: t('columns.commissionRate'),
          gross_sales: t('columns.grossSales'),
          net_due: t('columns.netDue'),
          paid: t('columns.paid'),
          available_for_withdraw: t('columns.availableForWithdraw'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
      />
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
