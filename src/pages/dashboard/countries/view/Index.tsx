import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { countryColumns, type CountryTableItem } from '@/columns/one/countries/one';
import { useDeleteCountry, useFetchCountries } from '@/pages/dashboard/countries/hooks/country';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: response, isLoading } = useFetchCountries(currentPage, pageSize);
  const deleteMutation = useDeleteCountry();

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };
  const onDeleteCancel = () => setDeletingId(null);

  const handleEdit = (row: { original: CountryTableItem }) => {
    navigate(`/countries/update/${row.original.id}`);
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
      <title>{t('form.countriesIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t("tableNames.country")}
        columns={countryColumns(
          { update: hasPermission('update', 'country'), delete: hasPermission('delete', 'country') },
          t, onDelete, deleteMutation.isPending, deletingId !== null,
          onDeleteConfirm, onDeleteCancel, deletingId, handleEdit
        )}
        data={rawItems as CountryTableItem[]}
        createPath="/countries/create"
        hasDetails
        detailsLink="/countries/update"
        permissions={{
          create: hasPermission('create', 'country'),
          update: hasPermission('update', 'country'),
          delete: hasPermission('delete', 'country'),
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
