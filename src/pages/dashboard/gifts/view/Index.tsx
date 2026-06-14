import type { CategoryData } from '@/pages/dashboard/categories/types/category.types';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { giftColumns, type GiftFormValues } from '@/columns/one/gifts/one';
import { useFetchGifts, useDeleteGift } from '@/pages/dashboard/gifts/hooks/gift';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import {
  buildCategorySelectRows,
  nativeSelectCategoryLabel,
} from '@/pages/dashboard/categories/utils/build-parent-picker-options';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const params: { search?: string; category_id?: number } = {};
  if (search.trim()) params.search = search.trim();
  if (categoryFilter) params.category_id = Number(categoryFilter);

  const { data: response, isLoading, error } = useFetchGifts(currentPage, pageSize, params);
  const deleteMutation = useDeleteGift();

  const { data: categoriesResp } = useQuery({
    queryKey: ['categories', 'gift-index-filter'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });

  const filterCategoryOptions = useMemo(
    () => buildCategorySelectRows((categoriesResp?.data?.items ?? []) as CategoryData[]),
    [categoriesResp?.data?.items]
  );

  if (error) console.error('Error fetching gifts:', error);

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
  const handleEdit = (row: { original: GiftFormValues }) => {
    navigate(`/gifts/update/${row.original.id}`, { state: { gift: row.original } });
  };

  const rawData = response?.data;
  const items: GiftFormValues[] = Array.isArray(rawData)
    ? rawData
    : (rawData as { items?: GiftFormValues[] })?.items ?? [];
  const apiPagination = (rawData as { pagination?: { current_page: number; last_page: number; per_page: number; total: number } })?.pagination;
  const apiMeta = (response as any)?.meta;
  const total = apiPagination?.total ?? apiMeta?.total ?? 0;
  const perPage = apiPagination?.per_page ?? apiMeta?.per_page ?? pageSize;
  const currentP = apiPagination?.current_page ?? apiMeta?.current_page ?? 1;
  const lastPage = (apiPagination?.last_page ?? Math.ceil(total / perPage)) || 1;
  const pagination = {
    current_page: currentP,
    last_page: lastPage,
    per_page: perPage,
    total,
    from: total ? (currentP - 1) * perPage + 1 : 0,
    to: Math.min(currentP * perPage, total),
  };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  const filterSelectClass =
    'w-full h-10 rounded-lg border border-border/60 bg-background px-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-colors';

  return (
    <>
      <title>{t('form.giftsIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t("tableNames.gift")}
        columns={giftColumns(
          { update: hasPermission('update', 'gift'), delete: hasPermission('delete', 'gift') },
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
        createPath="/gifts/create"
        hasDetails
        detailsLink="/gifts/details"
        permissions={{ create: hasPermission('create', 'gift'), update: hasPermission('update', 'gift'), delete: hasPermission('delete', 'gift') }}
        isLoading={isLoading}
        columnTranslations={{ id: t('columns.id'), name: t('columns.name'), points_required: t('columns.points'), stock_quantity: t('columns.stock'), exchanges_count: t('columns.exchanges'), is_active: t('columns.status'), created_at: t('columns.created'), actions: t('columns.action') }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page: number) => setCurrentPage(page)}
        onPageSizeChange={(size: number) => { setPageSize(size); setCurrentPage(1); }}
        onSearchChange={setSearch}
        activeFilterCount={categoryFilter ? 1 : 0}
        onFilterReset={() => {
          setCategoryFilter('');
          setCurrentPage(1);
        }}
        filterSidebar={
          <div className="flex flex-col gap-5">
            <FilterGroup label={t('columns.category')}>
              <select
                className={filterSelectClass}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">{t('all')}</option>
                {filterCategoryOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {nativeSelectCategoryLabel(c.label, c.depth, c.hasChildren)}
                  </option>
                ))}
              </select>
            </FilterGroup>
          </div>
        }
      />
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
