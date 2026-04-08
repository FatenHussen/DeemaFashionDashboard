import type { ProductData } from '@/pages/dashboard/products/types/product.types';

import { toast } from 'react-toastify';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { _BrandApi } from '@/pages/dashboard/products/api/brand.services';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { productColumns, type ProductFormValues } from '@/columns/one/products/one';
import {
  useFetchProducts,
  useDeleteProduct,
  useRejectProduct,
  useApproveProduct,
  useUpdateProductPrice,
} from '@/pages/dashboard/products/hooks/product';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Products | Dashboard - ${CONFIG.appName}` };

const SORT_FIELDS = ['id', 'name', 'price', 'created_at', 'quantity'] as const;

export default function Page() {
  const { t } = useTranslation('table');
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(undefined);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [isVisibleFilter, setIsVisibleFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [shopFilter, setShopFilter] = useState('');

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
    if (prevDebouncedSearchRef.current === debouncedSearch) {
      return;
    }
    prevDebouncedSearchRef.current = debouncedSearch;
    setPageOneRef.current();
  }, [debouncedSearch]);

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'product-index-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });
  const filterCategories = categoriesResp?.data?.items ?? [];

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

  const { data: productsResponse, isLoading } = useFetchProducts({
    page,
    limit,
    search: debouncedSearch,
    ...(approvalStatus ? { approval_status: approvalStatus } : {}),
    ...(isVisibleFilter === ''
      ? {}
      : { is_visible: isVisibleFilter === 'true' }),
    ...(categoryFilter ? { category_id: Number(categoryFilter) } : {}),
    ...(brandFilter ? { brand_id: Number(brandFilter) } : {}),
    ...(vendorFilter ? { vendor_id: Number(vendorFilter) } : {}),
    ...(shopFilter ? { shop_id: Number(shopFilter) } : {}),
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
        toast.success(t('deleteSuccess') || 'Product deleted successfully');
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
      toast.error(e instanceof Error ? e.message : 'Approve failed');
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
      toast.error(e instanceof Error ? e.message : 'Reject failed');
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
    'h-10 min-w-[8.5rem] rounded-lg border border-border/60 bg-background px-2.5 text-sm text-foreground';

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName={t('tableNames.product')}
        columns={productColumns(
          {
            update: hasPermission('update', 'product'),
            delete: hasPermission('delete', 'product'),
          },
          t,
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
            : null,
          hasPermission('update', 'product') ? handlePriceUpdate : undefined
        )}
        data={productData as ProductFormValues[]}
        createPath="/products/create"
        hasDetails
        rowClickToDetails={false}
        permissions={{
          create: hasPermission('create', 'product'),
          update: hasPermission('update', 'product'),
          delete: hasPermission('delete', 'product'),
        }}
        isLoading={isLoading}
        searchColumns={[]}
        toolbarFilter={
          <div className="flex flex-wrap items-center gap-2 w-full md:flex-1">
            <Input
              placeholder={t('productListSearchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 max-w-xs min-w-[200px] flex-1"
            />
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
              <span>{t('productFilterApproval')}</span>
              <select
                className={filterSelectClass}
                value={approvalStatus}
                onChange={(e) => {
                  setApprovalStatus(e.target.value);
                  setPageOne();
                }}
              >
                <option value="">{t('all')}</option>
                <option value="pending">{t('columns.pending')}</option>
                <option value="approved">{t('columns.approved')}</option>
                <option value="rejected">{t('columns.rejected')}</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
              <span>{t('productFilterVisibility')}</span>
              <select
                className={filterSelectClass}
                value={isVisibleFilter}
                onChange={(e) => {
                  setIsVisibleFilter(e.target.value);
                  setPageOne();
                }}
              >
                <option value="">{t('all')}</option>
                <option value="true">{t('yes')}</option>
                <option value="false">{t('no')}</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
              <span>{t('columns.category')}</span>
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
                    {typeof c.name === 'object' ? formatTranslated(c.name as any) : c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
              <span>{t('form.brand')}</span>
              <select
                className={filterSelectClass}
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setPageOne();
                }}
              >
                <option value="">{t('all')}</option>
                {filterBrands.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {typeof b.name === 'object' ? formatTranslated(b.name as any) : b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
              <span>Vendor</span>
              <select
                className={filterSelectClass}
                value={vendorFilter}
                onChange={(e) => {
                  setVendorFilter(e.target.value);
                  setPageOne();
                }}
              >
                <option value="">{t('all')}</option>
                {filterVendors.map((v) => (
                  <option key={v.id} value={String(v.id)}>
                    {formatTranslated(v.name as any)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
              <span>Shop</span>
              <select
                className={filterSelectClass}
                value={shopFilter}
                onChange={(e) => {
                  setShopFilter(e.target.value);
                  setPageOne();
                }}
              >
                <option value="">{t('all')}</option>
                {filterShops.map((sh) => (
                  <option key={sh.id} value={String(sh.id)}>
                    {sh.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
              <span>{t('productFilterSortBy')}</span>
              <select
                className={filterSelectClass}
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value);
                  setPageOne();
                }}
              >
                <option value="">{t('columns.default')}</option>
                {SORT_FIELDS.map((sf) => (
                  <option key={sf} value={sf}>
                    {sf === 'created_at'
                      ? t('columns.createdAt')
                      : sf === 'quantity'
                        ? t('columns.stock')
                        : sf === 'id'
                          ? t('columns.id')
                          : sf === 'name'
                            ? t('columns.name')
                            : t('columns.price')}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
              <span>{t('productSortDirection')}</span>
              <select
                className={`${filterSelectClass} ${!sortField ? 'opacity-50 pointer-events-none' : ''}`}
                value={sortOrder}
                disabled={!sortField}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'asc' | 'desc');
                  setPageOne();
                }}
              >
                <option value="asc">{t('subscriptionSortAsc')}</option>
                <option value="desc">{t('subscriptionSortDesc')}</option>
              </select>
            </label>
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
