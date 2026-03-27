import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchAdminNotifications } from '@/pages/dashboard/admin-notifications/hooks/notification';
import {
  adminNotificationColumns,
  type NotificationFormValues,
} from '@/columns/one/admin-notifications/one';
import { AdminNotificationTableFilters } from '@/pages/dashboard/admin-notifications/components/notification-table-filters';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data: response, isLoading, error } = useFetchAdminNotifications(
    currentPage,
    pageSize,
    search || undefined
  );

  if (error) console.error('Error fetching admin notifications:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const items: NotificationFormValues[] = response?.data?.items || [];
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
  const hasCreatePermission = can('notification.create');

  return (
    <>
      <title>{t('form.adminNotificationsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t("tableNames.adminNotifications")}
        columns={adminNotificationColumns(
          { update: hasCreatePermission },
          t,
          '/admin-notifications/update'
        )}
        data={items}
        hasDetails={false}
        createPath="/admin-notifications/create"
        permissions={{
          create: hasCreatePermission,
          update: hasCreatePermission,
          delete: false,
        }}
        searchColumns={[]}
        isLoading={isLoading}
        toolbarFilter={({ table }) => (
          <AdminNotificationTableFilters
            table={table}
            search={search}
            onSearchChange={handleSearchChange}
            t={t}
          />
        )}
        columnTranslations={{
          id: t('columns.id'),
          title: t('columns.title'),
          body: t('columns.body'),
          type: t('columns.type'),
          is_fixed: t('form.notificationIsFixedLabel'),
          created_at: t('columns.createdAt'),
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
