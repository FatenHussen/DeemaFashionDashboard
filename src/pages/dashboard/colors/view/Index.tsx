import type { ColorListItem } from '@/pages/dashboard/colors/types/color.types';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { colorColumns } from '@/columns/one/colors/one';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useDeleteColor, useFetchColors } from '@/pages/dashboard/colors/hooks/color';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [hexFilter, setHexFilter] = useState('');
  const [sortField, setSortField] = useState<'' | 'id' | 'hex' | 'is_active' | 'created_at'>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeFilter, hexFilter, sortField, sortOrder]);

  const { data: response, isLoading } = useFetchColors({
    page: currentPage,
    per_page: pageSize,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(activeFilter === '' ? {} : { is_active: activeFilter === '1' }),
    ...(hexFilter.trim() ? { hex: hexFilter.trim().slice(0, 7) } : {}),
    ...(sortField ? { sort_field: sortField, sort_order: sortOrder } : {}),
  });
  const deleteMutation = useDeleteColor();

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch {
        return;
      }
    }
  };
  const onDeleteCancel = () => setDeletingId(null);

  const handleEdit = (row: { original: ColorListItem }) => {
    navigate(`/colors/update/${row.original.id}`);
  };

  const items = response?.data?.items ?? [];
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

  const { canAny } = usePermissions();
  /** Backend may register `color.*` (common) or `Color.*` — match either. */
  const colorCan = (action: 'create' | 'update' | 'delete') =>
    canAny([`color.${action}`, `Color.${action}`]);

  const toolbarFilter = (
    <Box className="flex flex-wrap items-end gap-3">
      <Box className="flex min-w-[140px] flex-col gap-1">
        <Typography variant="caption" className="text-muted-foreground">
          {t('form.colorSearchLabel')}
        </Typography>
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t('form.colorSearchPlaceholder')}
          className="h-9"
        />
      </Box>
      <Box className="flex min-w-[120px] flex-col gap-1">
        <Typography variant="caption" className="text-muted-foreground">
          {t('form.colorHexFilterLabel')}
        </Typography>
        <Input
          value={hexFilter}
          onChange={(e) => setHexFilter(e.target.value.slice(0, 7))}
          placeholder="#FF0000"
          className="h-9 font-mono"
        />
      </Box>
      <Box className="flex min-w-[130px] flex-col gap-1">
        <Typography variant="caption" className="text-muted-foreground">
          {t('form.colorStatusFilter')}
        </Typography>
        <select
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="">{t('form.saleCountryStatusAll')}</option>
          <option value="1">{t('active')}</option>
          <option value="0">{t('inactive')}</option>
        </select>
      </Box>
      <Box className="flex min-w-[140px] flex-col gap-1">
        <Typography variant="caption" className="text-muted-foreground">
          {t('form.colorSortField')}
        </Typography>
        <select
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          value={sortField}
          onChange={(e) => setSortField(e.target.value as typeof sortField)}
        >
          <option value="">{t('form.colorSortDefault')}</option>
          <option value="id">ID</option>
          <option value="hex">{t('columns.hex')}</option>
          <option value="is_active">{t('columns.status')}</option>
          <option value="created_at">{t('columns.createdAt')}</option>
        </select>
      </Box>
      {sortField ? (
        <Box className="flex min-w-[120px] flex-col gap-1">
          <Typography variant="caption" className="text-muted-foreground">
            {t('form.colorSortOrder')}
          </Typography>
          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">{t('form.colorSortAsc')}</option>
            <option value="desc">{t('form.colorSortDesc')}</option>
          </select>
        </Box>
      ) : null}
    </Box>
  );

  return (
    <>
      <title>{t('form.colorsIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t('tableNames.color')}
        columns={colorColumns(
          {
            update: colorCan('update'),
            delete: colorCan('delete'),
          },
          t,
          onDelete,
          deleteMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          handleEdit
        )}
        data={items}
        createPath="/colors/create"
        hasDetails={false}
        searchColumns={[]}
        permissions={{
          create: colorCan('create'),
          update: colorCan('update'),
          delete: colorCan('delete'),
        }}
        isLoading={isLoading}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        toolbarFilter={toolbarFilter}
      />
    </>
  );
}
