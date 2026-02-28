import { useState } from 'react';
import { toast } from 'react-toastify';
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

const metadata = { title: `Seller Registrations | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const { data: response, isLoading } = useFetchSellerRegistrations(currentPage, pageSize);
  const approveMutation = useApproveSellerRegistration();
  const rejectMutation = useRejectSellerRegistration();
  const deleteMutation = useDeleteSellerRegistration();

  // The list response uses Laravel paginator format (data.data, not data.items)
  const items: SellerRegistrationFormValues[] = response?.data?.data || [];
  const rawPagination = response?.data;
  const total = rawPagination?.total ?? 0;
  const perPage = rawPagination?.per_page ?? pageSize;
  const currentP = rawPagination?.current_page ?? 1;
  const lastPage = rawPagination?.last_page ?? (Math.ceil(total / perPage) || 1);

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
    if (!window.confirm('Approve this seller registration? A vendor account will be created and credentials sent via email.')) return;
    try {
      await approveMutation.mutateAsync({ id });
      toast.success('Registration approved and credentials sent via email');
    } catch {}
  };

  const onReject = async (id: number) => {
    if (!window.confirm('Reject this seller registration?')) return;
    try {
      await rejectMutation.mutateAsync(id);
      toast.success('Registration rejected');
    } catch {}
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
      toast.success('Registration deleted successfully');
    } catch {} finally {
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
      <title>{metadata.title}</title>

      <DataTable
        tableName="Seller Registrations"
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
          id: 'ID',
          seller_name: 'Seller',
          store_name: 'Store',
          country: 'Location',
          status: 'Status',
          registered_at: 'Registered',
          actions: 'Actions',
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </>
  );
}
