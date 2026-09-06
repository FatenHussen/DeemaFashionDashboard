import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { formatTranslated } from '@/utils/format-translated';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { categoryColumns, type CategoryFormValues } from '@/columns/one/categories/one';
import { CategoryDeleteDialog } from '@/pages/dashboard/categories/components/category-delete-dialog';
import {
  useFetchCategories,
  useFetchCategoryById,
} from '@/pages/dashboard/categories/hooks/category';

import { CONFIG } from 'src/global-config';
import { Button } from 'src/shared/ui/button';
import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryIdRaw = searchParams.get('category_id');
  const parentCategoryId = categoryIdRaw != null && categoryIdRaw !== '' ? Number(categoryIdRaw) : NaN;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
    validParentId
      ? {
          parent_id: parentCategoryId,
          ...(search.trim() ? { search: search.trim() } : {}),
        }
      : undefined,
    { enabled: validParentId }
  );

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

  const onDeleteDialogClose = () => {
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
      <title>{t('form.subcategoriesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

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
          {
            subcategoriesPath: subPath,
            hideParentColumn: false,
            onBuildPage: (row) => {
              if (row.page_id == null || Number(row.page_id) <= 0) return;
              navigate(`/sections/pages/details/${row.page_id}`, {
                state: { from: 'categories' },
              });
            },
          }
        )}
        data={categoryData}
        createPath={`/categories/create?parent_id=${parentCategoryId}`}
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
        onSearchChange={setSearch}
      />

      {deletingId != null && (
        <CategoryDeleteDialog
          id={deletingId}
          onCancel={onDeleteDialogClose}
          onDeleted={onDeleteDialogClose}
        />
      )}
    </>
  );
}
