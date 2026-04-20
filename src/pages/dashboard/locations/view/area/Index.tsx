import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { areaColumns, type AreaFormValues } from '@/columns/one/locations/area';
import { useFetchAreas, useDeleteArea } from '@/pages/dashboard/locations/hooks/area';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation(['table', 'nav']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const areaParams: { search?: string } = {};
  if (search.trim()) areaParams.search = search.trim();

  // Fetch areas using the hook
  const { data: areasResponse, isLoading, error } = useFetchAreas(currentPage, pageSize, areaParams);
  const deleteAreaMutation = useDeleteArea(currentPage, pageSize);

  // Log error for debugging
  if (error) {
    console.error('Error fetching areas:', error);
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
        await deleteAreaMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const areaData: AreaFormValues[] = areasResponse?.data?.items || [];
  const apiPagination = areasResponse?.data?.pagination;
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
      <title>{t('form.areasIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('nav:area')}
        columns={areaColumns(
          {
            update: hasPermission('update', 'area'),
            delete: hasPermission('delete', 'area'),
          },
          t,
          onDelete,
          deleteAreaMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={areaData}
        createPath="/locations/area/create"
        hasDetails
        detailsLink="/locations/area/details"
        permissions={{
          create: hasPermission('create', 'area'),
          update: hasPermission('update', 'area'),
          delete: hasPermission('delete', 'area'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          city: t('columns.city'),
          governorate: t('columns.governorate'),
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

