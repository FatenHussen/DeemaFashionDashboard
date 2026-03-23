import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchPromotionRequests } from '@/pages/dashboard/promotion-requests/hooks/promotion-request';
import { promotionRequestColumns, type PromotionRequestTableItem } from '@/columns/one/promotion-requests/one';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Promotion Requests | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: response, isLoading } = useFetchPromotionRequests(currentPage, pageSize);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

  const onViewDetails = (id: number) => {
    navigate(`/promotion-requests/${id}`);
  };

  const rawItems = response?.data?.items ?? [];
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

  const { can } = usePermissions();

  return (
    <>
      <title>{metadata.title}</title>
      <DataTable
        tableName={t("tableNames.promotionRequest")}
        columns={promotionRequestColumns(t, onViewDetails)}
        data={rawItems as PromotionRequestTableItem[]}
        hasDetails={false}
        permissions={{
          create: false,
          update: can('promotionrequest.update'),
          delete: false,
        }}
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
