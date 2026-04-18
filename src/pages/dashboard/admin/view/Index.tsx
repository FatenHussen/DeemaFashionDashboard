import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { adminColumns, type AdminFormValues } from '@/columns/one/admin/one';
import { UpdatePasswordDialog } from '@/shared/components/update-password-dialog';
import { useFetchAdmins, useDeleteAdmin, useUpdateAdmin } from '@/pages/dashboard/admin/hooks/admin';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordDialogTargetId, setPasswordDialogTargetId] = useState<number | null>(null);

  const { data: adminsResponse, isLoading, error } = useFetchAdmins(currentPage, pageSize);
  const deleteAdminMutation = useDeleteAdmin();
  const updateAdminMutation = useUpdateAdmin();

  // Log error for debugging
  if (error) {
    console.error('Error fetching admins:', error);
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
        await deleteAdminMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const onUpdatePassword = (row: { original: AdminFormValues }) => {
    setPasswordDialogTargetId(row.original.id);
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async (data: { password: string; password_confirmation: string }) => {
    if (!passwordDialogTargetId) return;
    const admin = adminData.find((a) => a.id === passwordDialogTargetId);
    await updateAdminMutation.mutateAsync({
      id: passwordDialogTargetId,
      data: {
        name: admin?.name ?? '',
        email: admin?.email ?? '',
        password: data.password,
        password_confirmation: data.password_confirmation,
      },
    });
    toast.success(t('form.passwordUpdatedSuccess'));
    setPasswordDialogTargetId(null);
    setPasswordDialogOpen(false);
  };

  // Extract data from API response (map roles from API shape to form shape)
  const adminData: AdminFormValues[] = (adminsResponse?.data?.items || []).map((admin) => ({
    ...admin,
    roles: admin.roles?.map((r) => (typeof r === 'object' ? r.name : r)) ?? [],
  }));
  const apiPagination = adminsResponse?.data?.pagination;
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
      <title>{t('form.adminsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <UpdatePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
        isSubmitting={updateAdminMutation.isPending}
        entityName={t('tableNames.admin')}
        minLength={6}
      />

      <DataTable
        tableName={t("tableNames.admin")}
        columns={adminColumns(
          {
            update: hasPermission('update', 'admin'),
            delete: hasPermission('delete', 'admin'),
          },
          t,
          onDelete,
          deleteAdminMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          onUpdatePassword
        )}
        data={adminData}
        createPath="/admin/create"
        hasDetails
        detailsLink="/admin/update"
        permissions={{
          create: hasPermission('create', 'admin'),
          update: hasPermission('update', 'admin'),
          delete: hasPermission('delete', 'admin'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          email: t('columns.email'),
          roles: t('columns.roles'),
          status: t('columns.status'),
          created_at: t('columns.createdAt'),
          actions: t('columns.action'),
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
