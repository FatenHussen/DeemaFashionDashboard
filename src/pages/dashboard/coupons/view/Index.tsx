import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { couponColumns, type CouponFormValues } from '@/columns/one/coupons/one';
import { useFetchCoupons, useDeleteCoupon } from '@/pages/dashboard/coupons/hooks/coupon';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Coupons | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: couponsResponse, isLoading, error } = useFetchCoupons(currentPage, pageSize);
  const deleteCouponMutation = useDeleteCoupon();

  if (error) {
    console.error('Error fetching coupons:', error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const onDelete = (id: number) => {
    setDeletingId(id);
  };

  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteCouponMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Coupon deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const handleEdit = (row: { original: CouponFormValues }) => {
    navigate(`/coupons/update/${row.original.id}`, {
      state: { coupon: row.original },
    });
  };

  const couponData: CouponFormValues[] = couponsResponse?.data?.items || [];
  const apiPagination = couponsResponse?.data?.pagination;
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
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{metadata.title}</title>

      <DataTable
        tableName={t("tableNames.coupon")}
        columns={couponColumns(
          {
            update: hasPermission('update', 'coupon'),
            delete: hasPermission('delete', 'coupon'),
          },
          t,
          onDelete,
          deleteCouponMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          handleEdit
        )}
        data={couponData}
        createPath="/coupons/create"
        hasDetails
        detailsLink="/coupons/details"
        permissions={{
          create: hasPermission('create', 'coupon'),
          update: hasPermission('update', 'coupon'),
          delete: hasPermission('delete', 'coupon'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          name: 'Name',
          code: 'Code',
          discount: 'Discount',
          start_at: 'Start',
          end_at: 'End',
          used_count: 'Used',
          is_active: 'Status',
          actions: 'Actions',
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}
