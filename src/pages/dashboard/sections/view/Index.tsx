import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { sectionColumns, type SectionFormValues } from '@/columns/one/sections/one';
import { useFetchSections, useDeleteSection } from '@/pages/dashboard/sections/hooks/useSections';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation(['table', 'nav']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const categoryIdForApi =
    categoryFilter && !Number.isNaN(Number(categoryFilter)) && Number(categoryFilter) > 0
      ? Number(categoryFilter)
      : undefined;

  const { data: sectionsResponse, isLoading, error } = useFetchSections(
    currentPage,
    pageSize,
    search.trim() || undefined,
    categoryIdForApi
  );

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'sections-index-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });
  const flatCategories = categoriesResp?.data?.items ?? [];
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
        filterSidebar={
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('table:form.sectionListCategoryFilter')}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-sm text-foreground shadow-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
            >
              <option value="">{t('table:form.sectionListCategoryAll')}</option>
              {flatCategories.map((c: { id: number; name: unknown }) => (
                <option key={c.id} value={String(c.id)}>
                  {formatTranslated(c.name as Parameters<typeof formatTranslated>[0])}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">{t('table:form.sectionListCategoryFilterHint')}</p>
          </div>
        }
      />
    </>
  );
}
