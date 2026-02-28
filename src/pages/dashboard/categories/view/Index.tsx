import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { categoryColumns, type CategoryFormValues } from '@/columns/one/categories/one';
import { useDeleteCategory, useFetchCategories } from '@/pages/dashboard/categories/hooks/category';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Categories | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch categories using the hook
  const { data: categoriesResponse, isLoading, error } = useFetchCategories(
    currentPage,
    pageSize
  );
  const deleteCategoryMutation = useDeleteCategory(currentPage, pageSize);

  // Log error for debugging
  if (error) {
    console.error('Error fetching categories:', error);
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
        await deleteCategoryMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Category deleted successfully');
        setDeletingId(null);
      } catch {}
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const categoryData: CategoryFormValues[] = categoriesResponse?.data?.items || [];
  const apiPagination = categoriesResponse?.data?.pagination;
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
        tableName="Categories"
        columns={categoryColumns(
          {
            update: hasPermission('update', 'category'),
            delete: hasPermission('delete', 'category'),
          },
          t,
          onDelete,
          deleteCategoryMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={categoryData}
        createPath="/categories/create"
        hasDetails={false}
        permissions={{
          create: hasPermission('create', 'category'),
          update: hasPermission('update', 'category'),
          delete: hasPermission('delete', 'category'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          icon: 'Icon',
          name: 'Name',
          description: 'Description',
          parent: 'Parent',
          children_count: 'Children',
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

