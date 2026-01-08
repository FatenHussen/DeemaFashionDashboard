import { CONFIG } from 'src/global-config';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { governorateColumns, type GovernorateFormValues } from '@/columns/one/locations/one';
import {
  useFetchGovernorates,
  useDeleteGovernorate,
} from '@/pages/dashboard/locations/hooks/governorate';
import { usePermissions } from '@/auth/hooks/use-permissions';

// ----------------------------------------------------------------------

const metadata = { title: `Government | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch governorates using the hook
  const {
    data: governoratesResponse,
    isLoading,
    error,
  } = useFetchGovernorates(currentPage, pageSize);
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
        toast.success(t('deleteSuccess') || 'Governorate deleted successfully');
        setDeletingId(null);
      } catch (error: any) {
        toast.error(error?.message || t('deleteError') || 'Failed to delete governorate');
      }
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

  const hasPermission = (action: string, resource: string) => {
    return can(`${resource}.${action}`);
  };

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName="Government"
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
        hasDetails={false}
        permissions={{
          create: hasPermission('create', 'governorate'),
          update: hasPermission('update', 'governorate'),
          delete: hasPermission('delete', 'governorate'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
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
