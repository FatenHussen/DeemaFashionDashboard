import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchAreas } from '@/pages/dashboard/locations/hooks/area';
import { userColumns, type UserFormValues } from '@/columns/one/users/one';
import { UpdatePasswordDialog } from '@/shared/components/update-password-dialog';
import { useFetchUsers, useDeleteUser, useUpdateUser, useFetchUserById } from '@/pages/dashboard/users/hooks/user';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Users | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAffiliateFilter, setIsAffiliateFilter] = useState<string>('');
  const [affiliateApprovedFilter, setAffiliateApprovedFilter] = useState<string>('');
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordDialogTargetId, setPasswordDialogTargetId] = useState<number | null>(null);

  const { data: areasResponse } = useFetchAreas();
  const { data: userDetailsResponse } = useFetchUserById(passwordDialogTargetId ?? '');
  const areas = areasResponse?.data?.items || [];

  const params: Record<string, number> = {};
  if (isAffiliateFilter !== '') params.is_affiliate = parseInt(isAffiliateFilter, 10);
  if (affiliateApprovedFilter !== '')
    params.affiliate_approved = parseInt(affiliateApprovedFilter, 10);
  if (areaFilter !== '') params.area_id = parseInt(areaFilter, 10);

  const { data: usersResponse, isLoading, error } = useFetchUsers(
    currentPage,
    pageSize,
    Object.keys(params).length > 0 ? params : undefined
  );

  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();

  if (error) {
    console.error('Error fetching users:', error);
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
        await deleteUserMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'User deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const handleEdit = (row: { original: UserFormValues }) => {
    navigate(`/users/update/${row.original.id}`, {
      state: { user: row.original },
    });
  };

  const onUpdatePassword = (row: { original: UserFormValues }) => {
    setPasswordDialogTargetId(row.original.id);
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async (data: { password: string; password_confirmation: string }) => {
    if (!passwordDialogTargetId) return;
    const user = userDetailsResponse?.data ?? userData.find((u) => u.id === passwordDialogTargetId);
    await updateUserMutation.mutateAsync({
      id: passwordDialogTargetId,
      data: {
        name: user?.name ?? '',
        last_name: (user as any)?.last_name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        area_id: (user as any)?.area_id ?? 0,
        password: data.password,
        password_confirmation: data.password_confirmation,
      },
    });
    toast.success('Password updated successfully');
    setPasswordDialogTargetId(null);
    setPasswordDialogOpen(false);
  };

  const userData: UserFormValues[] = usersResponse?.data?.items || [];
  const apiPagination = usersResponse?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(
          apiPagination.current_page * apiPagination.per_page,
          apiPagination.total
        ),
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
  const hasPermission = (action: string, resource: string) =>
    can(`${resource}.${action}`);

  const resetFilters = () => {
    setIsAffiliateFilter('');
    setAffiliateApprovedFilter('');
    setAreaFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = isAffiliateFilter || affiliateApprovedFilter || areaFilter;

  const filterContent = (
    <>
      <select
        value={isAffiliateFilter}
        onChange={(e) => {
          setIsAffiliateFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="h-10 min-w-[120px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t('isAffiliateLabel')}</option>
        <option value="0">{t('no')}</option>
        <option value="1">{t('yes')}</option>
      </select>
      <select
        value={affiliateApprovedFilter}
        onChange={(e) => {
          setAffiliateApprovedFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="h-10 min-w-[120px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t('affiliateApprovedLabel')}</option>
        <option value="0">{t('no')}</option>
        <option value="1">{t('yes')}</option>
      </select>
      <select
        value={areaFilter}
        onChange={(e) => {
          setAreaFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="h-10 min-w-[140px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t('areaLabel')}</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>
            {typeof a.name === 'object' ? (a.name.en || a.name.ar) : a.name}
          </option>
        ))}
      </select>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {t('resetFilter')}
        </button>
      )}
    </>
  );

  return (
    <>
      <title>{metadata.title}</title>

      <UpdatePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
        isSubmitting={updateUserMutation.isPending}
        entityName="User"
        minLength={6}
      />

      <DataTable
        tableName={t("tableNames.user")}
        columns={userColumns(
          {
            update: hasPermission('update', 'user'),
            delete: hasPermission('delete', 'user'),
          },
          t,
          onDelete,
          deleteUserMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          handleEdit,
          onUpdatePassword
        )}
        data={userData}
        createPath="/users/create"
        hasDetails
        detailsLink="/users/details"
        toolbarFilter={filterContent}
        permissions={{
          create: hasPermission('create', 'user'),
          update: hasPermission('update', 'user'),
          delete: hasPermission('delete', 'user'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          email: t('columns.email'),
          phone: t('columns.phone'),
          affiliate: t('columns.affiliate'),
          created_at: t('columns.created'),
          actions: t('columns.action'),
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
