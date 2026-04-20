import type { ActivityLogItem } from '@/pages/dashboard/activity-logs/types/activity-log.types';

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { activityLogColumns } from '@/columns/one/activity-logs/one';
import { useFetchActivityLogs } from '@/pages/dashboard/activity-logs/hooks/activity-log';
import { ActivityLogChangesModal } from '@/pages/dashboard/activity-logs/components/activity-log-changes-modal';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<string>('');
  const [changesLog, setChangesLog] = useState<ActivityLogItem | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const openChanges = useCallback((item: ActivityLogItem) => setChangesLog(item), []);

  const filters = search.trim() ? { search: search.trim() } : undefined;

  const { data: response, isLoading } = useFetchActivityLogs(currentPage, pageSize, filters);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

  const items = response?.items ?? [];
  const apiPagination = response?.pagination;
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

  return (
    <>
      <title>{t('form.activityLogsIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t("tableNames.activityLog")}
        columns={activityLogColumns(t, { onViewChanges: openChanges })}
        data={items}
        hasDetails={false}
        rowClickToDetails={false}
        permissions={{ create: false, update: false, delete: false }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          user: t('columns.user'),
          action: t('columns.action'),
          model: t('columns.model'),
          message: t('columns.message'),
          changes_detail: t('form.activityLogChangesColumn'),
          date: t('columns.date'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={setSearch}
      />

      <ActivityLogChangesModal
        open={!!changesLog}
        onClose={() => setChangesLog(null)}
        log={changesLog}
      />
    </>
  );
}
