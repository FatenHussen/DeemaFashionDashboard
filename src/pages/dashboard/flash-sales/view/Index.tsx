import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { flashSaleColumns, type FlashSaleRow } from '@/columns/one/flash-sales/one';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useFetchFlashSales } from '../hooks';
import { FLASH_SALE_PERMISSION } from '../permissions';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const params: { search?: string } = {};
  if (search.trim()) params.search = search.trim();

  const { data: response, isLoading } = useFetchFlashSales(currentPage, pageSize, params);

  const onEditNavigate = (row: FlashSaleRow) => {
    navigate(paths.dashboard.flashSales.update(row.id));
  };

  const items: FlashSaleRow[] = response?.data?.items || [];
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
  const hasPermission = (action: keyof typeof FLASH_SALE_PERMISSION) => can(FLASH_SALE_PERMISSION[action]);

  return (
    <>
      <title>{t('form.flashSaleIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.flashSale')}
        columns={flashSaleColumns({ update: hasPermission('update') }, t, onEditNavigate)}
        data={items}
        createPath={paths.dashboard.flashSales.create}
        hasDetails={false}
        rowClickToDetails={false}
        permissions={{
          create: hasPermission('create'),
          update: hasPermission('update'),
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          name: t('columns.name'),
          end_date: t('columns.endDate'),
          is_active: t('columns.status'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSearchChange={setSearch}
      />
    </>
  );
}
