import { CONFIG } from 'src/global-config';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { driverColumns, type DriverFormValues } from '@/columns/one/driver/one';
import { useFetchDrivers, useDeleteDriver } from '@/pages/dashboard/driver/hooks/driver';
import { usePermissions } from '@/auth/hooks/use-permissions';

// ----------------------------------------------------------------------

const metadata = { title: `Drivers | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch drivers using the hook
  const { data: driversResponse, isLoading, error } = useFetchDrivers(currentPage, pageSize);
  const deleteDriverMutation = useDeleteDriver();

  // Log error for debugging
  if (error) {
    console.error('Error fetching drivers:', error);
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
        await deleteDriverMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Driver deleted successfully');
        setDeletingId(null);
      } catch (error: any) {
        toast.error(error?.message || t('deleteError') || 'Failed to delete driver');
      }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const driverData: DriverFormValues[] = driversResponse?.data?.items || [];
  const apiPagination = driversResponse?.data?.pagination;
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

  const hasPermission = (action: string, resource: string) => {
    return can(`${resource}.${action}`);
  };

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName="Driver"
        columns={driverColumns(
          {
            update: hasPermission('update', 'driver'),
            delete: hasPermission('delete', 'driver'),
          },
          t,
          onDelete,
          deleteDriverMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={driverData}
        createPath="/driver/create"
        hasDetails={true}
        permissions={{
          create: hasPermission('create', 'driver'),
          update: hasPermission('update', 'driver'),
          delete: hasPermission('delete', 'driver'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          phone: 'Phone',
          address: 'Address',
          status: 'Status',
          is_active: 'Active',
          rate_per_order: 'Rate per Order',
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
