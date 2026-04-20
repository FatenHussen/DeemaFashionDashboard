import { useTranslation } from 'react-i18next';
import { useState, useEffect, type ReactNode } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchUserPoints } from '@/pages/dashboard/user-points/hooks/user-points';
import { userPointsColumns, type UserPointsFormValues } from '@/columns/one/user-points/one';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState<string>('');
  const [balanceMin, setBalanceMin] = useState('');
  const [balanceMax, setBalanceMax] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const apiParams = {
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(balanceMin !== '' ? { balance_min: Number(balanceMin) } : {}),
    ...(balanceMax !== '' ? { balance_max: Number(balanceMax) } : {}),
  };

  const { data: userPointsResponse, isLoading, error } = useFetchUserPoints(
    currentPage,
    pageSize,
    Object.keys(apiParams).length > 0 ? apiParams : {}
  );

  if (error) {
    console.error('Error fetching user points:', error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const userPointsData: UserPointsFormValues[] = userPointsResponse?.data?.items || [];
  const apiPagination = userPointsResponse?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(apiPagination.current_page * apiPagination.per_page, apiPagination.total),
      }
    : {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  const activeFilterCount = [balanceMin, balanceMax].filter((v) => v !== '').length;

  const sidebarContent = (
    <>
      <FilterGroup label={t('form.balanceMin')}>
        <input
          type="number"
          placeholder={t('form.balanceMin')}
          value={balanceMin}
          onChange={(e) => { setBalanceMin(e.target.value); setCurrentPage(1); }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>

      <FilterGroup label={t('form.balanceMax')}>
        <input
          type="number"
          placeholder={t('form.balanceMax')}
          value={balanceMax}
          onChange={(e) => { setBalanceMax(e.target.value); setCurrentPage(1); }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FilterGroup>
    </>
  );

  return (
    <>
      <title>{t('form.userPointsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t("tableNames.userPoints")}
        columns={userPointsColumns(t)}
        data={userPointsData}
        hasDetails
        detailsLink="/user-points/details"
        filterSidebar={sidebarContent}
        activeFilterCount={activeFilterCount}
        onFilterReset={() => {
          setBalanceMin('');
          setBalanceMax('');
          setCurrentPage(1);
        }}
        permissions={{
          create: false,
          update: hasPermission('update', 'user-points'),
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.user'),
          balance: t('columns.balance'),
          total_earned: t('columns.earned'),
          total_redeemed: t('columns.redeemed'),
          total_transactions: t('columns.transactions'),
          expire_at: t('columns.expires'),
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
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
