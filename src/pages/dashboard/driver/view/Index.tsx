import type { DriverAvailabilityKey } from '@/shared/utils/driver-status-badge';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { useMemo, useState, type ReactNode } from 'react';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { driverColumns, type DriverFormValues } from '@/columns/one/driver/one';
import { UpdatePasswordDialog } from '@/shared/components/update-password-dialog';
import { normalizeDriverAvailabilityStatus } from '@/shared/utils/driver-status-badge';
import { DriverStatusActiveModal } from '@/pages/dashboard/driver/components/DriverStatusActiveModal';
import { DriverAssignOrderModal } from '@/pages/dashboard/driver/components/driver-assign-order-modal';
import { useFetchDrivers, useDeleteDriver, useUpdateDriver, useFetchDriverById } from '@/pages/dashboard/driver/hooks/driver';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const DRIVER_STATUS_FILTERS: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: 'all', icon: 'solar:list-bold' },
  { key: 'available', label: 'driverAvailAvailable', icon: 'solar:check-circle-bold' },
  { key: 'busy', label: 'driverAvailBusy', icon: 'solar:play-circle-bold' },
  { key: 'inactive', label: 'driverAvailInactive', icon: 'solar:moon-sleep-bold' },
];

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordDialogTargetId, setPasswordDialogTargetId] = useState<number | null>(null);
  const [statusModalRow, setStatusModalRow] = useState<DriverFormValues | null>(null);
  const [chosenStatus, setChosenStatus] = useState<DriverAvailabilityKey>('available');
  const [chosenActive, setChosenActive] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [assignOrderRow, setAssignOrderRow] = useState<DriverFormValues | null>(null);

  const listFilters = useMemo(() => {
    const f: { status?: string; is_active?: number } = {};
    if (statusFilter) f.status = statusFilter;
    if (isActiveFilter !== '') f.is_active = parseInt(isActiveFilter, 10);
    return Object.keys(f).length ? f : undefined;
  }, [statusFilter, isActiveFilter]);

  const { data: driversResponse, isLoading, error } = useFetchDrivers(currentPage, pageSize, listFilters);
  const { data: driverDetailsResponse } = useFetchDriverById(passwordDialogTargetId ?? '');
  const { data: statusModalDetailsResponse, isLoading: statusModalDetailsLoading } = useFetchDriverById(
    statusModalRow?.id ?? ''
  );
  const deleteDriverMutation = useDeleteDriver();
  const updateDriverMutation = useUpdateDriver();

  // Log error for debugging
  if (error) {
    console.error('Error fetching drivers:', error);
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
        await deleteDriverMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Driver deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };

  const onDeleteCancel = () => {
    setDeletingId(null);
  };

  const onUpdatePassword = (row: { original: DriverFormValues }) => {
    setPasswordDialogTargetId(row.original.id);
    setPasswordDialogOpen(true);
  };

  const openStatusModal = (row: DriverFormValues) => {
    setStatusModalRow(row);
    setChosenStatus(normalizeDriverAvailabilityStatus(String(row.status)));
    setChosenActive(Boolean(row.is_active));
  };

  const closeStatusModal = () => {
    if (updateDriverMutation.isPending) return;
    setStatusModalRow(null);
  };

  const statusModalDetails = statusModalDetailsResponse?.data;
  const statusModalDetailsReady = Boolean(statusModalDetails);
  const statusModalHasChanges =
    !!statusModalRow &&
    (chosenStatus !== normalizeDriverAvailabilityStatus(String(statusModalRow.status)) ||
      chosenActive !== Boolean(statusModalRow.is_active));

  const handleApplyStatusModal = async () => {
    if (!statusModalRow || !statusModalDetails) return;
    const d = statusModalDetails;
    const cityIds = d.cities?.map((c: { id: number }) => ({ id: c.id })) ?? [];
    try {
      await updateDriverMutation.mutateAsync({
        id: statusModalRow.id,
        data: {
          name: d.name ?? '',
          phone: d.phone,
          address: d.address,
          city_ids: cityIds.length > 0 ? cityIds : [{ id: 0 }],
          rate_per_order: d.rate_per_order,
          vehicle_name: d.vehicle_name ?? '',
          vehicle_type: d.vehicle_type ?? '',
          vehicle_number: d.vehicle_number ?? '',
          status: chosenStatus,
          is_active: chosenActive ? 1 : 0,
        },
      });
      toast.success(t('form.driverUpdatedSuccess'));
      setStatusModalRow(null);
    } catch {
      /* global error handler */
    }
  };

  const handlePasswordSubmit = async (data: { password: string; password_confirmation: string }) => {
    if (!passwordDialogTargetId) return;
    const driver = driverDetailsResponse?.data ?? driverData.find((d) => d.id === passwordDialogTargetId);
    const cityIds = (driver as any)?.cities?.map((c: { id: number }) => ({ id: c.id })) ?? [];
    await updateDriverMutation.mutateAsync({
      id: passwordDialogTargetId,
      data: {
        name: driver?.name ?? '',
        phone: driver?.phone ?? '',
        address: driver?.address ?? '',
        city_ids: cityIds.length > 0 ? cityIds : [{ id: 0 }],
        rate_per_order: driver?.rate_per_order,
        vehicle_name: driver?.vehicle_name ?? '',
        vehicle_type: driver?.vehicle_type ?? '',
        vehicle_number: driver?.vehicle_number ?? '',
        password: data.password,
        password_confirmation: data.password_confirmation,
      } as any,
    });
    toast.success(t('passwordUpdatedSuccess'));
    setPasswordDialogTargetId(null);
    setPasswordDialogOpen(false);
  };

  // Extract data from API response
  const driverData: DriverFormValues[] = driversResponse?.data?.items || [];
  const apiPagination = driversResponse?.data?.pagination;
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
  const canUpdateDriver = hasPermission('update', 'driver');
  const canAssignOrderToDriver = can('order.update');

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (isActiveFilter !== '' ? 1 : 0);

  const sidebarContent = (
    <div className="flex flex-col gap-5">
      <FilterGroup label={t('columns.status')}>
        <div className="flex flex-col gap-2">
          {DRIVER_STATUS_FILTERS.map(({ key, label, icon }) => {
            const active = (key === 'all' && !statusFilter) || statusFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setStatusFilter(key === 'all' ? '' : key);
                  setCurrentPage(1);
                }}
                className={`inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'border-primary/30 bg-primary text-primary-foreground shadow-sm'
                    : 'border-border/60 bg-background text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground'
                }`}
              >
                <Iconify icon={icon} width={16} height={16} className="shrink-0" />
                <span>{t(label)}</span>
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label={t('columns.active')}>
        <select
          value={isActiveFilter}
          onChange={(e) => {
            setIsActiveFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('all')}</option>
          <option value="1">{t('yes')}</option>
          <option value="0">{t('no')}</option>
        </select>
      </FilterGroup>
    </div>
  );

  return (
    <>
      <title>{t('form.driversIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      <UpdatePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
        isSubmitting={updateDriverMutation.isPending}
        entityName={t('tableNames.driver')}
        minLength={8}
      />

      {assignOrderRow ? (
        <DriverAssignOrderModal
          open
          onClose={() => setAssignOrderRow(null)}
          driverId={assignOrderRow.id}
          driverLabel={assignOrderRow.name || assignOrderRow.phone}
          t={t}
        />
      ) : null}

      <DriverStatusActiveModal
        open={statusModalRow !== null}
        onClose={closeStatusModal}
        driverName={statusModalRow?.name}
        driverPhone={statusModalRow?.phone}
        chosenStatus={chosenStatus}
        onChosenStatus={setChosenStatus}
        chosenActive={chosenActive}
        onChosenActive={setChosenActive}
        onApply={handleApplyStatusModal}
        isBusy={updateDriverMutation.isPending}
        isDetailsLoading={Boolean(statusModalRow && statusModalDetailsLoading && !statusModalDetails)}
        canSave={statusModalHasChanges && statusModalDetailsReady}
        t={t}
      />

      <DataTable
        tableName={t("tableNames.driver")}
        filterSidebar={sidebarContent}
        activeFilterCount={activeFilterCount}
        onFilterReset={() => {
          setStatusFilter('');
          setIsActiveFilter('');
          setCurrentPage(1);
        }}
        columns={driverColumns(
          {
            update: canUpdateDriver,
            delete: hasPermission('delete', 'driver'),
          },
          t,
          onDelete,
          deleteDriverMutation.isPending,
          deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          onUpdatePassword,
          canUpdateDriver ? openStatusModal : undefined,
          canAssignOrderToDriver ? (row) => setAssignOrderRow(row) : undefined
        )}
        data={driverData}
        createPath="/driver/create"
        hasDetails
        rowClickToDetails
        detailsLink={`${paths.dashboard.driver}/details`}
        permissions={{
          create: hasPermission('create', 'driver'),
          update: hasPermission('update', 'driver'),
          delete: hasPermission('delete', 'driver'),
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          name: t('columns.name'),
          phone: t('columns.phone'),
          address: t('columns.address'),
          vehicle_name: t('columns.vehicleName'),
          vehicle_type: t('columns.vehicleType'),
          status: t('columns.status'),
          is_active: t('columns.active'),
          rate_per_order: t('columns.ratePerOrder'),
          average_rating: t('columns.avgRating'),
          total_orders: t('columns.totalOrders'),
          completed_orders: t('columns.completed'),
          total_earnings: t('columns.totalEarnings'),
          created_at: t('columns.createdAt'),
          actions: t('columns.action'),
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

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
