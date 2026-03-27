import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { FAQ_TYPES } from '@/pages/dashboard/content/types/faq.types';
import { faqColumns, type FaqFormValues } from '@/columns/one/faqs/one';
import { faqTypeLabel } from '@/pages/dashboard/content/utils/faq-type-label';
import { useFetchFaqs, useDeleteFaq } from '@/pages/dashboard/content/hooks/faq';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState('');

  // Delete state (controlled externally for the dialog in DataTableRowActions)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: response, isLoading, error } = useFetchFaqs(currentPage, pageSize, {
    type: typeFilter || undefined,
  });
  const deleteMutation = useDeleteFaq();

  if (error) console.error('Error fetching FAQs:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Called when user clicks Delete in the ⋮ menu
  const handleDeleteRequest = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('form.faqDeletedSuccess'));
    } catch { return; } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const items: FaqFormValues[] = response?.data?.items || [];
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

  const filterContent = (
    <>
      <select
        value={typeFilter}
        onChange={(e) => {
          setTypeFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="h-10 min-w-[140px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t('all')}</option>
        {FAQ_TYPES.map((type) => (
          <option key={type} value={type}>
            {faqTypeLabel(t, type)}
          </option>
        ))}
      </select>
      {typeFilter && (
        <button
          type="button"
          onClick={() => {
            setTypeFilter('');
            setCurrentPage(1);
          }}
          className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {t('resetFilter')}
        </button>
      )}
    </>
  );

  return (
    <>
      <title>{t('form.faqsIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <DataTable
        tableName={t("tableNames.faq")}
        columns={faqColumns(
          t,
          handleDeleteRequest,
          deleteMutation.isPending,
          deleteDialogOpen,
          handleDeleteConfirm,
          handleDeleteCancel,
          deletingId
        )}
        data={items}
        hasDetails
        detailsLink="/faqs/update"
        createPath="/faqs/create"
        toolbarFilter={filterContent}
        permissions={{
          create: true,
          update: true,
          delete: true,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          type: t('columns.type'),
          question: t('columns.question'),
          answer: t('columns.answer'),
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
