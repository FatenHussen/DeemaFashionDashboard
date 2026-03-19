import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { affiliateWithdrawColumns } from '@/columns/one/affiliate-withdraw-requests/one';
import { useFetchAffiliateWithdrawRequests } from '@/pages/dashboard/affiliate-withdraw-requests/hooks/affiliate-withdraw';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Affiliate Withdraw Requests | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: response, isLoading } = useFetchAffiliateWithdrawRequests(currentPage, pageSize);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

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

  return (
    <>
      <title>{metadata.title}</title>
      <DataTable
        tableName="Affiliate Withdraw Request"
        columns={affiliateWithdrawColumns(t)}
        data={items}
        hasDetails
        permissions={{ create: false, update: true, delete: false }}
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
