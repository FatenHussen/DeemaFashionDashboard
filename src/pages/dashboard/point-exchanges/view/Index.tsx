import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchPointExchanges } from '@/pages/dashboard/point-exchanges/hooks/point-exchange';
import { pointExchangeColumns, type PointExchangeFormValues } from '@/columns/one/point-exchanges/one';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Point Exchanges | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: exchangesResponse, isLoading, error } = useFetchPointExchanges(currentPage, pageSize);

  if (error) {
    console.error('Error fetching point exchanges:', error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const exchangeData: PointExchangeFormValues[] =
    (exchangesResponse?.data as { items?: PointExchangeFormValues[]; data?: PointExchangeFormValues[] } | undefined)
      ?.items ??
    (exchangesResponse?.data as { data?: PointExchangeFormValues[] } | undefined)?.data ??
    [];
  const apiPagination = exchangesResponse?.data?.pagination;
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

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName="Point Exchange"
        columns={pointExchangeColumns(t)}
        data={exchangeData}
        hasDetails
        detailsLink="/point-exchanges/details"
        permissions={{
          create: false,
          update: hasPermission('update', 'point-exchange'),
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          user_name: 'User',
          exchange_type: 'Type',
          points_used: 'Points',
          status: 'Status',
          delivered_at: 'Delivered',
          created_at: 'Created At',
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
