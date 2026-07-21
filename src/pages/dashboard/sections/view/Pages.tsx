import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { pagesColumns } from '@/columns/one/sections/pages/columns';
import { useFetchPages } from '@/pages/dashboard/sections/hooks/usePageSections';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');

  const { data: pagesResponse, isLoading, error } = useFetchPages();

  if (error) {
    console.error('Error fetching pages:', error);
  }

  const pages = pagesResponse?.data ?? [];

  return (
    <>
      <title>{t('form.pagesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.page')}
        columns={pagesColumns(t)}
        data={pages}
        hasDetails
        detailsLink="/sections/pages/details"
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          title: t('columns.title'),
          slug: t('columns.slug'),
          filters: t('columns.filters'),
          created_at: t('columns.createdAt'),
        }}
      />
    </>
  );
}
