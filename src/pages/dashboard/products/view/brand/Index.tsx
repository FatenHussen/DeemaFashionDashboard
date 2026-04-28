import type { SortableEntity } from '@/shared/ui/table-data/sort-items-dialog';
import type { CategoryData } from '@/pages/dashboard/categories/types/category.types';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { _BrandApi } from '@/pages/dashboard/products/api/brand.services';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { SortItemsDialog } from '@/shared/ui/table-data/sort-items-dialog';
import { useFetchCountries } from '@/pages/dashboard/countries/hooks/country';
import { brandColumns, type BrandFormValues } from '@/columns/one/products/one';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import {
  useSortBrands,
  useFetchBrands,
  useDeleteBrand,
} from '@/pages/dashboard/products/hooks/brand';
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
  'w-full h-10 rounded-lg border border-border/60 bg-background px-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-colors';

export default function Page() {
  const { t } = useTranslation('table');
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const setPageOne = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get('page') === '1') return prev;
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  const skipFirstFilterEffect = useRef(true);
  useEffect(() => {
    if (skipFirstFilterEffect.current) {
      skipFirstFilterEffect.current = false;
      return;
    }
    setPageOne();
  }, [search, isActiveFilter, categoryFilter, subCategoryFilter, countryFilter, dateFrom, dateTo, setPageOne]);

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'brand-index-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });
  const filterCategoryOptions = useMemo(
    () => buildCategorySelectRows((categoriesResp?.data?.items ?? []) as CategoryData[]),
    [categoriesResp?.data?.items]
  );

  const { data: subCategoriesResp } = useQuery({
    queryKey: ['categories', 'brand-index-sub', categoryFilter],
    queryFn: () =>
      _CategoryApi.getListCategoriesPaginated({
        page: 1,
        per_page: 500,
        parent_id: categoryFilter ? Number(categoryFilter) : undefined,
      }),
    enabled: Boolean(categoryFilter),
  });
  const subCategoryOptions = (subCategoriesResp?.data?.items ?? []) as CategoryData[];

  const { data: countriesResp } = useFetchCountries(1, 400);
  const filterCountries = countriesResp?.data?.items ?? [];

  const {
    data: brandsResponse,
    isLoading,
    isError,
    error,
  } = useFetchBrands({
    page,
    per_page: limit,
    sort_field: 'order',
    sort_order: 'asc',
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(isActiveFilter === '' ? {} : { is_active: isActiveFilter === '1' }),
    ...(categoryFilter ? { category_id: Number(categoryFilter) } : {}),
    ...(subCategoryFilter ? { sub_category_id: Number(subCategoryFilter) } : {}),
    ...(countryFilter ? { country_id: Number(countryFilter) } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  });
  const deleteBrandMutation = useDeleteBrand();
  const sortBrandsMutation = useSortBrands();

  // Fetch ALL brands (sorted by `order` asc) for the sort dialog. We deliberately
  // do not paginate here so the saved `ordered_ids` payload covers every brand.
  const { data: sortItemsResp, isFetching: isSortItemsLoading } = useQuery({
    queryKey: ['brand', 'sort-items'],
    queryFn: () =>
      _BrandApi.getListBrands({ page: 1, per_page: 500 }),
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
      image: row.image ?? null,
    }));
  }, [sortItemsResp]);

  const handleSortSave = async (orderedIds: number[]) => {
    try {
      await sortBrandsMutation.mutateAsync({ ordered_ids: orderedIds });
      toast.success(t('orderUpdatedSuccess'));
      setIsSortOpen(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e, t('orderUpdatedError')));
    }
  };

  const onDelete = (id: number) => {
    setDeletingId(id);
  };

  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteBrandMutation.mutateAsync(deletingId);
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

  const brandData: BrandFormValues[] = (brandsResponse?.data?.items ?? []) as BrandFormValues[];

  const apiPagination = brandsResponse?.data?.pagination;
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
        per_page: limit,
        total: 0,
        from: 0,
        to: 0,
      };

  const { can } = usePermissions();

  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  };

  const handlePageSizeChange = (newSize: number) => {
    if (newSize === limit) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('limit', String(newSize));
      next.set('page', '1');
      return next;
    });
  };

  const activeFilterCount =
    (isActiveFilter ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (subCategoryFilter ? 1 : 0) +
    (countryFilter ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const onFilterReset = () => {
    setSearch('');
    setIsActiveFilter('');
    setCategoryFilter('');
    setSubCategoryFilter('');
    setCountryFilter('');
    setDateFrom('');
    setDateTo('');
    setPageOne();
  };

  return (
    <>
      <title>{t('form.brandsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      {isError ? (
        <div className="mx-3 mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-4 md:mx-6">
          {getApiErrorMessage(error, t('form.brandsLoadErrorFallback'))}
        </div>
      ) : null}

      <DataTable
        tableTop={
          hasPermission('update', 'brand') ? (
            <div className="flex items-center justify-end">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => setIsSortOpen(true)}
              >
                <Iconify icon="lucide:arrow-up-down" width={16} className="me-1.5" />
                {t('reorder')}
              </Button>
            </div>
          ) : undefined
        }
        tableName={t('tableNames.brand')}
        columns={brandColumns(
          {
            update: hasPermission('update', 'brand'),
            delete: hasPermission('delete', 'brand'),
          },
          t,
          onDelete,
          deleteBrandMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={brandData}
        createPath="/products/brands/create"
        hasDetails
        permissions={{
          create: hasPermission('create', 'brand'),
          update: hasPermission('update', 'brand'),
          delete: hasPermission('delete', 'brand'),
        }}
        isLoading={isLoading}
        onSearchChange={setSearch}
        searchPlaceholder={t('search')}
        filterSidebar={
          <div className="flex flex-col gap-5">
            <FilterGroup label={t('statusLabel')}>
              <select
                className={filterSelectClass}
                value={isActiveFilter}
                onChange={(e) => {
                  setIsActiveFilter(e.target.value as '' | '1' | '0');
                  setPageOne();
                }}
              >
                <option value="">{t('all')}</option>
                <option value="1">{t('active')}</option>
                <option value="0">{t('inactive')}</option>
              </select>
            </FilterGroup>

            <FilterGroup label={t('columns.category')}>
              <select
                className={filterSelectClass}
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSubCategoryFilter('');
                  setPageOne();
                }}
              >
                <option value="">{t('all')}</option>
                {filterCategoryOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {nativeSelectCategoryLabel(c.label, c.depth, c.hasChildren)}
                  </option>
                ))}
              </select>
            </FilterGroup>

            {categoryFilter ? (
              <FilterGroup label={t('form.brandSubCategory')}>
                <select
                  className={filterSelectClass}
                  value={subCategoryFilter}
                  onChange={(e) => {
                    setSubCategoryFilter(e.target.value);
                    setPageOne();
                  }}
                >
                  <option value="">{t('all')}</option>
                  {subCategoryOptions.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {formatTranslated(c.name as { en?: string; ar?: string })}
                    </option>
                  ))}
                </select>
              </FilterGroup>
            ) : null}

            <FilterGroup label={t('form.country')}>
              <select
                className={filterSelectClass}
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setPageOne();
                }}
              >
                <option value="">{t('all')}</option>
                {filterCountries.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {typeof c.name === 'object' ? formatTranslated(c.name as { en?: string; ar?: string }) : c.name}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label={t('fromDate')}>
              <input
                type="date"
                className={filterSelectClass}
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPageOne();
                }}
              />
            </FilterGroup>
            <FilterGroup label={t('toDate')}>
              <input
                type="date"
                className={filterSelectClass}
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPageOne();
                }}
              />
            </FilterGroup>
          </div>
        }
        activeFilterCount={activeFilterCount}
        onFilterReset={onFilterReset}
        columnTranslations={{
          id: t('columns.id'),
          image: t('columns.image'),
          name: t('columns.name'),
          created_at: t('columns.createdAt'),
          updated_at: t('columns.updatedAt'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={page}
        pageSize={limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      <SortItemsDialog
        open={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        items={sortItems}
        title={t('reorderBrandsTitle')}
        description={t('reorderBrandsDescription')}
        onSave={handleSortSave}
        isSubmitting={sortBrandsMutation.isPending}
        isLoading={isSortItemsLoading}
      />
    </>
  );
}
