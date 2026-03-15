import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { cityColumns, type CityFormValues } from '@/columns/one/locations/city';
import { useDeleteCity, useFetchCities } from '@/pages/dashboard/locations/hooks/city';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `City | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch cities using the hook
  const { data: citiesResponse, isLoading, error } = useFetchCities(currentPage, pageSize);
  const deleteCityMutation = useDeleteCity(currentPage, pageSize);

  // Log error for debugging
  if (error) {
    console.error('Error fetching cities:', error);
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
        await deleteCityMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'City deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const cityData: CityFormValues[] = citiesResponse?.data?.items || [];
  const apiPagination = citiesResponse?.data?.pagination;
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
      <title>{metadata.title}</title>

      <DataTable
        tableName="City"
        columns={cityColumns(
          {
            update: hasPermission('update', 'city'),
            delete: hasPermission('delete', 'city'),
          },
          t,
          onDelete,
          deleteCityMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={cityData}
        createPath="/locations/city/create"
        hasDetails={false}
        permissions={{
          create: hasPermission('create', 'city'),
          update: hasPermission('update', 'city'),
          delete: hasPermission('delete', 'city'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          governorate: 'Governorate',
          created_at: 'Created At',
          actions: 'Actions',
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

