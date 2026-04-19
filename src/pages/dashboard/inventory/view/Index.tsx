import type { ProductData } from '@/pages/dashboard/products/types/product.types';

import { toast } from 'react-toastify';
import { Input } from '@/shared/ui/input';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { _BrandApi } from '@/pages/dashboard/products/api/brand.services';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { type ProductFormValues, inventoryProductColumns } from '@/columns/one/products/one';
import {
  useFetchProducts,
  useDeleteProduct,
  useUpdateProductQuantity,
} from '@/pages/dashboard/products/hooks/product';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const INTERNAL_VENDOR_ID = 1;

type InventoryTab = 'tikmool' | 'vendors';

const SORT_FIELDS = ['id', 'name', 'price', 'created_at', 'quantity'] as const;

/** Sent on every inventory list request when Sort by is "Default" (matches server default ordering). */
const DEFAULT_INVENTORY_SORT_FIELD: (typeof SORT_FIELDS)[number] = 'created_at';
const DEFAULT_INVENTORY_SORT_ORDER: 'asc' | 'desc' = 'desc';

export default function InventoryPage() {
  const { t } = useTranslation('table');
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);
  const canUpdateProduct = hasPermission('update', 'product');
  const canDeleteProduct = hasPermission('delete', 'product');

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteProductMutation = useDeleteProduct();
  const updateQuantityMutation = useUpdateProductQuantity();

  const [activeTab, setActiveTab] = useState<InventoryTab>('tikmool');

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(undefined);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [isVisibleFilter, setIsVisibleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [shopFilter, setShopFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const setPageOne = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get('page') === '1') return prev;
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  const setPageOneRef = useRef(setPageOne);
  setPageOneRef.current = setPageOne;

  const debouncedInitRef = useRef(false);
  const prevDebouncedSearchRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const v = searchInput.trim();
      setDebouncedSearch(v || undefined);
    }, 400);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    if (!debouncedInitRef.current) {
      debouncedInitRef.current = true;
      prevDebouncedSearchRef.current = debouncedSearch;
      return;
    }
    if (prevDebouncedSearchRef.current === debouncedSearch) return;
    prevDebouncedSearchRef.current = debouncedSearch;
    setPageOneRef.current();
  }, [debouncedSearch]);

  const resetAllFilters = () => {
    setApprovalStatus('');
    setIsVisibleFilter('');
    setCategoryFilter('');
    setBrandFilter('');
    setVendorFilter('');
    setShopFilter('');
    setSortField('');
    setSortOrder('desc');
  };

  const handleTabChange = (tab: InventoryTab) => {
    setActiveTab(tab);
    resetAllFilters();
    setSearchInput('');
    setDebouncedSearch(undefined);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    });
  };

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'inventory-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });
  const filterCategories = categoriesResp?.data?.items ?? [];

  const { data: brandsResp } = useQuery({
    queryKey: ['brands', 'inventory-filter'],
    queryFn: () => _BrandApi.getListBrands({ page: 1, per_page: 500 }),
  });
  const filterBrands = brandsResp?.data?.items ?? [];

  const { data: vendorsResp } = useQuery({
    queryKey: ['vendors', 'inventory-filter'],
    queryFn: () => _VendorApi.getListVendor({ page: 1, limit: 500 }),
  });
  const filterVendors = (
    (vendorsResp as { data?: { items?: { id: number; name: any }[] } })?.data?.items ?? []
  ).filter((v) => v.id !== INTERNAL_VENDOR_ID);

  const { data: shopsIndexResp } = useFetchShops(1, 200);
  const filterShops = (shopsIndexResp as { data?: { items?: { id: number; name: string }[] } })?.data
    ?.items ?? [];

  const queryParams = {
    page,
    limit,
    search: debouncedSearch,
    vendor_id:
      activeTab === 'tikmool'
        ? INTERNAL_VENDOR_ID
        : vendorFilter
          ? Number(vendorFilter)
          : undefined,
    ...(approvalStatus ? { approval_status: approvalStatus } : {}),
    ...(isVisibleFilter === '' ? {} : { is_visible: isVisibleFilter === 'true' }),
    ...(categoryFilter ? { category_id: Number(categoryFilter) } : {}),
    ...(brandFilter ? { brand_id: Number(brandFilter) } : {}),
    ...(shopFilter ? { shop_id: Number(shopFilter) } : {}),
    sort_field: sortField || DEFAULT_INVENTORY_SORT_FIELD,
    sort_order: sortField ? sortOrder : DEFAULT_INVENTORY_SORT_ORDER,
  };

  const { data: productsResponse, isLoading } = useFetchProducts(queryParams);

  const onDelete = (id: number) => {
    setDeletingId(id);
  };

  const onDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteProductMutation.mutateAsync(deletingId);
      toast.success(t('deleteSuccess'));
      setDeletingId(null);
    } catch {
      return;
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const handleQuantityUpdate = async (id: number, quantity: number) => {
    try {
      await updateQuantityMutation.mutateAsync({ id, quantity });
      toast.success(t('quantityUpdatedSuccess'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('quantityUpdatedError'));
      throw e;
    }
  };

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

  const raw = productsResponse as Record<string, any> | undefined;
  const inner = raw?.data;
  const listData: ProductData[] = Array.isArray(inner)
    ? inner
    : inner?.data ?? inner?.items ?? [];

  type PaginationShape = {
    current_page?: number | string;
    last_page?: number | string;
    per_page?: number | string;
    total?: number | string;
  };
  const innerObj =
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? (inner as { pagination?: PaginationShape } & PaginationShape)
      : undefined;
  const apiPagination =
    raw?.meta ??
    innerObj?.pagination ??
    (typeof innerObj?.current_page !== 'undefined' ? innerObj : null);
  const num = (v: unknown, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const pagination =
    apiPagination != null && apiPagination.current_page != null && apiPagination.current_page !== ''
      ? (() => {
          const current = num(apiPagination.current_page, 1);
          const perPage = num(apiPagination.per_page, limit);
          const total = num(apiPagination.total, 0);
          const last = num(apiPagination.last_page, Math.max(1, Math.ceil(total / perPage) || 1));
          return {
            current_page: current,
            last_page: last,
            per_page: perPage,
            total,
            from: total === 0 ? 0 : (current - 1) * perPage + 1,
            to: Math.min(current * perPage, total),
          };
        })()
      : undefined;

  const filterSelectClass =
    'w-full h-10 rounded-lg border border-border/60 bg-background px-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-colors';

  const activeFilterCount = [approvalStatus, isVisibleFilter, categoryFilter, brandFilter, vendorFilter, shopFilter, sortField].filter(Boolean).length;

  return (
    <>
      <title>{t('form.inventoryIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-muted/40 p-1 w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('tikmool')}
          className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
            activeTab === 'tikmool'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-base">🏪</span>
          {t('inventoryTikmoolTab')}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('vendors')}
          className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
            activeTab === 'vendors'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-base">🏭</span>
          {t('inventoryVendorsTab')}
        </button>
      </div>

      <DataTable
        tableName={
          activeTab === 'tikmool' ? t('inventoryTikmoolTab') : t('inventoryVendorsTab')
        }
        columns={inventoryProductColumns(
          { update: canUpdateProduct, delete: canDeleteProduct },
          t,
          onDelete,
          deleteProductMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          canUpdateProduct ? handleQuantityUpdate : undefined
        )}
        data={listData as ProductFormValues[]}
        hasDetails
        rowClickToDetails={false}
        permissions={{
          create: false,
          update: canUpdateProduct,
          delete: canDeleteProduct,
        }}
        isLoading={isLoading}
        searchColumns={[]}
        toolbarFilter={
          <Input
            placeholder={t('productListSearchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 max-w-xs min-w-[200px] flex-1"
          />
        }
        activeFilterCount={activeFilterCount}
        onFilterReset={() => {
          resetAllFilters();
          setPageOne();
        }}
        filterSidebar={
          <div className="flex flex-col gap-5">
            <FilterGroup label={t('productFilterApproval')}>
              <select
                className={filterSelectClass}
                value={approvalStatus}
                onChange={(e) => { setApprovalStatus(e.target.value); setPageOne(); }}
              >
                <option value="">{t('all')}</option>
                <option value="pending">{t('columns.pending')}</option>
                <option value="approved">{t('columns.approved')}</option>
                <option value="rejected">{t('columns.rejected')}</option>
              </select>
            </FilterGroup>

            <FilterGroup label={t('productFilterVisibility')}>
              <select
                className={filterSelectClass}
                value={isVisibleFilter}
                onChange={(e) => { setIsVisibleFilter(e.target.value); setPageOne(); }}
              >
                <option value="">{t('all')}</option>
                <option value="true">{t('yes')}</option>
                <option value="false">{t('no')}</option>
              </select>
            </FilterGroup>

            <FilterGroup label={t('columns.category')}>
              <select
                className={filterSelectClass}
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPageOne(); }}
              >
                <option value="">{t('all')}</option>
                {filterCategories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {typeof c.name === 'object' ? formatTranslated(c.name as any) : c.name}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label={t('form.brand')}>
              <select
                className={filterSelectClass}
                value={brandFilter}
                onChange={(e) => { setBrandFilter(e.target.value); setPageOne(); }}
              >
                <option value="">{t('all')}</option>
                {filterBrands.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {typeof b.name === 'object' ? formatTranslated(b.name as any) : b.name}
                  </option>
                ))}
              </select>
            </FilterGroup>

            {activeTab === 'vendors' && (
              <FilterGroup label={t('columns.vendor')}>
                <select
                  className={filterSelectClass}
                  value={vendorFilter}
                  onChange={(e) => { setVendorFilter(e.target.value); setPageOne(); }}
                >
                  <option value="">{t('all')}</option>
                  {filterVendors.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {formatTranslated(v.name as any)}
                    </option>
                  ))}
                </select>
              </FilterGroup>
            )}

            <FilterGroup label={t('columns.shop')}>
              <select
                className={filterSelectClass}
                value={shopFilter}
                onChange={(e) => { setShopFilter(e.target.value); setPageOne(); }}
              >
                <option value="">{t('all')}</option>
                {filterShops.map((sh) => (
                  <option key={sh.id} value={String(sh.id)}>{sh.name}</option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label={t('productFilterSortBy')}>
              <select
                className={filterSelectClass}
                value={sortField}
                onChange={(e) => { setSortField(e.target.value); setPageOne(); }}
              >
                <option value="">{t('columns.default')}</option>
                {SORT_FIELDS.map((sf) => (
                  <option key={sf} value={sf}>
                    {sf === 'created_at' ? t('columns.createdAt')
                      : sf === 'quantity' ? t('columns.stock')
                      : sf === 'id' ? t('columns.id')
                      : sf === 'name' ? t('columns.name')
                      : t('columns.price')}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label={t('productSortDirection')}>
              <select
                className={`${filterSelectClass} ${!sortField ? 'opacity-50 pointer-events-none' : ''}`}
                value={sortOrder}
                disabled={!sortField}
                onChange={(e) => { setSortOrder(e.target.value as 'asc' | 'desc'); setPageOne(); }}
              >
                <option value="asc">{t('subscriptionSortAsc')}</option>
                <option value="desc">{t('subscriptionSortDesc')}</option>
              </select>
            </FilterGroup>
          </div>
        }
        pagination={pagination}
        currentPage={page}
        pageSize={limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
        columnTranslations={{
          name: t('columns.name'),
          category: t('columns.category'),
          quantity: t('columns.stock'),
          shop: t('columns.shop'),
          vendor: t('columns.seller'),
          sku: t('columns.sku'),
          expiry_date: t('columns.expiryDate'),
          actions: t('columns.action'),
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
