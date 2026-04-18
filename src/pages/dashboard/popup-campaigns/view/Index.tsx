import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  popupCampaignColumns,
  type PopupCampaignRow,
} from '@/columns/one/popup-campaigns/one';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useFetchPopupCampaigns, useDeletePopupCampaign } from '../hooks';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const { data: response, isLoading } = useFetchPopupCampaigns(
    currentPage,
    pageSize,
    appliedSearch.trim() || undefined
  );
  const deleteMutation = useDeletePopupCampaign();

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteCancel = () => setDeletingId(null);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch {
        return;
      }
    }
  };

  const handleApplySearch = () => {
    setAppliedSearch(search);
    setCurrentPage(1);
  };

  const items: PopupCampaignRow[] = response?.data?.items || [];
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
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const { can } = usePermissions();
  const hasPermission = (action: string) => can(`popupcampaign.${action}`);

  const toolbarSearch = (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <input
        type="text"
        placeholder={t('form.popupCampaignSearchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
        className="h-10 min-w-[200px] flex-1 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="button"
        onClick={handleApplySearch}
        className="h-10 rounded-xl border border-input bg-background px-4 text-sm font-medium hover:bg-muted shrink-0"
      >
        {t('apply')}
      </button>
    </div>
  );

  return (
    <>
      <title>{t('form.popupCampaignIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.popupCampaign')}
        columns={popupCampaignColumns(
          {
            update: hasPermission('update'),
            delete: hasPermission('delete'),
          },
          t,
          onDelete,
          deleteMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={items}
        createPath={paths.dashboard.popupCampaigns.create}
        hasDetails
        detailsLink="/popup-campaigns/update"
        searchColumns={[]}
        toolbarFilter={toolbarSearch}
        permissions={{
          create: hasPermission('create'),
          update: hasPermission('update'),
          delete: hasPermission('delete'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          title: t('columns.title'),
          type: t('columns.type'),
          status: t('columns.status'),
          priority: t('columns.priority'),
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
      />
    </>
  );
}
