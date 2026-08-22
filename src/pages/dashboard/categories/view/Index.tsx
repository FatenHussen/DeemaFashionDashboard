import type { ReactNode } from 'react';
import type { SortableEntity } from '@/shared/ui/table-data/sort-items-dialog';
import type { CategoryData } from '@/pages/dashboard/categories/types/category.types';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Iconify } from '@/shared/components/iconify';
import { useNavigate, useSearchParams } from 'react-router';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { SortItemsDialog } from '@/shared/ui/table-data/sort-items-dialog';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { DataTableBreadcrumb } from '@/shared/ui/table-data/data-table-breadcrumb';
import { categoryColumns, type CategoryFormValues } from '@/columns/one/categories/one';
import {
  useSortCategories,
  useDeleteCategory,
  useFetchCategories,
} from '@/pages/dashboard/categories/hooks/category';
import {
  buildCategorySelectRows,
  nativeSelectCategoryLabel,
} from '@/pages/dashboard/categories/utils/build-parent-picker-options';
import {
  type CategoryTrailSegment,
  trailIdsEqual,
  hydrateCategoryTrail,
  parseCategoryTrailParam,
  serializeCategoryTrailParam,
} from '@/pages/dashboard/categories/utils/category-trail-params';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const MAX_CATEGORY_DEPTH = 5;

type SortField = '' | 'id' | 'order' | 'name' | 'created_at' | 'children_count';
type CategoryTab = 'normal' | 'restaurant';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: CategoryTab =
    searchParams.get('tab') === 'restaurant' ? 'restaurant' : 'normal';
  const isRestaurantTab = activeTab === 'restaurant';

  const [trail, setTrail] = useState<CategoryTrailSegment[]>([]);

  const urlTrailIds = useMemo(
    () => parseCategoryTrailParam(searchParams.get('trail'), MAX_CATEGORY_DEPTH),
    [searchParams]
  );
  const trailIds = useMemo(() => trail.map((s) => s.id), [trail]);

  const updateTrail = useCallback(
    (
      next:
        | CategoryTrailSegment[]
        | ((prev: CategoryTrailSegment[]) => CategoryTrailSegment[])
    ) => {
      setTrail((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        setSearchParams(
          (sp) => {
            const params = new URLSearchParams(sp);
            const serialized = serializeCategoryTrailParam(resolved.map((s) => s.id));
            if (serialized) params.set('trail', serialized);
            else params.delete('trail');
            return params;
          },
          { replace: true }
        );
        return resolved;
      });
    },
    [setSearchParams]
  );

  const { data: hydratedTrail, isError: isTrailHydrateError, error: trailHydrateError } =
    useQuery({
      queryKey: ['categories', 'trail-hydrate', urlTrailIds.join(',')],
      queryFn: () => hydrateCategoryTrail(urlTrailIds),
      enabled: urlTrailIds.length > 0 && !trailIdsEqual(urlTrailIds, trailIds),
      retry: false,
    });

  useEffect(() => {
    if (urlTrailIds.length === 0) {
      if (trail.length > 0) setTrail([]);
      return;
    }
    if (hydratedTrail && trailIdsEqual(urlTrailIds, hydratedTrail.map((s) => s.id))) {
      setTrail(hydratedTrail);
    }
  }, [urlTrailIds, hydratedTrail, trail.length]);

  useEffect(() => {
    if (!isTrailHydrateError) return;
    toast.error(getApiErrorMessage(trailHydrateError, t('form.categoriesLoadErrorFallback')));
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('trail');
        return next;
      },
      { replace: true }
    );
    setTrail([]);
  }, [isTrailHydrateError, trailHydrateError, setSearchParams, t]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [search, setSearch] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const parentId = trail.length === 0 ? 0 : trail[trail.length - 1].id;
  const tabRestaurantFilter = isRestaurantTab ? 1 : 0;

  const { data: flatCategoriesResp } = useQuery({
    queryKey: ['categories', 'flat-parent-select', activeTab],
    queryFn: () =>
      _CategoryApi.getListCategoriesPaginated({
        page: 1,
        per_page: 500,
        is_restaurant: tabRestaurantFilter,
      }),
  });
  const flatCategories = flatCategoriesResp?.data?.items ?? [];

  const parentSelectOptions = useMemo(
    () => buildCategorySelectRows((flatCategoriesResp?.data?.items ?? []) as CategoryData[]),
    [flatCategoriesResp?.data?.items]
  );

  const handleTabChange = useCallback(
    (tab: CategoryTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'normal') {
          next.delete('tab');
        } else {
          next.set('tab', tab);
        }
        return next;
      });
      updateTrail([]);
      setCurrentPage(1);
      setIsActiveFilter('');
      setSortField('');
      setSortOrder('asc');
    },
    [setSearchParams, updateTrail]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortOrder, trail, search, isActiveFilter, activeTab]);

  const { data: categoriesResponse, isLoading, isError, error } = useFetchCategories(
    currentPage,
    pageSize,
    {
      parent_id: parentId,
      is_restaurant: tabRestaurantFilter,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(isActiveFilter === '' ? {} : { is_active: isActiveFilter === '1' }),
      ...(sortField
        ? { sort_field: sortField, sort_order: sortOrder }
        : { sort_field: 'order', sort_order: 'asc' as const }),
    }
  );
  const deleteCategoryMutation = useDeleteCategory(currentPage, pageSize);
  const sortCategoriesMutation = useSortCategories();

  const { data: sortItemsResp, isFetching: isSortItemsLoading } = useQuery({
    queryKey: ['categories', 'sort-items', parentId, activeTab],
    queryFn: () =>
      _CategoryApi.getListCategoriesPaginated({
        page: 1,
        per_page: 500,
        parent_id: parentId,
        is_restaurant: tabRestaurantFilter,
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
      updateTrail((prev) => [...prev, { id: row.id, name }]);
    },
    [trail.length, t, updateTrail]
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

  const activeFilterCount = (isActiveFilter ? 1 : 0) + (sortField ? 1 : 0);

  const onFilterReset = () => {
    setIsActiveFilter('');
    setSortField('');
    setSortOrder('asc');
    updateTrail([]);
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

      <FilterGroup label={t('columns.parent')}>
        <select
          className={sortSelectClass}
          value={parentSelectValue}
          onChange={(e) => {
            const v = e.target.value;
            setCurrentPage(1);
            if (v === '0') {
              updateTrail([]);
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
            updateTrail(cat ? [{ id: cat.id, name: label }] : []);
          }}
        >
          <option value={0}>{t('categoryBreadcrumbRoot')}</option>
          {parentSelectOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {nativeSelectCategoryLabel(o.label, o.depth, o.hasChildren)}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label={t('categorySortField')}>{sortFieldSelect}</FilterGroup>
      {sortField ? <FilterGroup label={t('categorySortOrder')}>{sortOrderSelect}</FilterGroup> : null}
    </>
  );

  const createPath = `/categories/create?type=${activeTab}`;

  return (
    <>
      <title>{t('form.categoriesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      {isError ? (
        <div className="mx-3 mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-4 md:mx-6">
          {getApiErrorMessage(error, t('form.categoriesLoadErrorFallback'))}
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[1650px] space-y-4 px-3 pb-1 pt-2 sm:space-y-5 sm:px-5 md:px-7">
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-linear-to-b from-card via-card to-muted/20 shadow-sm">
          <div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4 md:px-6">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                  {CONFIG.appName}
                </p>
                <h1 className="mt-1 truncate text-lg font-bold text-foreground sm:text-xl">
                  {t('form.categoriesIndexDocumentTitle', { appName: CONFIG.appName })}
                </h1>
              </div>
              <div className="hidden h-9 items-center rounded-full border border-primary/20 bg-primary/8 px-3 text-xs font-semibold text-primary sm:inline-flex">
                {isRestaurantTab ? t('categoryRestaurantTab') : t('categoryNormalTab')}
              </div>
            </div>

            <div className="relative w-full max-w-xl">
              <div
                role="tablist"
                aria-label={t('form.categoriesIndexDocumentTitle', { appName: CONFIG.appName })}
                className="relative grid w-full grid-cols-2 items-stretch gap-1 rounded-2xl border border-primary/20 bg-card/95 p-1.5 shadow-sm ring-1 ring-border/40 sm:p-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'normal'}
                  onClick={() => handleTabChange('normal')}
                  className={[
                    'group relative flex min-h-[2.85rem] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 sm:min-h-[3rem] sm:px-5 sm:py-3.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                    activeTab === 'normal'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-primary/[0.06] hover:text-foreground',
                  ].join(' ')}
                >
                  <Iconify
                    icon="solar:shop-2-bold"
                    className={[
                      'h-[18px] w-[18px] shrink-0 transition-transform',
                      activeTab === 'normal'
                        ? 'text-primary-foreground'
                        : 'text-primary/80 group-hover:scale-110',
                    ].join(' ')}
                  />
                  <span className="truncate text-center sm:text-base">{t('categoryNormalTab')}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'restaurant'}
                  onClick={() => handleTabChange('restaurant')}
                  className={[
                    'group relative flex min-h-[2.85rem] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 sm:min-h-[3rem] sm:px-5 sm:py-3.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                    activeTab === 'restaurant'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-primary/[0.06] hover:text-foreground',
                  ].join(' ')}
                >
                  <Iconify
                    icon="solar:shop-bold"
                    className={[
                      'h-[18px] w-[18px] shrink-0 transition-transform',
                      activeTab === 'restaurant'
                        ? 'text-primary-foreground'
                        : 'text-orange-500/80 group-hover:scale-110',
                    ].join(' ')}
                  />
                  <span className="truncate text-center sm:text-base">
                    {t('categoryRestaurantTab')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <DataTable
        tableTop={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DataTableBreadcrumb
              ariaLabel={t('categoryBreadcrumbLabel')}
              rootLabel={t('categoryBreadcrumbRoot')}
              items={trail.map((s) => ({ id: s.id, label: s.name }))}
              onNavigate={(next) =>
                updateTrail(next.map((s) => ({ id: Number(s.id), name: s.label })))
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
        tableName={
          isRestaurantTab ? t('categoryRestaurantTab') : t('categoryNormalTab')
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
            onSubcategoriesClick: tryDrillIntoCategory,
            hideParentColumn: trail.length === 0,
            hideTypeColumn: true,
            categoryTab: activeTab,
            onBuildPage: (row) => {
              if (row.page_id == null || Number(row.page_id) <= 0) return;
              navigate(`/sections/pages/details/${row.page_id}`, {
                state: { from: 'categories' },
              });
            },
          }
        )}
        data={categoryData}
        createPath={createPath}
        hasDetails={false}
        onRowClick={tryDrillIntoCategory}
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
