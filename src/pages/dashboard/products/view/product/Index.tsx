import type { ProductData } from '@/pages/dashboard/products/types/product.types';
import type { CategoryData } from '@/pages/dashboard/categories/types/category.types';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MultiSelect } from '@/shared/ui/multi-select';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { _BrandApi } from '@/pages/dashboard/products/api/brand.services';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { productColumns, type ProductFormValues } from '@/columns/one/products/one';
import { _CategoryAttributeApi } from '@/pages/dashboard/categories/api/category-attribute.services';
import { ProductVariantsPriceModal } from '@/pages/dashboard/products/components/ProductVariantsPriceModal';
import {
  buildCategorySelectRows,
  nativeSelectCategoryLabel,
} from '@/pages/dashboard/categories/utils/build-parent-picker-options';
import {
  useFetchProducts,
  useDeleteProduct,
  useRejectProduct,
  useApproveProduct,
  useUpdateProductPrice,
} from '@/pages/dashboard/products/hooks/product';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const SORT_FIELDS = ['id', 'name', 'price', 'created_at', 'quantity'] as const;

export default function Page() {
  const { t } = useTranslation('table');
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [variantsModal, setVariantsModal] = useState<{
    productId: number;
    listRowPrice: number;
  } | null>(null);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const [search, setSearch] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [shopFilter, setShopFilter] = useState('');
  const [categoryAttributeIds, setCategoryAttributeIds] = useState<number[]>([]);
  const [stockSort, setStockSort] = useState<'' | 'asc' | 'desc'>('');

  const setPageOne = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get('page') === '1') return prev;
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  /** Avoid deps on setPageOne/setSearchParams — they change after URL updates and would re-run this effect and reset page. */
  const setPageOneRef = useRef(setPageOne);
  setPageOneRef.current = setPageOne;

  useEffect(() => {
    setPageOneRef.current();
  }, [search]);

  const prevCategoryFilterRef = useRef(categoryFilter);
  useEffect(() => {
    if (prevCategoryFilterRef.current === categoryFilter) return;
    prevCategoryFilterRef.current = categoryFilter;
    setCategoryAttributeIds([]);
    setPageOneRef.current();
  }, [categoryFilter]);

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'product-index-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });
  const filterCategoryOptions = useMemo(
    () => buildCategorySelectRows((categoriesResp?.data?.items ?? []) as CategoryData[]),
    [categoriesResp?.data?.items]
  );

  const { data: categoryAttributesResp } = useQuery({
    queryKey: ['category-attributes', 'product-index-filter', categoryFilter || 'all'],
    queryFn: () =>
      _CategoryAttributeApi.getListCategoryAttributes({
        page: 1,
        per_page: 500,
        // The API resolves any category_id (root or subcategory) to its root's attributes.
        ...(categoryFilter ? { category_id: Number(categoryFilter) } : {}),
      }),
  });
  const categoryAttributeOptions = useMemo(
    () =>
      (categoryAttributesResp?.data?.items ?? []).map((a) => ({
        value: a.id,
        label: typeof a.name === 'string' ? a.name : String(a.name),
      })),
    [categoryAttributesResp?.data?.items]
  );

  const { data: brandsResp } = useQuery({
    queryKey: ['brands', 'product-index-filter'],
    queryFn: () => _BrandApi.getListBrands({ page: 1, per_page: 500 }),
  });
  const filterBrands = brandsResp?.data?.items ?? [];

  const { data: vendorsResp } = useQuery({
    queryKey: ['vendors', 'product-index-filter'],
    queryFn: () => _VendorApi.getListVendor({ page: 1, limit: 500 }),
  });
  const filterVendors = vendorsResp?.data?.items ?? [];

  const { data: shopsIndexResp } = useFetchShops(1, 200);
  const filterShops = (shopsIndexResp as { data?: { items?: { id: number; name: string }[] } })?.data
    ?.items ?? [];

  const searchTrim = search.trim();
  const searchAsId = /^\d+$/.test(searchTrim) ? Number(searchTrim) : null;

  const { data: productsResponse, isLoading, isError, error } = useFetchProducts({
    page,
    limit,
    ...(searchAsId != null
      ? { id: searchAsId }
      : searchTrim
        ? { search: searchTrim }
        : {}),
    ...(approvalStatus ? { approval_status: approvalStatus } : {}),
    ...(categoryFilter ? { category_id: Number(categoryFilter) } : {}),
    ...(brandFilter ? { brand_id: Number(brandFilter) } : {}),
    ...(vendorFilter ? { vendor_id: Number(vendorFilter) } : {}),
    ...(shopFilter ? { shop_id: Number(shopFilter) } : {}),
    ...(categoryAttributeIds.length
      ? { category_attribute_ids: categoryAttributeIds }
      : {}),
    ...(stockSort ? { stock_sort: stockSort } : {}),
    ...(sortField
      ? {
          sort_field: sortField,
          sort_order: sortOrder,
        }
      : {}),
  });

  const deleteProductMutation = useDeleteProduct();
  const approveProductMutation = useApproveProduct();
  const rejectProductMutation = useRejectProduct();
  const updatePriceMutation = useUpdateProductPrice();

  const onDelete = (id: number) => {
    setDeletingId(id);
  };

  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteProductMutation.mutateAsync(deletingId);
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

  const handlePriceUpdate = async (id: number, price: number) => {
    try {
      await updatePriceMutation.mutateAsync({ id, price });
      toast.success(t('priceUpdatedSuccess'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('priceUpdatedError'));
      throw e;
    }
  };

  const handleApproveRow = async (id: number) => {
    try {
      await approveProductMutation.mutateAsync(id);
      toast.success(t('approveSuccess'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('approveFailed'));
    }
  };

  const handleRejectRowOpen = (id: number) => {
    setRejectDialogId(id);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (rejectDialogId == null) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error(t('rejectionReasonRequired'));
      return;
    }
    try {
      await rejectProductMutation.mutateAsync({
        id: rejectDialogId,
        rejection_reason: reason,
      });
      toast.success(t('rejectSuccess'));
      setRejectDialogId(null);
      setRejectReason('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('rejectFailed'));
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
  const productData = listData;
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
  const { can } = usePermissions();

  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  const filterSelectClass =
    'w-full h-10 rounded-lg border border-border/60 bg-background px-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-colors';

  return (
    <>
      <title>{t('form.productsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      {isError ? (
        <div className="mx-3 mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-4 md:mx-6">
          {getApiErrorMessage(error, t('form.productsLoadErrorFallback'))}
        </div>
      ) : null}

      <DataTable
        tableName="products"
        columns={productColumns(
          {
            update: hasPermission('update', 'product'),
            delete: hasPermission('delete', 'product'),
          },
          t,
          (id, listRowPrice) => setVariantsModal({ productId: id, listRowPrice }),
          onDelete,
          deleteProductMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          hasPermission('update', 'product')
            ? {
                onApprove: handleApproveRow,
                onReject: handleRejectRowOpen,
                approvingId: approveProductMutation.isPending
                  ? approveProductMutation.variables ?? null
                  : null,
                rejectingId: rejectProductMutation.isPending
                  ? rejectProductMutation.variables?.id ?? null
                  : null,
              }
            : null
        )}
        data={productData as ProductFormValues[]}
        createPath="/products/create"
        hasDetails
        detailsLink="/products/details"
        permissions={{
          create: hasPermission('create', 'product'),
          update: hasPermission('update', 'product'),
          delete: hasPermission('delete', 'product'),
        }}
        isLoading={isLoading}
        onSearchChange={setSearch}
        searchPlaceholder={t('productListSearchPlaceholder')}
        activeFilterCount={
          [
            approvalStatus,
            categoryFilter,
            brandFilter,
            vendorFilter,
            shopFilter,
            sortField,
            stockSort,
            categoryAttributeIds.length > 0 ? 'attrs' : '',
          ].filter(Boolean).length
        }
        onFilterReset={() => {
          setApprovalStatus('');
          setCategoryFilter('');
          setBrandFilter('');
          setVendorFilter('');
          setShopFilter('');
          setCategoryAttributeIds([]);
          setStockSort('');
          setSortField('');
          setSortOrder('desc');
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

            <FilterGroup label={t('columns.category')}>
              <select
                className={filterSelectClass}
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPageOne(); }}
              >
                <option value="">{t('all')}</option>
                {filterCategoryOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {nativeSelectCategoryLabel(c.label, c.depth, c.hasChildren)}
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

            <FilterGroup label={t('form.attributeValuesSection')}>
              <MultiSelect
                options={categoryAttributeOptions}
                value={categoryAttributeIds}
                onChange={(next) => {
                  setCategoryAttributeIds(next.map((v) => Number(v)));
                  setPageOne();
                }}
                placeholder={t('all')}
                isSearchable
                className="w-full"
              />
            </FilterGroup>

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

            <FilterGroup label={t('columns.stock')}>
              <select
                className={filterSelectClass}
                value={stockSort}
                onChange={(e) => {
                  setStockSort(e.target.value as '' | 'asc' | 'desc');
                  setPageOne();
                }}
              >
                <option value="">{t('columns.default')}</option>
                <option value="asc">{t('subscriptionSortAsc')}</option>
                <option value="desc">{t('subscriptionSortDesc')}</option>
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
          id: t('columns.id'),
          image: t('columns.image'),
          name: t('columns.name'),
          category_id: t('columns.category'),
          price: t('columns.price'),
          quantity: t('columns.stock'),
          sku: t('columns.sku'),
          barcode: t('columns.code'),
          created_at: t('columns.createdAt'),
          actions: t('columns.action'),
        }}
      />

      <ProductVariantsPriceModal
        open={variantsModal !== null}
        productId={variantsModal?.productId ?? null}
        fallbackListPrice={variantsModal?.listRowPrice}
        onClose={() => setVariantsModal(null)}
        canEditShopPrices={hasPermission('update', 'product')}
        onBasePriceUpdate={
          hasPermission('update', 'product') ? handlePriceUpdate : undefined
        }
      />

      <Dialog
        open={rejectDialogId !== null}
        onClose={() => {
          setRejectDialogId(null);
          setRejectReason('');
        }}
        title={t('rejectProduct')}
        maxWidth="sm"
        content={
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">{t('rejectionReasonHint')}</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder={t('form.rejectionReason')}
            />
          </div>
        }
        actions={
          <>
            <Button
              variant="text"
              onClick={() => {
                setRejectDialogId(null);
                setRejectReason('');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={rejectProductMutation.isPending}
              onClick={handleRejectSubmit}
            >
              {t('reject')}
            </Button>
          </>
        }
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
