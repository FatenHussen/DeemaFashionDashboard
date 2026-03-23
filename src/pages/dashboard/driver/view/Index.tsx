import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { driverColumns, type DriverFormValues } from '@/columns/one/driver/one';
import { UpdatePasswordDialog } from '@/shared/components/update-password-dialog';
import { useFetchDrivers, useDeleteDriver, useUpdateDriver, useFetchDriverById } from '@/pages/dashboard/driver/hooks/driver';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Drivers | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordDialogTargetId, setPasswordDialogTargetId] = useState<number | null>(null);

  const { data: driversResponse, isLoading, error } = useFetchDrivers(currentPage, pageSize);
  const { data: driverDetailsResponse } = useFetchDriverById(passwordDialogTargetId ?? '');
  const deleteDriverMutation = useDeleteDriver();
  const updateDriverMutation = useUpdateDriver();

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
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const onUpdatePassword = (row: { original: DriverFormValues }) => {
    setPasswordDialogTargetId(row.original.id);
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async (data: { password: string; password_confirmation: string }) => {
    if (!passwordDialogTargetId) return;
    const driver = driverDetailsResponse?.data ?? driverData.find((d) => d.id === passwordDialogTargetId);
    const areaIds = (driver as any)?.areas?.map((a: { id: number }) => ({ id: a.id })) ?? [];
    await updateDriverMutation.mutateAsync({
      id: passwordDialogTargetId,
      data: {
        name: driver?.name ?? '',
        phone: driver?.phone ?? '',
        address: driver?.address ?? '',
        area_ids: areaIds.length > 0 ? areaIds : [{ id: 0 }],
        password: data.password,
        password_confirmation: data.password_confirmation,
      } as any,
    });
    toast.success('Password updated successfully');
    setPasswordDialogTargetId(null);
    setPasswordDialogOpen(false);
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

  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{metadata.title}</title>

      <UpdatePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
        isSubmitting={updateDriverMutation.isPending}
        entityName="Driver"
        minLength={8}
      />

      <DataTable
        tableName={t("tableNames.driver")}
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
          deletingId,
          onUpdatePassword
        )}
        data={driverData}
        createPath="/driver/create"
        hasDetails
        permissions={{
          create: hasPermission('create', 'driver'),
          update: hasPermission('update', 'driver'),
          delete: hasPermission('delete', 'driver'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          phone: 'Phone',
          address: 'Address',
          status: 'Status',
          is_active: 'Active',
          rate_per_order: 'Rate per Order',
          average_rating: 'Avg Rating',
          total_orders: 'Total Orders',
          completed_orders: 'Completed',
          total_earnings: 'Total Earnings',
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
