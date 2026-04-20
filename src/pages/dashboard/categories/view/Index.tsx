import type { ReactNode } from 'react';
import type { SortableEntity } from '@/shared/ui/table-data/sort-items-dialog';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Iconify } from '@/shared/components/iconify';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { SortItemsDialog } from '@/shared/ui/table-data/sort-items-dialog';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { DataTableBreadcrumb } from '@/shared/ui/table-data/data-table-breadcrumb';
import { categoryColumns, type CategoryFormValues } from '@/columns/one/categories/one';
import {
  useSortCategories,
  useDeleteCategory,
  useFetchCategories,
} from '@/pages/dashboard/categories/hooks/category';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const MAX_CATEGORY_DEPTH = 5;

type SortField = '' | 'id' | 'order' | 'name' | 'created_at' | 'children_count';

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const sortSelectClass =
  'h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-sm text-foreground shadow-sm transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15';

export default function Page() {
  const { t } = useTranslation('table');
  const [trail, setTrail] = useState<{ id: number; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [search, setSearch] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('');
  const [isRestaurantFilter, setIsRestaurantFilter] = useState<'' | '1' | '0'>('');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const parentId = trail.length === 0 ? 0 : trail[trail.length - 1].id;

  const { data: flatCategoriesResp } = useQuery({
    queryKey: ['categories', 'flat-parent-select'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });
  const flatCategories = flatCategoriesResp?.data?.items ?? [];

  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortOrder, trail, search, isActiveFilter, isRestaurantFilter]);

  const { data: categoriesResponse, isLoading, isError, error } = useFetchCategories(
    currentPage,
    pageSize,
    {
      parent_id: parentId,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(isActiveFilter === '' ? {} : { is_active: isActiveFilter === '1' }),
      ...(isRestaurantFilter === '' ? {} : { is_restaurant: isRestaurantFilter === '1' }),
      // Default to `order asc` so the saved drag-and-drop order is reflected
      // when the user hasn't picked an explicit sort.
      ...(sortField
        ? { sort_field: sortField, sort_order: sortOrder }
        : { sort_field: 'order', sort_order: 'asc' as const }),
    }
  );
  const deleteCategoryMutation = useDeleteCategory(currentPage, pageSize);
  const sortCategoriesMutation = useSortCategories();

  // Fetch ALL siblings under the current parent (sorted by `order` asc) for the
  // drag-and-drop dialog. We deliberately do not paginate here so the saved
  // `ordered_ids` array stays consistent with what the backend expects.
  const { data: sortItemsResp, isFetching: isSortItemsLoading } = useQuery({
    queryKey: ['categories', 'sort-items', parentId],
    queryFn: () =>
      _CategoryApi.getListCategoriesPaginated({
        page: 1,
        per_page: 500,
        parent_id: parentId,
        sort_field: 'order',
        sort_order: 'asc',
      }),
    enabled: isSortOpen,
  });

  const sortItems: SortableEntity[] = useMemo(() => {
    const rows = sortItemsResp?.data?.items ?? [];
    return rows.map((row) => ({
      id: row.id,
      label:
        typeof row.name === 'object'
          ? formatTranslated(row.name as { en?: string; ar?: string })
          : String(row.name ?? ''),
      image: (row as { icon?: string | null }).icon ?? null,
    }));
  }, [sortItemsResp]);

  const handleSortSave = async (orderedIds: number[]) => {
    try {
      await sortCategoriesMutation.mutateAsync({
        ordered_ids: orderedIds,
        parent_id: parentId > 0 ? parentId : undefined,
      });
      toast.success(t('orderUpdatedSuccess'));
      setIsSortOpen(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e, t('orderUpdatedError')));
    }
  };

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
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch {
        return;
      }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const tryDrillIntoCategory = useCallback(
    (row: CategoryFormValues) => {
      if (trail.length >= MAX_CATEGORY_DEPTH) {
        toast.info(t('categoryMaxDepthReached'));
        return;
      }
      if (row.children_count <= 0) {
        toast.info(t('categoryNoSubcategories'));
        return;
      }
      const name = formatTranslated(row.name);
      setTrail((prev) => [...prev, { id: row.id, name }]);
    },
    [trail.length, t]
  );

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

  const activeFilterCount =
    (isActiveFilter ? 1 : 0) +
    (isRestaurantFilter ? 1 : 0) +
    (sortField ? 1 : 0);

  const onFilterReset = () => {
    setIsActiveFilter('');
    setIsRestaurantFilter('');
    setSortField('');
    setSortOrder('asc');
    setTrail([]);
    setCurrentPage(1);
  };

  const sortFieldSelect = (
    <select
      className={sortSelectClass}
      value={sortField}
      onChange={(e) => setSortField(e.target.value as SortField)}
    >
      <option value="">{t('categorySortDefault')}</option>
      <option value="id">{t('columns.id')}</option>
      <option value="name">{t('columns.name')}</option>
      <option value="order">{t('columns.order')}</option>
      <option value="children_count">{t('columns.children')}</option>
      <option value="created_at">{t('columns.createdAt')}</option>
    </select>
  );

  const sortOrderSelect = sortField ? (
    <select
      className={sortSelectClass}
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
    >
      <option value="asc">{t('categorySortAsc')}</option>
      <option value="desc">{t('categorySortDesc')}</option>
    </select>
  ) : null;

  const parentSelectValue = trail.length === 0 ? 0 : trail[trail.length - 1].id;

  const filterSidebar = (
    <>
      <FilterGroup label={t('statusLabel')}>
        <select
          className={sortSelectClass}
          value={isActiveFilter}
          onChange={(e) => setIsActiveFilter(e.target.value as '' | '1' | '0')}
        >
          <option value="">{t('all')}</option>
          <option value="1">{t('active')}</option>
          <option value="0">{t('inactive')}</option>
        </select>
      </FilterGroup>

      <FilterGroup label={t('columns.type')}>
        <select
          className={sortSelectClass}
          value={isRestaurantFilter}
          onChange={(e) => setIsRestaurantFilter(e.target.value as '' | '1' | '0')}
        >
          <option value="">{t('all')}</option>
          <option value="1">{t('yes')}</option>
          <option value="0">{t('no')}</option>
        </select>
      </FilterGroup>

      <FilterGroup label={t('columns.parent')}>
        <select
          className={sortSelectClass}
          value={parentSelectValue}
          onChange={(e) => {
            const v = e.target.value;
            setCurrentPage(1);
            if (v === '0') {
              setTrail([]);
              return;
            }
            const id = Number(v);
            const cat = flatCategories.find((c) => c.id === id);
            const label =
              cat != null
                ? typeof cat.name === 'object'
                  ? formatTranslated(cat.name as { en?: string; ar?: string })
                  : String(cat.name)
                : '';
            setTrail(cat ? [{ id: cat.id, name: label }] : []);
          }}
        >
          <option value={0}>{t('categoryBreadcrumbRoot')}</option>
          {flatCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {typeof c.name === 'object' ? formatTranslated(c.name as { en?: string; ar?: string }) : c.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label={t('categorySortField')}>{sortFieldSelect}</FilterGroup>
      {sortField ? <FilterGroup label={t('categorySortOrder')}>{sortOrderSelect}</FilterGroup> : null}
    </>
  );

  return (
    <>
      <title>{t('form.categoriesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      {isError ? (
        <div className="mx-3 mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-4 md:mx-6">
          {getApiErrorMessage(error, t('form.categoriesLoadErrorFallback'))}
        </div>
      ) : null}

      <DataTable
        tableTop={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DataTableBreadcrumb
              ariaLabel={t('categoryBreadcrumbLabel')}
              rootLabel={t('categoryBreadcrumbRoot')}
              items={trail.map((s) => ({ id: s.id, label: s.name }))}
              onNavigate={(next) =>
                setTrail(next.map((s) => ({ id: Number(s.id), name: s.label })))
              }
            />
            {hasPermission('update', 'category') ? (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => setIsSortOpen(true)}
              >
                <Iconify icon="lucide:arrow-up-down" width={16} className="me-1.5" />
                {t('reorder')}
              </Button>
            ) : null}
          </div>
        }
        tableName={t('tableNames.category')}
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
            onSubcategoriesClick: tryDrillIntoCategory,
            hideParentColumn: trail.length === 0,
          }
        )}
        data={categoryData}
        createPath="/categories/create"
        hasDetails={false}
        onRowClick={tryDrillIntoCategory}
        hasFilter
        filterSidebar={filterSidebar}
        activeFilterCount={activeFilterCount}
        onFilterReset={onFilterReset}
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
          is_restaurant: t('columns.type'),
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

      <SortItemsDialog
        open={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        items={sortItems}
        title={t('reorderCategoriesTitle')}
        description={
          parentId > 0
            ? t('reorderCategoriesScopeChild')
            : t('reorderCategoriesScopeRoot')
        }
        onSave={handleSortSave}
        isSubmitting={sortCategoriesMutation.isPending}
        isLoading={isSortItemsLoading}
      />
    </>
  );
}
