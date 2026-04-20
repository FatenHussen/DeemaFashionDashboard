import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { roleColumns, type RoleFormValues } from '@/columns/one/role/one';
import { useFetchRoles, useDeleteRole } from '@/pages/dashboard/roles/hooks/role';

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

  // Fetch roles using the hook
  const { data: rolesResponse, isLoading, error } = useFetchRoles(
    currentPage,
    pageSize,
    search.trim() || undefined
  );
  const deleteRoleMutation = useDeleteRole();

  // Log error for debugging
  if (error) {
    console.error('Error fetching roles:', error);
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
        await deleteRoleMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const roleData: RoleFormValues[] = rolesResponse?.data?.items || [];
  const apiPagination = rolesResponse?.data?.pagination;
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
      <title>{t('form.rolesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t("tableNames.role")}
        columns={roleColumns(
          {
            update: hasPermission('update', 'role'),
            delete: hasPermission('delete', 'role'),
          },
          t,
          onDelete,
          deleteRoleMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={roleData}
        createPath="/role/create"
        hasDetails
        detailsLink="/role/details"
        permissions={{
          create: hasPermission('create', 'role'),
          update: hasPermission('update', 'role'),
          delete: hasPermission('delete', 'role'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.roleName'),
          guard_name: t('columns.guard'),
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
