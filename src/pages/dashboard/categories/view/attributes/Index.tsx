import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  categoryAttributeColumns,
  type CategoryAttributeFormValues,
} from '@/columns/one/categories/category-attribute';
import {
  useFetchCategoryAttributes,
  useDeleteCategoryAttribute,
} from '@/pages/dashboard/categories/hooks/category-attribute';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Category Attributes | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch category attributes using the hook
  const {
    data: categoryAttributesResponse,
    isLoading,
    error,
  } = useFetchCategoryAttributes(currentPage, pageSize);
  const deleteCategoryAttributeMutation = useDeleteCategoryAttribute();

  // Log error for debugging
  if (error) {
    console.error('Error fetching category attributes:', error);
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
        await deleteCategoryAttributeMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Category attribute deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const categoryAttributeData: CategoryAttributeFormValues[] =
    categoryAttributesResponse?.data?.items || [];
  const apiPagination = categoryAttributesResponse?.data?.pagination;
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
        tableName="Category Attributes"
        columns={categoryAttributeColumns(
          {
            update: hasPermission('update', 'categoryattribute'),
            delete: hasPermission('delete', 'categoryattribute'),
          },
          t,
          onDelete,
          deleteCategoryAttributeMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={categoryAttributeData}
        createPath="/categories/attributes/create"
        hasDetails={false}
        permissions={{
          create: hasPermission('create', 'categoryattribute'),
          update: hasPermission('update', 'categoryattribute'),
          delete: hasPermission('delete', 'categoryattribute'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          category: 'Category',
          type: 'Type',
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
