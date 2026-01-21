import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { languageColumns, type LanguageFormValues } from '@/columns/one/languages/one';
import { useFetchLanguages, useDeleteLanguage } from '@/pages/dashboard/languages/hooks/language';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Languages | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: languagesResponse, isLoading, error } = useFetchLanguages({ page: currentPage, limit: pageSize });
  const deleteLanguageMutation = useDeleteLanguage();

  if (error) {
    console.error('Error fetching languages:', error);
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
        await deleteLanguageMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Language deleted successfully');
        setDeletingId(null);
      } catch (err: any) {
        toast.error(err?.message || t('deleteError') || 'Failed to delete language');
      }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const languageData: LanguageFormValues[] = languagesResponse?.data?.items || [];
  const apiPagination = languagesResponse?.data?.pagination;
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
        tableName="Language"
        columns={languageColumns(
          {
            update: hasPermission('update', 'language'),
            delete: hasPermission('delete', 'language'),
          },
          t,
          onDelete,
          deleteLanguageMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId
        )}
        data={languageData}
        createPath="/languages/create"
        hasDetails={false}
        permissions={{
          create: hasPermission('create', 'language'),
          update: hasPermission('update', 'language'),
          delete: hasPermission('delete', 'language'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          flag_icon: 'Flag',
          code: 'Code',
          native_name: 'Native Name',
          direction: 'Direction',
          order: 'Order',
          is_default: 'Default',
          status: 'Status',
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
