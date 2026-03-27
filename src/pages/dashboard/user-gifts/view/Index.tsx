import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchUserGifts } from '@/pages/dashboard/user-gifts/hooks/user-gift';
import { userGiftColumns, type UserGiftFormValues } from '@/columns/one/user-gifts/one';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: response, isLoading, error } = useFetchUserGifts(
    currentPage,
    pageSize
  );

  if (error) console.error('Error fetching user gifts:', error);

  const rawData = response?.data;
  const items: UserGiftFormValues[] = Array.isArray(rawData)
    ? rawData
    : (rawData as { items?: UserGiftFormValues[] })?.items ?? [];
  const apiPagination = (rawData as {
    pagination?: { current_page: number; last_page: number; per_page: number; total: number };
  })?.pagination;
  const apiMeta = (response as any)?.meta;
  const total = apiPagination?.total ?? apiMeta?.total ?? 0;
  const perPage = apiPagination?.per_page ?? apiMeta?.per_page ?? pageSize;
  const currentP = apiPagination?.current_page ?? apiMeta?.current_page ?? 1;
  const lastPage = (apiPagination?.last_page ?? Math.ceil(total / perPage)) || 1;
  const pagination = {
    current_page: currentP,
    last_page: lastPage,
    per_page: perPage,
    total,
    from: total ? (currentP - 1) * perPage + 1 : 0,
    to: Math.min(currentP * perPage, total),
  };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) =>
    can(`${resource}.${action}`);

  return (
    <>
      <title>{t('form.userGiftsIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t("tableNames.userGift")}
        columns={userGiftColumns(t)}
        data={items}
        createPath="/user-gifts/create"
        hasDetails
        detailsLink="/user-gifts/details"
        permissions={{
          create: hasPermission('create', 'gift'),
          update: false,
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          gift_name: t('columns.gift'),
          user_name: t('columns.user'),
          address: t('columns.address'),
          status: t('columns.status'),
          created_at: t('columns.created'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page: number) => setCurrentPage(page)}
        onPageSizeChange={(size: number) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </>
  );
}
