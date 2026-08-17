import type { CategoryData } from '@/pages/dashboard/categories/types/category.types';

import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { useFetchCategoryAttributes } from '@/pages/dashboard/categories/hooks/category-attribute';
import { CategoryAttributeDeleteDialog } from '@/pages/dashboard/categories/components/category-attribute-delete-dialog';
import {
  categoryAttributeColumns,
  type CategoryAttributeFormValues,
} from '@/columns/one/categories/category-attribute';
import {
  buildCategorySelectRows,
  nativeSelectCategoryLabel,
} from '@/pages/dashboard/categories/utils/build-parent-picker-options';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

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
  const { t } = useTranslation(['table', 'nav']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, typeFilter, isActiveFilter, dateFrom, dateTo]);

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'category-attributes-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });
  const filterCategoryOptions = useMemo(
    () =>
      buildCategorySelectRows((categoriesResp?.data?.items ?? []) as CategoryData[]).filter(
        (c) => c.depth === 0
      ),
    [categoriesResp?.data?.items]
  );

  const {
    data: categoryAttributesResponse,
    isLoading,
    isError,
    error,
  } = useFetchCategoryAttributes({
    page: currentPage,
    per_page: pageSize,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(categoryFilter ? { category_id: Number(categoryFilter) } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(isActiveFilter === '' ? {} : { is_active: isActiveFilter === '1' }),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  });
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
    (categoryFilter ? 1 : 0) +
    (typeFilter ? 1 : 0) +
    (isActiveFilter ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const onFilterReset = () => {
    setCategoryFilter('');
    setTypeFilter('');
    setIsActiveFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  return (
    <>
      <title>{t('form.categoryAttributesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      {isError ? (
        <div className="mx-3 mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-4 md:mx-6">
          {getApiErrorMessage(error, t('form.categoryAttributesLoadErrorFallback'))}
        </div>
      ) : null}

      <DataTable
        tableName={t('nav:categoryAttributes')}
        columns={categoryAttributeColumns(
          {
            update: hasPermission('update', 'categoryattribute'),
            delete: hasPermission('delete', 'categoryattribute'),
          },
          t,
          onDelete
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
        filterSidebar={
          <div className="flex flex-col gap-5">
            <FilterGroup label={t('columns.category')}>
              <select
                className={filterSelectClass}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">{t('all')}</option>
                {filterCategoryOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {nativeSelectCategoryLabel(c.label, c.depth, c.hasChildren)}
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

            <FilterGroup label={t('fromDate')}>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={filterSelectClass}
              />
            </FilterGroup>

            <FilterGroup label={t('toDate')}>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={filterSelectClass}
              />
            </FilterGroup>
          </div>
        }
        activeFilterCount={activeFilterCount}
        onFilterReset={onFilterReset}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          category: t('columns.category'),
          type: t('columns.type'),
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
        <CategoryAttributeDeleteDialog
          id={deletingId}
          onCancel={onDeleteDialogClose}
          onDeleted={onDeleteDialogClose}
        />
      )}
    </>
  );
}
