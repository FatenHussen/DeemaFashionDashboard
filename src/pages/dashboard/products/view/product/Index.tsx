import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { productColumns } from '@/columns/one/products/one';
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
      } catch (err: any) {
        toast.error(err?.message || t('deleteError') || 'Failed to delete product');
      }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  // Extract data from API response
  const productData = productsResponse?.data?.items || [];
  const pagination = productsResponse?.data?.pagination;

  console.log('productsResponse full:', productsResponse);
  console.log('productData:', productData);
  console.log('productData length:', productData.length);
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
