import type { SortableEntity } from '@/shared/ui/table-data/sort-items-dialog';

import { toast } from 'react-toastify';
import { Input } from '@/shared/ui/input';
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

  const [nameInput, setNameInput] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [originCountryFilter, setOriginCountryFilter] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedName(nameInput.trim());
    }, 400);
    return () => window.clearTimeout(id);
  }, [nameInput]);

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
  }, [debouncedName, isActiveFilter, categoryFilter, originCountryFilter, setPageOne]);

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'brand-index-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });
  const filterCategories = categoriesResp?.data?.items ?? [];

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
    ...(debouncedName ? { name: debouncedName } : {}),
    ...(isActiveFilter === '' ? {} : { is_active: isActiveFilter === '1' }),
    ...(categoryFilter ? { category_id: Number(categoryFilter) } : {}),
    ...(originCountryFilter ? { origin_country_id: Number(originCountryFilter) } : {}),
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
    (debouncedName ? 1 : 0) +
    (isActiveFilter ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (originCountryFilter ? 1 : 0);

  const onFilterReset = () => {
    setNameInput('');
    setDebouncedName('');
    setIsActiveFilter('');
    setCategoryFilter('');
    setOriginCountryFilter('');
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
                  setPageOne();
                }}
              >
                <option value="">{t('all')}</option>
                {filterCategories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {typeof c.name === 'object' ? formatTranslated(c.name as { en?: string; ar?: string }) : c.name}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label={t('form.country')}>
              <select
                className={filterSelectClass}
                value={originCountryFilter}
                onChange={(e) => {
                  setOriginCountryFilter(e.target.value);
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
