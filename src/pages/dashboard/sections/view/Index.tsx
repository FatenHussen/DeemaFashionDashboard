import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { sectionColumns, type SectionFormValues } from '@/columns/one/sections/one';
import { sectionTypeLabel } from '@/pages/dashboard/sections/utils/section-type-label';
import { useFetchSections, useDeleteSection } from '@/pages/dashboard/sections/hooks/useSections';
import {
  contentTypeLabel,
  SECTION_CONTENT_TYPES,
  API_EXTRA_CONTENT_TYPES,
} from '@/pages/dashboard/sections/utils/content-type-config';

import { CONFIG } from 'src/global-config';

const selectClassName =
  'h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-sm text-foreground shadow-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15';

export default function Page() {
  const { t } = useTranslation(['table', 'nav']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, contentTypeFilter, typeFilter, statusFilter, categoryFilter]);

  const categoryIdForApi =
    categoryFilter && !Number.isNaN(Number(categoryFilter)) && Number(categoryFilter) > 0
      ? Number(categoryFilter)
      : undefined;

  const { data: sectionsResponse, isLoading, error } = useFetchSections({
    page: currentPage,
    per_page: pageSize,
    search: search.trim() || undefined,
    content_type: contentTypeFilter || undefined,
    type: typeFilter === 'manual' || typeFilter === 'api' ? typeFilter : undefined,
    is_active: statusFilter === '1' ? 1 : statusFilter === '0' ? 0 : undefined,
    category_id: categoryIdForApi,
  });

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
          content_type: t('columns.contentType'),
          type: t('columns.type'),
          variant: t('columns.variant'),
          pages_count: t('columns.pagesCount'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={setSearch}
        filterSidebar={
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('table:form.sectionListContentTypeFilter')}
              </label>
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
                className={selectClassName}
              >
                <option value="">{t('table:form.pageBuilderLibraryContentTypeAll')}</option>
                {[...SECTION_CONTENT_TYPES, ...API_EXTRA_CONTENT_TYPES].map((type) => (
                  <option key={type} value={type}>
                    {contentTypeLabel(t, type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('table:form.sectionListTypeFilter')}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={selectClassName}
              >
                <option value="">{t('table:form.sectionListTypeAll')}</option>
                <option value="manual">{sectionTypeLabel(t, 'manual')}</option>
                <option value="api">{sectionTypeLabel(t, 'api')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('table:form.sectionListStatusFilter')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={selectClassName}
              >
                <option value="">{t('table:form.sectionListStatusAll')}</option>
                <option value="1">{t('table:form.sectionListStatusActive')}</option>
                <option value="0">{t('table:form.sectionListStatusInactive')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('table:form.sectionListCategoryFilter')}
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={selectClassName}
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
          </div>
        }
      />
    </>
  );
}
