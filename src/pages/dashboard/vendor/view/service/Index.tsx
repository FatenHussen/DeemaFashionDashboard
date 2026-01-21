import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { serviceColumns, type ServiceFormValues } from '@/columns/one/services/service';
import { useFetchServices, useDeleteService } from '../../hooks/service';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Services | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch services using the hook
  const { data: servicesResponse, isLoading, error } = useFetchServices(currentPage, pageSize);
  const deleteServiceMutation = useDeleteService();

  // Log error for debugging
  if (error) {
    console.error('Error fetching services:', error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const onDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteServiceMutation.mutateAsync(id);
        toast.success('Service deleted successfully');
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete service');
      }
    }
  };

  // Extract data from API response
  const serviceData: ServiceFormValues[] = servicesResponse?.data?.items || [];
  const apiPagination = servicesResponse?.data?.pagination;
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

      <DataTable
        tableName="Services"
        columns={serviceColumns(
          {
            update: hasPermission('update', 'service'),
            delete: hasPermission('delete', 'service'),
          },
          t,
          onDelete,
          deleteServiceMutation.isPending
        )}
        data={serviceData}
        createPath="/services/create"
        hasDetails={false}
        permissions={{
          create: hasPermission('create', 'service'),
          update: hasPermission('update', 'service'),
          delete: hasPermission('delete', 'service'),
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
