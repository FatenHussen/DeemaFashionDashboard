import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  sellerRegistrationColumns,
  type SellerRegistrationFormValues,
} from '@/columns/one/vendor/seller-registration';

import { CONFIG } from 'src/global-config';

import {
  useFetchSellerRegistrations,
  useRejectSellerRegistration,
  useDeleteSellerRegistration,
  useApproveSellerRegistration,
} from '../../hooks/seller-registration';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: response, isLoading } = useFetchSellerRegistrations(
    currentPage,
    pageSize,
    search.trim() ? { search: search.trim() } : undefined
  );
  const approveMutation = useApproveSellerRegistration();
  const rejectMutation = useRejectSellerRegistration();
  const deleteMutation = useDeleteSellerRegistration();

  const items: SellerRegistrationFormValues[] =
    response?.data?.items ?? response?.data?.data ?? [];
  const apiPagination = response?.data?.pagination ?? response?.data;
  const total = apiPagination?.total ?? 0;
  const perPage = apiPagination?.per_page ?? pageSize;
  const currentP = apiPagination?.current_page ?? 1;
  const lastPage = apiPagination?.last_page ?? (Math.ceil(total / perPage) || 1);

  const pagination = {
    current_page: currentP,
    last_page: lastPage,
    per_page: perPage,
    total,
    from: (currentP - 1) * perPage + 1,
    to: Math.min(currentP * perPage, total),
  };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  const onApprove = async (id: number) => {
    if (!window.confirm(t('form.sellerRegApproveConfirm'))) return;
    try {
      await approveMutation.mutateAsync({ id });
      toast.success(t('form.sellerRegApprovedToast'));
    } catch { return; }
  };

  const onReject = async (id: number) => {
    if (!window.confirm(t('form.sellerRegRejectConfirm'))) return;
    try {
      await rejectMutation.mutateAsync(id);
      toast.success(t('form.sellerRegRejectedToast'));
    } catch { return; }
  };

  const onDelete = (id: number) => {
    setPendingDeleteId(id);
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteMutation.mutateAsync(pendingDeleteId);
      toast.success(t('form.sellerRegDeletedToast'));
    } catch { return; } finally {
      setIsDeleteDialogOpen(false);
      setPendingDeleteId(null);
      setDeletingId(null);
    }
  };

  const onDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setPendingDeleteId(null);
    setDeletingId(null);
  };

  return (
    <>
      <title>{t('form.sellerRegistrationsPageTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('form.sellerRegistrationsTableName')}
        columns={sellerRegistrationColumns(
          t,
          onDelete,
          deleteMutation.isPending,
          isDeleteDialogOpen,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          onApprove,
          onReject
        )}
        data={items}
        hasDetails
        detailsLink="/seller-registrations"
        permissions={{
          create: false,
          update: hasPermission('update', 'sellerregistration'),
          delete: hasPermission('delete', 'sellerregistration'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('form.sellerRegColId'),
          seller_name: t('form.sellerRegColSeller'),
          phone: t('form.sellerRegColContactPhone'),
          store_name: t('form.sellerRegColStore'),
          seller_type: t('form.sellerRegColType'),
          country: t('form.sellerRegColLocation'),
          status: t('form.sellerRegColStatus'),
          registered_at: t('form.sellerRegColRegistered'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSearchChange={setSearch}
      />
    </>
  );
}
