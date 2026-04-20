import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  pageSectionColumns,
  type PageSectionFormValues,
} from '@/columns/one/sections/page-sections/columns';
import {
  useFetchPageSections,
  useDeletePageSection,
} from '@/pages/dashboard/sections/hooks/usePageSections';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const {
    data: pageSectionsResponse,
    isLoading,
    error,
  } = useFetchPageSections(currentPage, pageSize, search.trim() || undefined);
  const deletePageSectionMutation = useDeletePageSection();

  if (error) {
    console.error('Error fetching page sections:', error);
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
        await deletePageSectionMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const pageSectionData: PageSectionFormValues[] = (
    pageSectionsResponse?.data?.items || []
  ).map((item) => ({
    ...item,
    name: formatTranslated(item.name as Parameters<typeof formatTranslated>[0]) ?? '-',
    type: (item.type ?? 'manual') as 'api' | 'manual',
  }));
  const apiPagination = pageSectionsResponse?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(apiPagination.current_page * apiPagination.per_page, apiPagination.total),
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

  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{t('form.pageSectionsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.pageSection')}
        columns={pageSectionColumns(
          {
            update: hasPermission('update', 'pagesection'),
            delete: hasPermission('delete', 'pagesection'),
          },
          t,
          onDelete,
          deletePageSectionMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={pageSectionData}
        createPath="/sections/page-sections/create"
        hasDetails
        permissions={{
          create: hasPermission('create', 'pagesection'),
          update: hasPermission('update', 'pagesection'),
          delete: hasPermission('delete', 'pagesection'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          type: t('columns.type'),
          manual_model: t('columns.manualModel'),
          filters: t('columns.filters'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={setSearch}
      />
    </>
  );
}
