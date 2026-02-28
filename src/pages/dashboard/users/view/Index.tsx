import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchAreas } from '@/pages/dashboard/locations/hooks/area';
import { userColumns, type UserFormValues } from '@/columns/one/users/one';
import { useFetchUsers, useDeleteUser } from '@/pages/dashboard/users/hooks/user';

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

  const { data: areasResponse } = useFetchAreas();
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
      } catch {}
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

  return (
    <>
      <title>{metadata.title}</title>

      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 p-4 bg-linear-to-r from-muted/30 via-transparent to-muted/30 rounded-xl border border-border/30 rtl:flex-row-reverse">
          <div className="flex items-center gap-2 shrink-0 rtl:flex-row-reverse">
            <label className="text-sm font-medium text-foreground">{t('isAffiliateLabel')}:</label>
            <select
              value={isAffiliateFilter}
              onChange={(e) => {
                setIsAffiliateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 min-w-[100px] rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t('all')}</option>
              <option value="0">{t('no')}</option>
              <option value="1">{t('yes')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0 rtl:flex-row-reverse">
            <label className="text-sm font-medium text-foreground">
              {t('affiliateApprovedLabel')}:
            </label>
            <select
              value={affiliateApprovedFilter}
              onChange={(e) => {
                setAffiliateApprovedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 min-w-[100px] rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t('all')}</option>
              <option value="0">{t('no')}</option>
              <option value="1">{t('yes')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0 rtl:flex-row-reverse">
            <label className="text-sm font-medium text-foreground">{t('areaLabel')}:</label>
            <select
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t('all')}</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          {(isAffiliateFilter || affiliateApprovedFilter || areaFilter) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-primary hover:underline"
            >
              {t('resetFilter')}
            </button>
          )}
        </div>

        <DataTable
          tableName="User"
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
            handleEdit
          )}
          data={userData}
          createPath="/users/create"
          hasDetails
          detailsLink="/users/details"
          permissions={{
            create: hasPermission('create', 'user'),
            update: hasPermission('update', 'user'),
            delete: hasPermission('delete', 'user'),
          }}
          isLoading={isLoading}
          columnTranslations={{
            id: 'ID',
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            affiliate: 'Affiliate',
            created_at: 'Created',
            actions: 'Actions',
          }}
          pagination={pagination}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </>
  );
}
