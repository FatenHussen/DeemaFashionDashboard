import type { ProductData } from '@/pages/dashboard/products/types/product.types';

import { toast } from 'react-toastify';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useRef, useState, useEffect, useCallback } from 'react';
import { productColumns, type ProductFormValues } from '@/columns/one/products/one';
import {
  useFetchProducts,
  useDeleteProduct,
  useRejectProduct,
  useApproveProduct,
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

  const skipDebouncedPageReset = useRef(true);

  const setPageOne = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get('page') === '1') return prev;
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const v = searchInput.trim();
      setDebouncedSearch(v || undefined);
    }, 400);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    if (skipDebouncedPageReset.current) {
      skipDebouncedPageReset.current = false;
      return;
    }
    setPageOne();
  }, [debouncedSearch, setPageOne]);

  const { data: productsResponse, isLoading } = useFetchProducts({
    page,
    limit,
    search: debouncedSearch,
    ...(approvalStatus ? { approval_status: approvalStatus } : {}),
    ...(isVisibleFilter === ''
      ? {}
      : { is_visible: isVisibleFilter === 'true' }),
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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('limit', String(newSize));
      next.set('page', '1');
      return next;
    });
  };

  const rawData = productsResponse?.data;
  const listData =
    (rawData as { items?: ProductData[] } | undefined)?.items ??
    (rawData as { data?: ProductData[] } | undefined)?.data ??
    [];
  const productData = listData;
  type PaginationShape = {
    current_page: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  const apiPagination =
    (rawData as { pagination?: PaginationShape } | undefined)?.pagination ??
    (typeof (rawData as PaginationShape)?.current_page === 'number'
      ? (rawData as PaginationShape)
      : null);
  const pagination =
    apiPagination && typeof apiPagination.current_page === 'number'
      ? {
          current_page: apiPagination.current_page,
          last_page: apiPagination.last_page ?? 1,
          per_page: apiPagination.per_page ?? limit,
          total: apiPagination.total ?? 0,
          from: (apiPagination.current_page - 1) * (apiPagination.per_page ?? limit) + 1,
          to: Math.min(
            apiPagination.current_page * (apiPagination.per_page ?? limit),
            apiPagination.total ?? 0
          ),
        }
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
            : null
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
