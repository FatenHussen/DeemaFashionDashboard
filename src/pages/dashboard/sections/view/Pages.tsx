import type { PageBuilderListItem } from '@/pages/dashboard/sections/types/page-builder.types';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { pagesColumns } from '@/columns/one/sections/pages/columns';
import { useFetchPages } from '@/pages/dashboard/sections/hooks/usePageSections';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';
import {
  useDeletePage,
  useFetchPageBuilderPages,
} from '@/pages/dashboard/sections/hooks/usePageBuilder';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Iconify } from 'src/shared/components/iconify';

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: response, isLoading, error } = useFetchPageBuilderPages({
    page: currentPage,
    per_page: pageSize,
    ...(search.trim() ? { search: search.trim() } : {}),
  });
  // Fallback: keep the screen usable on backends without `page.*` yet (already cached — feeds the pickers).
  const { data: legacyPagesData } = useFetchPages();
  const deleteMutation = useDeletePage();

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('deleteSuccess'));
      setDeletingId(null);
    } catch {
      /* handled */
    }
  };
  const onDeleteCancel = () => setDeletingId(null);

  const useLegacyFallback = !!error && !response;
  const legacyItems: PageBuilderListItem[] = (legacyPagesData?.data ?? [])
    .map((p) => p as PageBuilderListItem)
    .filter(
      (p) =>
        !search.trim() ||
        `${cmsPageSelectLabel(p)} ${p.slug ?? ''}`.toLowerCase().includes(search.trim().toLowerCase())
    );

  const items = useLegacyFallback ? legacyItems : (response?.data?.items ?? []);
  const apiPagination = useLegacyFallback ? undefined : response?.data?.pagination;
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
        per_page: Math.max(items.length, 10),
        total: items.length,
        from: items.length > 0 ? 1 : 0,
        to: items.length,
      };

  const { can } = usePermissions();
  const canAct = (action: 'create' | 'update' | 'delete') => can(`page.${action}`);

  return (
    <>
      <title>{t('form.pagesIndexDocumentTitle', { appName: CONFIG.appName })}</title>

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
        columns={pagesColumns(t, {
          permissions: { update: canAct('update'), delete: canAct('delete') },
          onDelete,
          isDeleting: deleteMutation.isPending,
          isDeleteDialogOpen: deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
        })}
        data={items}
        createPath="/sections/pages/create"
        hasDetails
        detailsLink="/sections/pages/details"
        permissions={{
          create: canAct('create'),
          update: canAct('update'),
          delete: canAct('delete'),
        }}
        isLoading={isLoading}
        onSearchChange={setSearch}
        searchPlaceholder={t('search')}
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
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </>
  );
}
