import type { PromotionListItem } from '@/pages/dashboard/promotions/types/promotion.types';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { promotionColumns } from '@/columns/one/promotions/one';
import { useFetchPromotions, useDeletePromotion } from '@/pages/dashboard/promotions/hooks/promotion';

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

  const { data: response, isLoading } = useFetchPromotions(
    currentPage,
    pageSize,
    search.trim() || undefined
  );
  const deleteMutation = useDeletePromotion();

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

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

  const handleEdit = (row: { original: PromotionListItem }) => {
    navigate(`/promotions/update/${row.original.id}`);
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

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{t('form.promotionsIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t("tableNames.promotion")}
        columns={promotionColumns(
          { update: hasPermission('update', 'promotion'), delete: hasPermission('delete', 'promotion') },
          t, onDelete, deleteMutation.isPending, deletingId !== null,
          onDeleteConfirm, onDeleteCancel, deletingId, handleEdit
        )}
        data={items}
        createPath="/promotions/create"
        hasDetails
        detailsLink="/promotions"
        permissions={{
          create: hasPermission('create', 'promotion'),
          update: hasPermission('update', 'promotion'),
          delete: hasPermission('delete', 'promotion'),
        }}
        isLoading={isLoading}
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
