import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { brandColumns, type BrandFormValues } from '@/columns/one/products/one';
import { useFetchBrands, useDeleteBrand } from '@/pages/dashboard/products/hooks/brand';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Brands | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const nameFilter = searchParams.get('name') || '';

  // Fetch brands using the hook with name filter
  const {
    data: brandsResponse,
    isLoading,
    error,
  } = useFetchBrands(nameFilter ? { name: nameFilter } : undefined);
  const deleteBrandMutation = useDeleteBrand();

  if (error) {
    console.error('Error fetching brands:', error);
  }

  const onDelete = (id: number) => {
    setDeletingId(id);
  };

  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteBrandMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Brand deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const brandData: BrandFormValues[] = (brandsResponse?.data?.items ?? []) as BrandFormValues[];

  const { can } = usePermissions();

  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName={t("tableNames.brand")}
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
        searchColumns={['name']}
        columnTranslations={{
          id: 'ID',
          image: 'Image',
          name: 'Name',
          created_at: 'Created At',
          updated_at: 'Updated At',
          actions: 'Actions',
        }}
      />
    </>
  );
}
