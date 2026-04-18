import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { userBasketScheduleColumns, type UserBasketScheduleTableItem } from '@/columns/one/user-basket-schedules/one';
import {
  useFetchUserBasketSchedules,
  useSetUserBasketScheduleActive,
} from '@/pages/dashboard/user-basket-schedules/hooks/user-basket-schedule';

import { CONFIG } from 'src/global-config';

const metadata = { title: `User Basket Schedules | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: response, isLoading } = useFetchUserBasketSchedules(currentPage, pageSize);
  const setActiveMutation = useSetUserBasketScheduleActive();

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const rawItems = response?.data?.items ?? [];
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
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);
  const canUpdate = hasPermission('update', 'userbasketschedule');

  return (
    <>
      <title>{metadata.title}</title>
      <DataTable
        tableName="UserBasketSchedule"
        columns={userBasketScheduleColumns(t, {
          permissions: { update: canUpdate, delete: false },
          onDisable: (id) => setActiveMutation.mutateAsync({ id, nextActive: false }),
          onEnable: (id) => setActiveMutation.mutateAsync({ id, nextActive: true }),
          pendingId:
            setActiveMutation.isPending && setActiveMutation.variables?.id != null
              ? setActiveMutation.variables.id
              : null,
        })}
        data={rawItems as UserBasketScheduleTableItem[]}
        hasDetails={false}
        permissions={{
          create: false,
          update: hasPermission('update', 'userbasketschedule'),
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          user: t('columns.user'),
          name: t('form.basketLabel'),
          num_varieties: t('columns.varieties'),
          original_price: t('columns.originalPrice'),
          final_price: t('columns.finalPrice'),
          discount: t('columns.discount'),
          schedule: t('form.scheduleLabel'),
          start_date: t('columns.startDate'),
          next_run_date: t('columns.nextRunDate'),
          status: t('columns.status'),
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
