import type { ReactNode } from 'react';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  contactMethodColumns,
  type ContactMethodFormValues,
} from '@/columns/one/contact-methods/one';
import {
  useDeleteContactMethod,
  useFetchContactMethods,
} from '@/pages/dashboard/contact-methods/hooks/contact-method';
import {
  CONTACT_METHOD_CREATE_ANY,
  CONTACT_METHOD_DELETE_ANY,
  CONTACT_METHOD_UPDATE_ANY,
} from '@/pages/dashboard/contact-methods/permissions';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: response, isLoading, error } = useFetchContactMethods(currentPage, pageSize, {
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(sortField ? { sort_field: sortField, sort_order: sortOrder } : {}),
  });
  const deleteMutation = useDeleteContactMethod();

  const { canAny } = usePermissions();

  const canCreate = () => canAny([...CONTACT_METHOD_CREATE_ANY]);
  const canUpdate = () => canAny([...CONTACT_METHOD_UPDATE_ANY]);
  const canDelete = () => canAny([...CONTACT_METHOD_DELETE_ANY]);

  if (error) console.error('Contact methods fetch error:', error);

  const handleDeleteRequest = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('form.contactMethodDeletedSuccess'));
    } catch {
      return;
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const items = (response?.data?.items ?? []) as ContactMethodFormValues[];
  const apiPagination = response?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(apiPagination.current_page * apiPagination.per_page, apiPagination.total),
      }
    : { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: 0, to: 0 };

  const sortSidebar = (
    <>
      <FilterGroup label={t('form.contactMethodSortField')}>
        <select
          value={sortField}
          onChange={(e) => {
            setSortField(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('form.contactMethodSortDefault')}</option>
          <option value="id">ID</option>
          <option value="type">{t('columns.type')}</option>
          <option value="created_at">{t('columns.createdAt')}</option>
        </select>
      </FilterGroup>
      <FilterGroup label={t('form.contactMethodSortOrder')}>
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as 'asc' | 'desc');
            setCurrentPage(1);
          }}
          disabled={!sortField}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="asc">{t('form.contactMethodSortAsc')}</option>
          <option value="desc">{t('form.contactMethodSortDesc')}</option>
        </select>
      </FilterGroup>
    </>
  );

  const activeSortCount = sortField ? 1 : 0;

  return (
    <>
      <title>{t('form.contactMethodsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.contactMethod')}
        columns={contactMethodColumns(
          {
            update: canUpdate(),
            delete: canDelete(),
          },
          t,
          handleDeleteRequest,
          deleteMutation.isPending,
          deleteDialogOpen,
          handleDeleteConfirm,
          handleDeleteCancel,
          deletingId
        )}
        data={items}
        hasDetails
        detailsLink="/contact-methods/update"
        createPath="/contact-methods/create"
        filterSidebar={sortSidebar}
        activeFilterCount={activeSortCount}
        onFilterReset={() => {
          setSortField('');
          setSortOrder('desc');
          setCurrentPage(1);
        }}
        permissions={{
          create: canCreate(),
          update: canUpdate(),
          delete: canDelete(),
        }}
        isLoading={isLoading}
        columnTranslations={{
          icon: t('columns.image'),
          type: t('columns.type'),
          value: t('columns.value'),
          created_at: t('columns.createdAt'),
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

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
