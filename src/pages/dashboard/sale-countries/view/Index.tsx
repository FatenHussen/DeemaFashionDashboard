import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, type ReactNode } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { saleCountryColumns } from '@/columns/one/sale-countries/one';
import {
  useDeleteSaleCountry,
  useFetchSaleCountries,
} from '@/pages/dashboard/sale-countries/hooks/sale-country';

import { CONFIG } from 'src/global-config';

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: response, isLoading } = useFetchSaleCountries(
    currentPage,
    pageSize,
    activeFilter === '' ? undefined : activeFilter,
    search.trim() || undefined
  );
  const deleteMutation = useDeleteSaleCountry();

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

  const handleEdit = (row: { original: { id: number } }) => {
    navigate(`/sale-countries/update/${row.original.id}`);
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
  const saleCountryCan = (action: 'create' | 'update' | 'delete') =>
    canAny([`salecountry.${action}`, `SaleCountry.${action}`]);

  const sidebarContent = (
    <FilterGroup label={t('form.saleCountryStatusFilter')}>
      <select
        className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
        value={activeFilter}
        onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(1); }}
      >
        <option value="">{t('form.saleCountryStatusAll')}</option>
        <option value="1">{t('active')}</option>
        <option value="0">{t('inactive')}</option>
      </select>
    </FilterGroup>
  );

  return (
    <>
      <title>{t('form.saleCountriesIndexDocumentTitle', { appName: CONFIG.appName })}</title>
      <DataTable
        tableName={t('tableNames.saleCountry')}
        columns={saleCountryColumns(
          {
            update: saleCountryCan('update'),
            delete: saleCountryCan('delete'),
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
        createPath="/sale-countries/create"
        hasDetails
        detailsLink="/sale-countries/update"
        filterSidebar={sidebarContent}
        activeFilterCount={activeFilter !== '' ? 1 : 0}
        onFilterReset={() => { setActiveFilter(''); setCurrentPage(1); }}
        permissions={{
          create: saleCountryCan('create'),
          update: saleCountryCan('update'),
          delete: saleCountryCan('delete'),
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

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
