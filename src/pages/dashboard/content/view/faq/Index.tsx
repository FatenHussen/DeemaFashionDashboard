import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, type ReactNode } from 'react';
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
  const [search, setSearch] = useState<string>('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: response, isLoading, error } = useFetchFaqs(currentPage, pageSize, {
    type: typeFilter || undefined,
    ...(search.trim() ? { search: search.trim() } : {}),
  });
  const deleteMutation = useDeleteFaq();

  if (error) console.error('Error fetching FAQs:', error);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

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

  const sidebarContent = (
    <FilterGroup label={t('columns.type')}>
      <select
        value={typeFilter}
        onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
        className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t('all')}</option>
        {FAQ_TYPES.map((type) => (
          <option key={type} value={type}>
            {faqTypeLabel(t, type)}
          </option>
        ))}
      </select>
    </FilterGroup>
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
        filterSidebar={sidebarContent}
        activeFilterCount={typeFilter ? 1 : 0}
        onFilterReset={() => { setTypeFilter(''); setCurrentPage(1); }}
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

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
