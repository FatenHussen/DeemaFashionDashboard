import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  categoryDetailColumns,
  type CategoryDetailFormValues,
} from '@/columns/one/categories/category-detail';
import {
  useFetchCategoryDetails,
  useDeleteCategoryDetail,
} from '@/pages/dashboard/categories/hooks/category-detail';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Category Details | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch category details using the hook
  const {
    data: categoryDetailsResponse,
    isLoading,
    error,
  } = useFetchCategoryDetails(currentPage, pageSize);
  const deleteCategoryDetailMutation = useDeleteCategoryDetail();

  // Log error for debugging
  if (error) {
    console.error('Error fetching category details:', error);
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
        await deleteCategoryDetailMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Category detail deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const categoryDetailData: CategoryDetailFormValues[] =
    categoryDetailsResponse?.data?.items || [];
  const apiPagination = categoryDetailsResponse?.data?.pagination;
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
        tableName="Category Details"
        columns={categoryDetailColumns(
          {
            update: hasPermission('update', 'categorydetail'),
            delete: hasPermission('delete', 'categorydetail'),
          },
          t,
          onDelete,
          deleteCategoryDetailMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={categoryDetailData}
        createPath="/categories/details/create"
        hasDetails={false}
        permissions={{
          create: hasPermission('create', 'categorydetail'),
          update: hasPermission('update', 'categorydetail'),
          delete: hasPermission('delete', 'categorydetail'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          category: 'Category',
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
