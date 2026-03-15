import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { FAQ_TYPES } from '@/pages/dashboard/content/types/faq.types';
import { faqColumns, type FaqFormValues } from '@/columns/one/faqs/one';
import { useFetchFaqs, useDeleteFaq } from '@/pages/dashboard/content/hooks/faq';

import { CONFIG } from 'src/global-config';

const metadata = { title: `FAQs | Dashboard - ${CONFIG.appName}` };

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
      toast.success('FAQ deleted successfully');
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

  return (
    <>
      <title>{metadata.title}</title>

      {/* Type filter - matches Users/Index style */}
      <div className="mb-4 flex flex-wrap items-center gap-3 p-4 bg-linear-to-r from-muted/30 via-transparent to-muted/30 rounded-xl border border-border/30 rtl:flex-row-reverse">
        <div className="flex items-center gap-2 shrink-0 rtl:flex-row-reverse">
          <label className="text-sm font-medium text-foreground">{t('typeLabel', 'Type')}:</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t('all')}</option>
            {FAQ_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'stores&drivers' ? 'Stores & Drivers' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {typeFilter && (
          <button
            type="button"
            onClick={() => {
              setTypeFilter('');
              setCurrentPage(1);
            }}
            className="text-sm text-primary hover:underline"
          >
            {t('resetFilter')}
          </button>
        )}
      </div>

      <DataTable
        tableName="FAQs"
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
        permissions={{
          create: true,
          update: true,
          delete: true,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          type: 'Type',
          question: 'Question',
          answer: 'Answer',
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
