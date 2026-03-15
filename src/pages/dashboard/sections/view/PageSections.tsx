import { useState } from 'react';
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

const metadata = { title: `Page Sections | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: pageSectionsResponse,
    isLoading,
    error,
  } = useFetchPageSections(currentPage, pageSize);
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
        toast.success(t('deleteSuccess') || 'Page Section deleted successfully');
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
    position: (item.position ?? 'before') as 'before' | 'after',
    order: item.order ?? 0,
    display_type_id: item.display_type_id ?? 0,
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
      <title>{metadata.title}</title>

      <DataTable
        tableName="Page Section"
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
          id: 'ID',
          name: 'Name',
          type: 'Type',
          position: 'Position',
          order: 'Order',
          display_type_id: 'Display Type',
          actions: 'Actions',
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
