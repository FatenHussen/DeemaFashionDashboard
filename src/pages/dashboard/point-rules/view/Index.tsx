import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchPointRules } from '@/pages/dashboard/point-rules/hooks/point-rule';
import { pointRuleColumns, type PointRuleTableItem } from '@/columns/one/point-rules/one';

import { CONFIG } from 'src/global-config';

/*
 * Create + delete UI disabled (toolbar + row delete). Restore by:
 * - `dashboard.tsx`: uncomment `point-rules/create` route
 * - this file: `createPath`, `useDeletePointRule`, delete handlers, permissions create/delete
 */
// import { useDeletePointRule } from '@/pages/dashboard/point-rules/hooks/point-rule';
// import { toast } from 'react-toastify';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: response, isLoading } = useFetchPointRules(currentPage, pageSize);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleEdit = (row: { original: PointRuleTableItem }) => {
    navigate(`/point-rules/update/${row.original.id}`);
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
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{t('form.pointRulesIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t('tableNames.pointRule')}
        columns={pointRuleColumns(
          { update: hasPermission('update', 'pointrule'), delete: false },
          t,
          undefined,
          undefined,
          false,
          undefined,
          undefined,
          undefined,
          handleEdit
        )}
        data={rawItems as PointRuleTableItem[]}
        hasDetails
        detailsLink="/point-rules/details"
        permissions={{
          create: false,
          update: hasPermission('update', 'pointrule'),
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
