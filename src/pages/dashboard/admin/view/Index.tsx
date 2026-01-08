import { CONFIG } from 'src/global-config';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { adminColumns, type AdminFormValues } from '@/columns/one/admin/one';
import { useFetchAdmins, useDeleteAdmin } from '@/pages/dashboard/admin/hooks/admin';
import { usePermissions } from '@/auth/hooks/use-permissions';

// ----------------------------------------------------------------------

const metadata = { title: `Admins | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch admins using the hook
  const { data: adminsResponse, isLoading, error } = useFetchAdmins(currentPage, pageSize);
  const deleteAdminMutation = useDeleteAdmin();

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
        toast.success(t('deleteSuccess') || 'Admin deleted successfully');
        setDeletingId(null);
      } catch (error: any) {
        toast.error(error?.message || t('deleteError') || 'Failed to delete admin');
      }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const adminData: AdminFormValues[] = adminsResponse?.data?.items || [];
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

  const hasPermission = (action: string, resource: string) => {
    return can(`${resource}.${action}`);
  };

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName="Admin"
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
          deletingId
        )}
        data={adminData}
        createPath="/admin/create"
        hasDetails={false}
        permissions={{
          create: hasPermission('create', 'admin'),
          update: hasPermission('update', 'admin'),
          delete: hasPermission('delete', 'admin'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          email: 'Email',
          roles: 'Roles',
          status: 'Status',
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
