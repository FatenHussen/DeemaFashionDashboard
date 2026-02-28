import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { productColumns } from '@/columns/one/products/one';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchProducts, useDeleteProduct } from '@/pages/dashboard/products/hooks/product';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Products | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [searchParams] = useSearchParams();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  // Fetch products using the hook
  const { data: productsResponse, isLoading, error } = useFetchProducts({ page, limit });
  const deleteProductMutation = useDeleteProduct();

  // Log error for debugging
  if (error) {
    console.error('Error fetching products:', error);
  }

  const onDelete = (id: number) => {
    setDeletingId(id);
  };

  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteProductMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Product deleted successfully');
        setDeletingId(null);
      } catch {}
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response (doc: data.data for list, data has current_page, last_page, per_page, total)
  const listData = productsResponse?.data?.data ?? productsResponse?.data?.items ?? [];
  const productData = listData;
  const apiPagination = productsResponse?.data;
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

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName="Product"
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
          deletingId
        )}
        data={productData}
        createPath="/products/create"
        hasDetails
        permissions={{
          create: hasPermission('create', 'product'),
          update: hasPermission('update', 'product'),
          delete: hasPermission('delete', 'product'),
        }}
        isLoading={isLoading}
        pagination={pagination}
        searchColumns={['name', 'sku', 'barcode']}
        columnTranslations={{
          id: 'ID',
          image: 'Image',
          name: 'Name',
          category_id: 'Category',
          price: 'Price',
          quantity: 'Quantity',
          sku: 'SKU',
          barcode: 'Barcode',
          created_at: 'Created At',
          actions: 'Actions',
        }}
      />
    </>
  );
}
