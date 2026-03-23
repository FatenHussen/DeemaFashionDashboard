import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
// import type { BannerItem } from '@/pages/dashboard/banners/types/banner.types';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { bannerColumns, type BannerFormValues } from '@/columns/one/banners/one';
import { useFetchBanners, useDeleteBanner } from '@/pages/dashboard/banners/hooks/banner';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Banners | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: bannersResponse, isLoading, error } = useFetchBanners(currentPage, pageSize);
  const deleteBannerMutation = useDeleteBanner();

  if (error) {
    console.error('Error fetching banners:', error);
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
        await deleteBannerMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Banner deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const handleEdit = (row: { original: BannerFormValues }) => {
    navigate(`/sections/banners/update/${row.original.id}`, {
      state: { banner: row.original },
    });
  };

  const rawItems = bannersResponse?.data?.items ?? [];
  const bannerData: BannerFormValues[] = rawItems.map((item) => {
    const desc = item.description;
    const descriptionStr =
      typeof desc === 'string'
        ? desc
        : desc && typeof desc === 'object' && 'en' in desc
          ? ((desc as { en?: string }).en ?? '')
          : '';
    return {
      ...item,
      description: descriptionStr,
    } as BannerFormValues;
  });
  const apiPagination = bannersResponse?.data?.pagination;
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
      <title>{metadata.title}</title>

      <DataTable
        tableName={t("tableNames.banner")}
        columns={bannerColumns(
          {
            update: hasPermission('update', 'banner'),
            delete: hasPermission('delete', 'banner'),
          },
          t,
          onDelete,
          deleteBannerMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          handleEdit
        )}
        data={bannerData}
        createPath="/sections/banners/create"
        hasDetails={false}
        permissions={{
          create: hasPermission('create', 'banner'),
          update: hasPermission('update', 'banner'),
          delete: hasPermission('delete', 'banner'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          image_url: 'Image',
          title: 'Title',
          description: 'Description',
          link: 'Link',
          created_at: 'Created At',
          actions: 'Actions',
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
