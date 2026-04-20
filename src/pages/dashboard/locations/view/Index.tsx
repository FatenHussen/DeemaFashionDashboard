import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { governorateColumns, type GovernorateFormValues } from '@/columns/one/locations/one';
import {
  useFetchGovernorates,
  useDeleteGovernorate,
} from '@/pages/dashboard/locations/hooks/governorate';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const governorateParams: { search?: string } = {};
  if (search.trim()) governorateParams.search = search.trim();

  // Fetch governorates using the hook
  const {
    data: governoratesResponse,
    isLoading,
    error,
  } = useFetchGovernorates(currentPage, pageSize, governorateParams);
  const deleteGovernorateMutation = useDeleteGovernorate(currentPage, pageSize);

  // Log error for debugging
  if (error) {
    console.error('Error fetching governorates:', error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const onDelete = (id: number) => {
    setDeletingId(id);
  };

  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteGovernorateMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const governorateData: GovernorateFormValues[] = governoratesResponse?.data?.items || [];
  const apiPagination = governoratesResponse?.data?.pagination;
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
      <title>{t('form.governoratesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t("tableNames.government")}
        columns={governorateColumns(
          {
            update: hasPermission('update', 'governorate'),
            delete: hasPermission('delete', 'governorate'),
          },
          t,
          onDelete,
          deleteGovernorateMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={governorateData}
        createPath="/locations/create"
        hasDetails
        detailsLink="/locations/update"
        permissions={{
          create: hasPermission('create', 'governorate'),
          update: hasPermission('update', 'governorate'),
          delete: hasPermission('delete', 'governorate'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
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
