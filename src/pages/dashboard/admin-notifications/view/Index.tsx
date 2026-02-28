import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchAdminNotifications } from '@/pages/dashboard/admin-notifications/hooks/notification';
import {
  adminNotificationColumns,
  type NotificationFormValues,
} from '@/columns/one/admin-notifications/one';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Admin Notifications | Dashboard - ${CONFIG.appName}` };

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
      <title>{metadata.title}</title>

      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4 shadow-sm rtl:flex-row-reverse">
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCurrentPage(1);
            }}
            className="h-9 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t('clear')}
          </button>
        )}
      </div>

      <DataTable
        tableName="Admin Notifications"
        columns={adminNotificationColumns(t)}
        data={items}
        hasDetails={false}
        createPath="/admin-notifications/create"
        permissions={{
          create: hasCreatePermission,
          update: false,
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          title: 'Title',
          body: 'Body',
          type: 'Type',
          created_at: 'Created At',
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
