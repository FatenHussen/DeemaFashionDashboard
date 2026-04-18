import { toast } from 'react-toastify';
import { Input } from '@/shared/ui/input';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
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

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const filterSelectClass =
  'h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-sm text-foreground shadow-sm transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15';

const ATTRIBUTE_TYPES = ['color', 'square', 'circle'] as const;

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('');

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedName(nameInput.trim());
    }, 400);
    return () => window.clearTimeout(id);
  }, [nameInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedName, categoryFilter, typeFilter, isActiveFilter]);

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'category-attributes-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });
  const filterCategories = categoriesResp?.data?.items ?? [];

  const {
    data: categoryAttributesResponse,
    isLoading,
    isError,
    error,
  } = useFetchCategoryAttributes({
    page: currentPage,
    per_page: pageSize,
    ...(debouncedName ? { name: debouncedName } : {}),
    ...(categoryFilter ? { category_id: Number(categoryFilter) } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(isActiveFilter === '' ? {} : { is_active: isActiveFilter === '1' }),
  });
  const deleteCategoryAttributeMutation = useDeleteCategoryAttribute();

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
      } catch {
        return;
      }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

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

  const activeFilterCount =
    (debouncedName ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (typeFilter ? 1 : 0) +
    (isActiveFilter ? 1 : 0);

  const onFilterReset = () => {
    setNameInput('');
    setDebouncedName('');
    setCategoryFilter('');
    setTypeFilter('');
    setIsActiveFilter('');
    setCurrentPage(1);
  };

  return (
    <>
      <title>{metadata.title}</title>

      {isError ? (
        <div className="mx-3 mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-4 md:mx-6">
          {getApiErrorMessage(error, 'Failed to load category attributes.')}
        </div>
      ) : null}

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
        hasDetails
        detailsLink="/categories/attributes/update"
        permissions={{
          create: hasPermission('create', 'categoryattribute'),
          update: hasPermission('update', 'categoryattribute'),
          delete: hasPermission('delete', 'categoryattribute'),
        }}
        isLoading={isLoading}
        searchColumns={[]}
        hasFilter
        toolbarFilter={
          <Input
            placeholder={t('search')}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="h-10 max-w-xs min-w-[200px] flex-1"
          />
        }
        filterSidebar={
          <div className="flex flex-col gap-5">
            <FilterGroup label={t('columns.category')}>
              <select
                className={filterSelectClass}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">{t('all')}</option>
                {filterCategories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {typeof c.name === 'object' ? formatTranslated(c.name as { en?: string; ar?: string }) : c.name}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label={t('form.attributeTypeLabel')}>
              <select
                className={filterSelectClass}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">{t('all')}</option>
                {ATTRIBUTE_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp === 'color'
                      ? t('form.attributeTypeColor')
                      : tp === 'square'
                        ? t('form.attributeTypeSquare')
                        : t('form.attributeTypeCircle')}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label={t('statusLabel')}>
              <select
                className={filterSelectClass}
                value={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.value as '' | '1' | '0')}
              >
                <option value="">{t('all')}</option>
                <option value="1">{t('active')}</option>
                <option value="0">{t('inactive')}</option>
              </select>
            </FilterGroup>
          </div>
        }
        activeFilterCount={activeFilterCount}
        onFilterReset={onFilterReset}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          category: 'Category',
          type: 'Type',
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
