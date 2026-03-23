import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchUserPoints } from '@/pages/dashboard/user-points/hooks/user-points';
import { userPointsColumns, type UserPointsFormValues } from '@/columns/one/user-points/one';

import { CONFIG } from 'src/global-config';

const metadata = { title: `User Points | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [balanceMin, setBalanceMin] = useState('');
  const [balanceMax, setBalanceMax] = useState('');

  const [appliedFilters, setAppliedFilters] = useState<{
    search?: string;
    balance_min?: number;
    balance_max?: number;
  }>({});

  const { data: userPointsResponse, isLoading, error } = useFetchUserPoints(
    currentPage,
    pageSize,
    appliedFilters
  );

  if (error) {
    console.error('Error fetching user points:', error);
  }

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(balanceMin !== '' ? { balance_min: Number(balanceMin) } : {}),
      ...(balanceMax !== '' ? { balance_max: Number(balanceMax) } : {}),
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setBalanceMin('');
    setBalanceMax('');
    setAppliedFilters({});
    setCurrentPage(1);
  };

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

  const hasActiveFilters = Object.keys(appliedFilters).length > 0;

  const filterContent = (
    <>
      <input
        type="text"
        placeholder={t('form.searchByNameOrEmail')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
        className="h-10 w-64 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        type="number"
        placeholder={t('form.balanceMin')}
        value={balanceMin}
        onChange={(e) => setBalanceMin(e.target.value)}
        className="h-10 w-28 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        type="number"
        placeholder={t('form.balanceMax')}
        value={balanceMax}
        onChange={(e) => setBalanceMax(e.target.value)}
        className="h-10 w-28 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <Button variant="outlined" size="small" onClick={handleApplyFilters} className="h-10 px-4 rounded-xl">
        {t('apply')}
      </Button>
      {hasActiveFilters && (
        <Button variant="text" size="small" onClick={handleResetFilters} className="h-10 px-4 rounded-xl text-muted-foreground hover:text-foreground">
          {t('resetFilter')}
        </Button>
      )}
    </>
  );

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName={t("tableNames.userPoints")}
        columns={userPointsColumns(t)}
        data={userPointsData}
        hasDetails
        detailsLink="/user-points/details"
        toolbarFilter={filterContent}
        permissions={{
          create: false,
          update: hasPermission('update', 'user-points'),
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'User',
          balance: 'Balance',
          total_earned: 'Earned',
          total_redeemed: 'Redeemed',
          total_transactions: 'Transactions',
          expire_at: 'Expires',
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
