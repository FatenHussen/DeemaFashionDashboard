import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { packageColumns, type PackageFormValues } from '@/columns/one/packages/one';
import { useFetchPackages, useDeletePackage } from '@/pages/dashboard/packages/hooks/package';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const packageParams: { search?: string } = {};
  if (search.trim()) packageParams.search = search.trim();

  const { data: packagesResponse, isLoading, error } = useFetchPackages(currentPage, pageSize, packageParams);
  const deletePackageMutation = useDeletePackage();

  if (error) console.error('Error fetching packages:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };
  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deletePackageMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };
  const onDeleteCancel = () => setDeletingId(null);
  const handleEdit = (row: { original: PackageFormValues }) => {
    navigate(`/packages/update/${row.original.id}`, { state: { package: row.original } });
  };

  const packageData: PackageFormValues[] = packagesResponse?.data?.items || [];
  const apiPagination = packagesResponse?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(apiPagination.current_page * apiPagination.per_page, apiPagination.total),
      }
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{t('form.packagesIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t("tableNames.package")}
        columns={packageColumns(
          { update: hasPermission('update', 'package'), delete: hasPermission('delete', 'package') },
          t, onDelete, deletePackageMutation.isPending, deletingId !== null, onDeleteConfirm, onDeleteCancel, deletingId, handleEdit
        )}
        data={packageData}
        createPath="/packages/create"
        hasDetails
        detailsLink="/packages/details"
        permissions={{
          create: hasPermission('create', 'package'),
          update: hasPermission('update', 'package'),
          delete: hasPermission('delete', 'package'),
        }}
        isLoading={isLoading}
        columnTranslations={{ id: t('columns.id'), name: t('columns.name'), price: t('columns.price'), duration_days: t('columns.durationDays'), monthly_orders_limit: t('columns.monthlyOrders'), discount_percentage: t('columns.discountPercent'), is_active: t('columns.status'), created_at: t('columns.created'), actions: t('columns.action') }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={setSearch}
      />
    </>
  );
}
