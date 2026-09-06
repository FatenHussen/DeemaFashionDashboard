import type { PageBuilderListItem } from '@/pages/dashboard/sections/types/page-builder.types';

import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { formatTranslated } from '@/utils/format-translated';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { pagesColumns } from '@/columns/one/sections/pages/columns';
import { useFetchPages } from '@/pages/dashboard/sections/hooks/usePageSections';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { canDeleteCmsPage } from '@/pages/dashboard/sections/utils/category-page';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';
import {
  useDeletePage,
  useFetchPageBuilderPages,
} from '@/pages/dashboard/sections/hooks/usePageBuilder';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Iconify } from 'src/shared/components/iconify';

type PagesTab = 'content' | 'category';

const selectClassName =
  'h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-sm text-foreground shadow-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15';

export default function Page() {
  const { t } = useTranslation('table');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: PagesTab = searchParams.get('tab') === 'category' ? 'category' : 'content';
  const isCategoryTab = activeTab === 'category';
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, categoryFilter]);

  useEffect(() => {
    if (!isCategoryTab) setCategoryFilter('');
  }, [isCategoryTab]);

  const handleTabChange = useCallback(
    (tab: PagesTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'content') next.delete('tab');
        else next.set('tab', tab);
        return next;
      });
    },
    [setSearchParams]
  );

  const categoryIdForApi =
    isCategoryTab &&
    categoryFilter &&
    !Number.isNaN(Number(categoryFilter)) &&
    Number(categoryFilter) > 0
      ? Number(categoryFilter)
      : undefined;

  // `type` splits the tabs server-side, so each tab fetches only its own page of rows.
  const {
    data: response,
    isLoading: isPagesLoading,
    error,
  } = useFetchPageBuilderPages({
    page: currentPage,
    per_page: pageSize,
    ...(search.trim() ? { search: search.trim() } : {}),
    type: activeTab,
    ...(categoryIdForApi != null ? { category_id: categoryIdForApi } : {}),
  });
  // Fallback: keep the screen usable on backends without `page.*` yet (already cached — feeds the pickers).
  const { data: legacyPagesData } = useFetchPages();
  const deleteMutation = useDeletePage();

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'pages-index-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
    enabled: isCategoryTab,
  });
  const flatCategories = categoriesResp?.data?.items ?? [];

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const useLegacyFallback = !!error && !response && !isCategoryTab;

  // Taken as-is: the list resource derives `is_category_page`/`can_delete_page`/`can_edit_metadata`
  // from `category_id` on every row, so the guards in `pagesColumns` always have what they read.
  const serverItems: PageBuilderListItem[] = response?.data?.items ?? [];

  // The legacy feed returns every page in one payload, so that path still filters and slices here.
  const searchTerm = search.trim().toLowerCase();
  const legacyItems: PageBuilderListItem[] = (legacyPagesData?.data ?? [])
    .map((p) => p as PageBuilderListItem)
    .filter(
      (p) =>
        !searchTerm ||
        `${cmsPageSelectLabel(p)} ${p.slug ?? ''}`.toLowerCase().includes(searchTerm)
    );
  const legacyLastPage = Math.max(1, Math.ceil(legacyItems.length / pageSize));
  const legacySafePage = Math.min(currentPage, legacyLastPage);

  const apiPagination = response?.data?.pagination;
  const items = useLegacyFallback
    ? legacyItems.slice((legacySafePage - 1) * pageSize, legacySafePage * pageSize)
    : serverItems;

  const activePagination = useLegacyFallback
    ? {
        current_page: legacySafePage,
        last_page: legacyLastPage,
        per_page: pageSize,
        total: legacyItems.length,
      }
    : {
        current_page: apiPagination?.current_page ?? currentPage,
        last_page: Math.max(1, apiPagination?.last_page ?? 1),
        per_page: apiPagination?.per_page ?? pageSize,
        total: apiPagination?.total ?? serverItems.length,
      };
  const pagination = {
    ...activePagination,
    from:
      activePagination.total > 0
        ? (activePagination.current_page - 1) * activePagination.per_page + 1
        : 0,
    to: Math.min(
      activePagination.current_page * activePagination.per_page,
      activePagination.total
    ),
  };
  const isLoading = isPagesLoading;

  const onDelete = (id: number) => {
    const row = items.find((p) => p.id === id);
    if (row && !canDeleteCmsPage(row)) {
      toast.error(t('form.categoryPageCannotDeleteDirectly'));
      return;
    }
    setDeletingId(id);
  };
  const onDeleteConfirm = async () => {
    if (!deletingId) return;
    const row = items.find((p) => p.id === deletingId);
    if (row && !canDeleteCmsPage(row)) {
      toast.error(t('form.categoryPageCannotDeleteDirectly'));
      setDeletingId(null);
      return;
    }
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('deleteSuccess'));
      setDeletingId(null);
    } catch {
      /* handled */
    }
  };
  const onDeleteCancel = () => setDeletingId(null);

  // Deleting the last row of the last page leaves the cursor past the end — the server would
  // answer with an empty list rather than clamping, so step back here.
  useEffect(() => {
    if (apiPagination && currentPage > apiPagination.last_page) {
      setCurrentPage(Math.max(1, apiPagination.last_page));
    }
  }, [apiPagination, currentPage]);

  const { can } = usePermissions();
  const canAct = (action: 'create' | 'update' | 'delete') => can(`page.${action}`);

  const tabButtonClass = (selected: boolean) =>
    [
      'group relative flex min-h-[2.85rem] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 sm:px-5',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
      selected
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-primary/[0.06] hover:text-foreground',
    ].join(' ');

  return (
    <>
      <title>{t('form.pagesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      {/* Content pages vs auto-generated category pages */}
      <Box className="mb-4 w-full max-w-xl">
        <div
          role="tablist"
          aria-label={t('tableNames.page')}
          className="relative grid w-full grid-cols-2 items-stretch gap-1 rounded-2xl border border-primary/20 bg-card/95 p-1.5 shadow-sm ring-1 ring-border/40"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'content'}
            onClick={() => handleTabChange('content')}
            className={tabButtonClass(activeTab === 'content')}
          >
            <Iconify icon="solar:document-text-bold" width={18} className="shrink-0" />
            <span className="truncate">{t('form.pagesTabContent')}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'category'}
            onClick={() => handleTabChange('category')}
            className={tabButtonClass(activeTab === 'category')}
          >
            <Iconify icon="solar:folder-with-files-bold" width={18} className="shrink-0" />
            <span className="truncate">{t('form.pagesTabCategory')}</span>
          </button>
        </div>
      </Box>

      {isCategoryTab && (
        <Box className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
          <Iconify icon="solar:info-circle-bold" className="mt-0.5 shrink-0 text-emerald-600" width={18} />
          <Typography variant="body2" className="text-muted-foreground">
            {t('form.pagesCategoryTabNotice')}
          </Typography>
        </Box>
      )}

      {useLegacyFallback && (
        <Box className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
          <Iconify icon="solar:info-circle-bold" className="mt-0.5 shrink-0 text-amber-600" width={18} />
          <Typography variant="body2" className="text-muted-foreground">
            {t('form.pageBuilderBackendMissingNotice')}
          </Typography>
        </Box>
      )}

      <DataTable
        tableName={t('tableNames.page')}
        columns={pagesColumns(
          t,
          {
            // On the category tab every row is an auto page — no manual edit/delete.
            permissions: {
              update: !isCategoryTab && canAct('update'),
              delete: !isCategoryTab && canAct('delete'),
            },
            onDelete,
            isDeleting: deleteMutation.isPending,
            isDeleteDialogOpen: deletingId !== null,
            onDeleteConfirm,
            onDeleteCancel,
            deletingId,
          },
          { hideFiltersColumn: isCategoryTab }
        )}
        data={items}
        createPath={isCategoryTab ? undefined : '/sections/pages/create'}
        hasDetails
        detailsLink="/sections/pages/details"
        permissions={{
          // Category pages follow their category — created/deleted automatically.
          create: !isCategoryTab && canAct('create'),
          update: !isCategoryTab && canAct('update'),
          delete: !isCategoryTab && canAct('delete'),
        }}
        isLoading={isLoading}
        onSearchChange={setSearch}
        searchPlaceholder={t('search')}
        filterSidebar={
          isCategoryTab ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('form.sectionListCategoryFilter')}
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={selectClassName}
              >
                <option value="">{t('form.sectionListCategoryAll')}</option>
                {flatCategories.map((c: { id: number; name: unknown }) => (
                  <option key={c.id} value={String(c.id)}>
                    {formatTranslated(c.name as Parameters<typeof formatTranslated>[0])}
                  </option>
                ))}
              </select>
            </div>
          ) : undefined
        }
        columnTranslations={{
          id: t('columns.id'),
          title: t('columns.title'),
          slug: t('columns.slug'),
          sections_count: t('columns.sectionsCount'),
          filters: t('columns.filters'),
          created_at: t('columns.createdAt'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={pagination.current_page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </>
  );
}
