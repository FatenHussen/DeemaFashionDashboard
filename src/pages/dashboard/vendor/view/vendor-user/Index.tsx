import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { UpdatePasswordDialog } from '@/shared/components/update-password-dialog';
import { vendorUserColumns, type VendorUserFormValues } from '@/columns/one/vendor/vendor-user';

import { CONFIG } from 'src/global-config';

import { useFetchVendorUsers, useDeleteVendorUser, useUpdateVendorUser, useFetchVendorUserById } from '../../hooks/vendor-user';

// ----------------------------------------------------------------------

const metadata = { title: `Vendor Users | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordDialogTargetId, setPasswordDialogTargetId] = useState<number | null>(null);

  const { data: response, isLoading } = useFetchVendorUsers(currentPage, pageSize);
  const { data: vendorUserDetailsResponse } = useFetchVendorUserById(passwordDialogTargetId ?? '');
  const deleteVendorUserMutation = useDeleteVendorUser();
  const updateVendorUserMutation = useUpdateVendorUser();

  const vendorUserData: VendorUserFormValues[] = (response?.data?.items || []).map((item) => ({
    ...item,
    is_active: Boolean(item.is_active),
  })) as VendorUserFormValues[];
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

  const onDelete = (id: number) => {
    setPendingDeleteId(id);
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteVendorUserMutation.mutateAsync(pendingDeleteId);
      toast.success('Vendor user deleted successfully');
    } catch { return; } finally {
      setIsDeleteDialogOpen(false);
      setPendingDeleteId(null);
      setDeletingId(null);
    }
  };

  const onDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setPendingDeleteId(null);
    setDeletingId(null);
  };

  const onUpdatePassword = (row: { original: VendorUserFormValues }) => {
    setPasswordDialogTargetId(row.original.id);
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async (data: { password: string; password_confirmation: string }) => {
    if (!passwordDialogTargetId) return;
    const item = vendorUserDetailsResponse?.data ?? vendorUserData.find((u) => u.id === passwordDialogTargetId);
    await updateVendorUserMutation.mutateAsync({
      id: passwordDialogTargetId,
      data: {
        name: item?.name ?? '',
        email: item?.email ?? '',
        vendor_id: item?.vendor_id ?? 0,
        password: data.password,
        password_confirmation: data.password_confirmation,
      } as any,
    });
    toast.success('Password updated successfully');
    setPasswordDialogTargetId(null);
    setPasswordDialogOpen(false);
  };

  return (
    <>
      <title>{metadata.title}</title>

      <UpdatePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
        isSubmitting={updateVendorUserMutation.isPending}
        entityName="Vendor User"
        minLength={8}
      />

      <DataTable
        tableName="Vendor Users"
        columns={vendorUserColumns(
          {
            update: hasPermission('update', 'vendoruser'),
            delete: hasPermission('delete', 'vendoruser'),
          },
          t,
          onDelete,
          deleteVendorUserMutation.isPending,
          isDeleteDialogOpen,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          onUpdatePassword
        )}
        data={vendorUserData}
        createPath="/vendor-users/create"
        hasDetails
        detailsLink="/vendor-users/details"
        permissions={{
          create: hasPermission('create', 'vendoruser'),
          update: hasPermission('update', 'vendoruser'),
          delete: hasPermission('delete', 'vendoruser'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          email: 'Email',
          vendor_name: 'Vendor',
          shops_count: 'Shops',
          is_active: 'Status',
          created_at: 'Created',
          actions: 'Actions',
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </>
  );
}
