import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { giftColumns, type GiftFormValues } from '@/columns/one/gifts/one';
import { useFetchGifts, useDeleteGift } from '@/pages/dashboard/gifts/hooks/gift';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const params: { search?: string } = {};
  if (search.trim()) params.search = search.trim();

  const { data: response, isLoading, error } = useFetchGifts(currentPage, pageSize, params);
  const deleteMutation = useDeleteGift();

  if (error) console.error('Error fetching gifts:', error);

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      } catch { return; }
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

  return (
    <>
      <title>{t('form.giftsIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t("tableNames.gift")}
        columns={giftColumns(
          { update: hasPermission('update', 'gift'), delete: hasPermission('delete', 'gift') },
          t, onDelete, deleteMutation.isPending, deletingId !== null, onDeleteConfirm, onDeleteCancel, deletingId, handleEdit
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
      />
    </>
  );
}
