import { toast } from 'react-toastify';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTranslated } from '@/utils/format-translated';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { categoryColumns, type CategoryFormValues } from '@/columns/one/categories/one';
import {
  useDeleteCategory,
  useFetchCategories,
  useFetchCategoryById,
} from '@/pages/dashboard/categories/hooks/category';

import { CONFIG } from 'src/global-config';
import { Button } from 'src/shared/ui/button';
import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

const metadata = { title: `Subcategories | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryIdRaw = searchParams.get('category_id');
  const parentCategoryId = categoryIdRaw != null && categoryIdRaw !== '' ? Number(categoryIdRaw) : NaN;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const validParentId = Number.isFinite(parentCategoryId) && parentCategoryId > 0;

  const { data: parentCategoryResponse } = useFetchCategoryById(validParentId ? parentCategoryId : '');
  const parentLabel = useMemo(() => {
    const name = parentCategoryResponse?.data?.name;
    if (name == null) return '';
    return formatTranslated(name);
  }, [parentCategoryResponse?.data?.name]);

  const { data: categoriesResponse, isLoading, error } = useFetchCategories(
    currentPage,
    pageSize,
    validParentId ? { category_id: parentCategoryId } : undefined,
    { enabled: validParentId }
  );
  const deleteCategoryMutation = useDeleteCategory(currentPage, pageSize);

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  if (error) {
    console.error('Error fetching subcategories:', error);
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
      } catch {
        return;
      }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

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

  const subPath = (id: number) => `/categories/subcategories?category_id=${id}`;

  if (!validParentId) {
    return <Navigate to="/categories" replace />;
  }

  return (
    <>
      <title>{metadata.title}</title>

      <div className="mb-4">
        <Button
          type="button"
          variant="outlined"
          size="small"
          className="gap-2"
          onClick={() => navigate('/categories')}
        >
          <Iconify icon="solar:arrow-left-linear" width={18} height={18} />
          {t('backToParentCategories')}
        </Button>
      </div>

      <DataTable
        tableName={
          parentLabel
            ? `${t('tableNames.subcategories')} — ${parentLabel}`
            : t('tableNames.subcategories')
        }
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
          deletingId,
          {
            subcategoriesPath: subPath,
            hideParentColumn: false,
          }
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
          id: t('columns.id'),
          icon: t('columns.icon'),
          name: t('columns.name'),
          description: t('columns.description'),
          parent: t('columns.parent'),
          children_count: t('columns.children'),
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
