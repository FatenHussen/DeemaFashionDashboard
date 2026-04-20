import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { sectionColumns, type SectionFormValues } from '@/columns/one/sections/one';
import { useFetchSections, useDeleteSection } from '@/pages/dashboard/sections/hooks/useSections';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation(['table', 'nav']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: sectionsResponse, isLoading, error } = useFetchSections(
    currentPage,
    pageSize,
    search.trim() || undefined
  );
  const deleteSectionMutation = useDeleteSection();

  if (error) {
    console.error('Error fetching sections:', error);
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
        await deleteSectionMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const sectionData: SectionFormValues[] = sectionsResponse?.data?.items || [];
  const apiPagination = sectionsResponse?.data?.pagination;
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
      <title>{t('form.sectionsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t('tableNames.section')}
        columns={sectionColumns(
          {
            update: hasPermission('update', 'section'),
            delete: hasPermission('delete', 'section'),
          },
          t,
          onDelete,
          deleteSectionMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={sectionData}
        createPath="/sections/create"
        hasDetails
        permissions={{
          create: hasPermission('create', 'section'),
          update: hasPermission('update', 'section'),
          delete: hasPermission('delete', 'section'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          type: t('columns.type'),
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
