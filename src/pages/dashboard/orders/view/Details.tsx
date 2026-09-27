import type { ReactNode } from 'react';
import type { OrderFormValues } from '@/columns/one/orders/one';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { formatMoneyLine } from '@/utils/format-currency';
import { _DriverApi } from '@/pages/dashboard/driver/api/driver.services';
import { joinOrderRoom, leaveOrderRoom, useOrderLocation } from '@/lib/socket';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import { RejectOrderModal } from '@/pages/dashboard/orders/components/RejectOrderModal';
import { OrderLineItemCard } from '@/pages/dashboard/orders/components/OrderLineItemCard';
import { ScheduledDeliveryForm } from '@/pages/dashboard/orders/components/ScheduledDeliveryForm';
import {
  deliveryChoiceLabel,
  formatScheduledDeliveryAt,
} from '@/pages/dashboard/orders/utils/scheduled-delivery';
import {
  useAssignDriver,
  useFetchOrderById,
  useChangeItemStatus,
  useChangeOrderStatus,
} from '@/pages/dashboard/orders/hooks/order';
import {
  type OrderStatus,
  parseOrderStatus,
  orderStatusBlocksAssignDriver,
  getAllowedOrderStatusTransitions,
} from '@/pages/dashboard/orders/types/order.types';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';

import OrderTrackingMap from '../components/OrderTrackingMap';

// ----------------------------------------------------------------------

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  waiting_approval: 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
  preparing: 'bg-blue-500/15 text-blue-800 dark:text-blue-300',
  out_delivery: 'bg-violet-500/15 text-violet-800 dark:text-violet-300',
  delivered: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  cancelled: 'bg-muted text-muted-foreground',
  cancelled_by_admin: 'bg-rose-500/15 text-rose-800 dark:text-rose-300',
  rejected_by_delivery: 'bg-orange-500/15 text-orange-800 dark:text-orange-300',
  faild_deliver: 'bg-orange-500/15 text-orange-800 dark:text-orange-300',
  returned_by_user: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300',
};

const ORDER_STATUS_I18N: Record<OrderStatus, string> = {
  pending: 'statusPending',
  waiting_approval: 'statusWaitingApproval',
  preparing: 'statusPreparing',
  out_delivery: 'statusOutDelivery',
  delivered: 'statusDelivered',
  cancelled: 'statusCancelled',
  cancelled_by_admin: 'statusCancelledByAdmin',
  rejected_by_delivery: 'statusRejectedByDelivery',
  faild_deliver: 'statusFaildDeliver',
  returned_by_user: 'statusReturnedByUser',
};

const fieldClassName =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50';

/** Prefer API `status_label`; never map unknown keys to pending for display. */
function getOrderStatusLabel(
  statusRaw: string | undefined | null,
  t: (key: string) => string,
  statusLabel?: string | null
): string {
  if (statusLabel?.trim()) return statusLabel.trim();
  const parsed = parseOrderStatus(statusRaw);
  if (parsed) return t(ORDER_STATUS_I18N[parsed]);
  if (statusRaw != null && String(statusRaw).trim() !== '') {
    return String(statusRaw).replace(/_/g, ' ');
  }
  return t('statusPending');
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = CONFIG.serverUrl?.replace(/\/$/, '') ?? '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : path;
}

const driverFetcher = (page: number, limit: number) =>
  _DriverApi.getListDrivers({ page, per_page: limit }).then((r) => ({
    data: {
      items: (r.data?.items ?? []).map((d: { id: number; name?: string; phone: string }) => ({
        id: d.id,
        label: d.name || d.phone,
      })),
      pagination: r.data?.pagination ?? {
        current_page: 1,
        last_page: 1,
        per_page: limit,
        total: 0,
      },
    },
  }));

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Fields({
  children,
  columns = 'sm:grid-cols-2 xl:grid-cols-4',
}: {
  children: ReactNode;
  columns?: string;
}) {
  return <div className={`grid grid-cols-1 gap-x-10 gap-y-5 ${columns}`}>{children}</div>;
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: OrderStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${statusColors[status] ?? 'bg-muted text-muted-foreground'}`}
    >
      {label}
    </span>
  );
}

function MoneyLine({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 ${emphasize ? 'mt-1 border-t border-border pt-3' : ''}`}
    >
      <span
        className={
          emphasize ? 'text-sm font-semibold text-foreground' : 'text-sm text-muted-foreground'
        }
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${emphasize ? 'text-lg font-semibold text-foreground' : 'text-sm font-medium text-foreground'}`}
      >
        {value}
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: orderResponse, isLoading, isError } = useFetchOrderById(id!);
  const changeStatusMutation = useChangeOrderStatus();
  const assignDriverMutation = useAssignDriver();
  const changeItemStatusMutation = useChangeItemStatus();

  const assignDriverForm = useForm<{ driver_id: number }>({
    defaultValues: { driver_id: 0 },
  });

  const { watch: watchDriverId, reset: resetDriverForm } = assignDriverForm;
  const selectedDriverId = watchDriverId('driver_id');
  const order = orderResponse?.data;

  const [statusDraft, setStatusDraft] = useState<OrderStatus>('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    if (!order) return;
    const parsed = parseOrderStatus(order.status);
    if (parsed) setStatusDraft(parsed);
  }, [order?.id, order?.status]);

  const isTrackable = order ? parseOrderStatus(order.status) === 'out_delivery' : false;
  const liveLocation = useOrderLocation(isTrackable ? (order?.id ?? null) : null);

  useEffect(() => {
    if (!isTrackable || !order?.id) return undefined;
    joinOrderRoom(order.id);
    return () => leaveOrderRoom(order.id);
  }, [isTrackable, order?.id]);

  useEffect(() => {
    if (!order) return;
    resetDriverForm({ driver_id: order.driver?.id ?? 0 });
  }, [order?.id, order?.driver?.id, resetDriverForm]);

  if (isLoading) {
    return (
      <Box className="flex min-h-[320px] items-center justify-center">
        <Box className="flex flex-col items-center gap-3">
          <Iconify icon="solar:refresh-bold" className="h-6 w-6 animate-spin text-primary" />
          <Typography variant="body2" className="text-muted-foreground">
            {t('orders.loadingOrderDetails')}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isError || !order) {
    return (
      <Box className="flex min-h-[320px] items-center justify-center">
        <Box className="w-full max-w-md rounded-xl border border-border bg-card p-6">
          <Typography variant="h6" className="text-foreground">
            {t('orders.orderNotFound')}
          </Typography>
          <Typography variant="body2" className="mb-4 mt-1 text-muted-foreground">
            {t('orders.failedToLoadOrderDetails')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/orders')}>
            {t('orders.backToOrders')}
          </Button>
        </Box>
      </Box>
    );
  }

  const parsedOrderStatus = parseOrderStatus(order.status);
  const normalizedOrderStatus = parsedOrderStatus ?? 'pending';
  const canAssignDriver =
    parsedOrderStatus != null && !orderStatusBlocksAssignDriver(parsedOrderStatus);
  const allowedNextStatuses =
    parsedOrderStatus != null ? getAllowedOrderStatusTransitions(parsedOrderStatus) : [];
  const statusSelectOptions: OrderStatus[] =
    parsedOrderStatus != null
      ? [parsedOrderStatus, ...allowedNextStatuses.filter((s) => s !== parsedOrderStatus)]
      : [];
  const statusLabel = getOrderStatusLabel(order.status, t, order.status_label);
  const choiceLabel = deliveryChoiceLabel(order, {
    asap: t('orders.deliveryChoiceAsap'),
    scheduled: t('orders.deliveryChoiceScheduled'),
  });
  const scheduledLabel = formatScheduledDeliveryAt(order.scheduled_delivery_at);
  const totalLabel = formatMoneyLine(order.total_formatted, order.total);
  const driverPhoto = resolveMediaUrl(order.driver?.image);

  const handleChangeStatus = async (status: OrderStatus) => {
    if (!parsedOrderStatus) return;
    const previous = parsedOrderStatus;
    try {
      await changeStatusMutation.mutateAsync({
        id: order.id,
        data: { status },
        queryId: id,
      });
      toast.success(t('statusChangedSuccess'));
    } catch {
      setStatusDraft(previous);
    }
  };

  const handleApplyOrderStatus = () => {
    if (!parsedOrderStatus) return;
    if (statusDraft === parsedOrderStatus) {
      toast.info(t('orders.sameOrderStatus'));
      return;
    }
    if (!allowedNextStatuses.includes(statusDraft)) {
      setStatusDraft(parsedOrderStatus);
      return;
    }
    if (statusDraft === 'cancelled_by_admin') {
      setRejectModalOpen(true);
      return;
    }
    void handleChangeStatus(statusDraft);
  };

  const handleAssignDriver = async (data: { driver_id: number }) => {
    if (!canAssignDriver) return;
    const driverId = data.driver_id;
    if (!driverId || driverId === 0) return;

    try {
      await assignDriverMutation.mutateAsync({
        id: order.id,
        data: { driver_id: Number(driverId) },
        queryId: id,
      });
      toast.success(t('form.driverAssignedSuccess'));
      resetDriverForm({ driver_id: 0 });
    } catch {
      return;
    }
  };

  const handleChangeItemStatus = async (itemId: number, status: OrderStatus) => {
    try {
      await changeItemStatusMutation.mutateAsync({
        itemId,
        data: { status },
        orderId: order.id,
        queryId: id,
      });
      toast.success(t('form.itemStatusUpdated'));
    } catch {
      return;
    }
  };

  const address = order.user_address;
  const mapHref =
    address?.lat != null && address?.lng != null
      ? `https://www.google.com/maps?q=${address.lat},${address.lng}`
      : null;

  return (
    <>
      <title>{t('form.orderDetailsDocumentTitle', { appName: CONFIG.appName })}</title>

      <RejectOrderModal
        open={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setStatusDraft(normalizedOrderStatus);
        }}
        order={order as unknown as OrderFormValues}
        t={t}
        queryId={id}
      />

      <Box className="w-full px-4 py-2 sm:px-6 lg:px-8">
        <section className="border-b border-border py-6">
          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate('/orders')}
            className="-ms-2 mb-3 text-muted-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={18} className="me-1.5 rtl:rotate-180" />
            {t('orders.backToOrders')}
          </Button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-foreground">{order.order_code}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={normalizedOrderStatus} label={statusLabel} />
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-xs text-muted-foreground">{t('orders.total')}</div>
                <div className="text-lg font-semibold tabular-nums text-foreground">
                  {totalLabel}
                </div>
              </div>
            </div>
          </div>
          {order.rejection_reason ? (
            <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-foreground">
              <span className="font-medium text-rose-700 dark:text-rose-300">
                {t('rejectionReason')}:{' '}
              </span>
              {order.rejection_reason}
            </p>
          ) : null}
        </section>

        <section className="grid gap-10 border-b border-border py-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              {t('orders.changeOrderStatus')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {allowedNextStatuses.length === 0
                ? t('orders.finalStatusNoChanges')
                : t('orders.changeOrderStatusHint')}
            </p>
            <div className="mt-4 space-y-3">
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
                disabled={
                  changeStatusMutation.isPending ||
                  !parsedOrderStatus ||
                  allowedNextStatuses.length === 0
                }
                aria-label={t('orders.selectOrderStatus')}
                className={fieldClassName}
              >
                {statusSelectOptions.map((s) => (
                  <option key={s} value={s}>
                    {getOrderStatusLabel(s, t)}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="contained"
                onClick={handleApplyOrderStatus}
                disabled={
                  changeStatusMutation.isPending ||
                  !parsedOrderStatus ||
                  statusDraft === parsedOrderStatus ||
                  allowedNextStatuses.length === 0
                }
              >
                {changeStatusMutation.isPending
                  ? t('orders.updatingStatus')
                  : t('orders.applyOrderStatus')}
              </Button>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              {t('orders.assignDriver')}
            </h2>
            {order.driver ? (
              <p className="text-sm text-muted-foreground">
                {t('orders.currentDriver')}{' '}
                <span className="font-medium text-foreground">{order.driver.name}</span>
                {order.driver.phone ? (
                  <>
                    {' '}
                    <a href={`tel:${order.driver.phone}`} className="hover:underline">
                      {order.driver.phone}
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
            {!canAssignDriver ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t('orders.assignDriverDisabledDeliveredOrOut')}
              </p>
            ) : null}
            <FormProvider {...assignDriverForm}>
              <form
                onSubmit={assignDriverForm.handleSubmit(handleAssignDriver)}
                className="mt-4 space-y-3"
              >
                <RHFInfiniteSelect
                  name="driver_id"
                  queryKey={['order', 'assign-driver', id]}
                  fetcher={driverFetcher}
                  placeholder={t('form.selectDriver')}
                  initialLabel={order.driver?.name}
                  pageSize={10}
                  disabled={!canAssignDriver}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    !canAssignDriver ||
                    !selectedDriverId ||
                    selectedDriverId === 0 ||
                    assignDriverMutation.isPending
                  }
                >
                  {t('orders.assign')}
                </Button>
              </form>
            </FormProvider>
          </div>
        </section>

        <Section title={t('orders.scheduledDelivery')}>
          {order.driver ? (
            <ScheduledDeliveryForm
              orderId={order.id}
              queryId={id}
              status={order.status}
              scheduledDeliveryAt={order.scheduled_delivery_at}
            />
          ) : (
            <div className="space-y-1">
              {scheduledLabel ? (
                <p className="text-sm font-medium tabular-nums text-foreground">{scheduledLabel}</p>
              ) : null}
              <p className="text-sm text-muted-foreground">{t('orders.asapScheduleOnAssign')}</p>
            </div>
          )}
        </Section>

        <Section title={t('orders.orderInformation')}>
          <Fields>
            <Field label={t('orders.orderCode')} value={order.order_code} />
            <Field
              label={t('orders.cartType')}
              value={<span className="capitalize">{order.cart_type}</span>}
            />
            <Field label={t('orders.deliveryChoice')} value={choiceLabel} />
            <Field
              label={t('orders.isPaid')}
              value={order.is_paid ? t('common.yes') : t('common.no')}
            />
            <Field label={t('orders.totalQuantity')} value={order.total_quantity} />
            <Field label={t('orders.assignedBy')} value={order.assigned_by || '—'} />
            <Field label={t('orders.createdAt')} value={formatDate(order.created_at)} />
          </Fields>
        </Section>

        <Section title={t('orders.customer')}>
          <Fields>
            <Field label={t('orders.name')} value={order.user?.name || '—'} />
            <Field
              label={t('orders.phone')}
              value={
                order.user?.phone ? (
                  <a href={`tel:${order.user.phone}`} className="hover:underline">
                    {order.user.phone}
                  </a>
                ) : (
                  '—'
                )
              }
            />
            <Field
              label={t('orders.email')}
              value={
                order.user?.email ? (
                  <a href={`mailto:${order.user.email}`} className="hover:underline">
                    {order.user.email}
                  </a>
                ) : (
                  '—'
                )
              }
            />
            <Field label={t('orders.memberSince')} value={formatDate(order.user?.created_at)} />
            {order.user?.affiliate?.is_affiliate ? (
              <Field label={t('orders.affiliateId')} value={order.user.affiliate.affiliate_id} />
            ) : null}
          </Fields>
        </Section>

        {address ? (
          <Section
            title={t('orders.deliveryAddress')}
            action={
              mapHref ? (
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t('orders.openInMaps')}
                </a>
              ) : undefined
            }
          >
            <Fields columns="sm:grid-cols-2 lg:grid-cols-3">
              <Field label={t('orders.label')} value={address.label || '—'} />
              <Field label={t('orders.area')} value={address.area || '—'} />
              <Field label={t('orders.streetName')} value={address.street_name || '—'} />
              <Field label={t('orders.buildingNumber')} value={address.building_number || '—'} />
              <Field label={t('orders.floorApartment')} value={address.floor_apartment || '—'} />
              <Field label={t('orders.nearestLandmark')} value={address.nearest_landmark || '—'} />
              <Field
                label={t('orders.contactPhone')}
                value={
                  address.contact_phone ? (
                    <a href={`tel:${address.contact_phone}`} className="hover:underline">
                      {address.contact_phone}
                    </a>
                  ) : (
                    '—'
                  )
                }
              />
            </Fields>
          </Section>
        ) : null}

        {isTrackable && address?.lat != null && address?.lng != null ? (
          <Section title={t('orders.liveTracking')}>
            <OrderTrackingMap
              destinationLat={Number(address.lat)}
              destinationLng={Number(address.lng)}
              destinationLabel={address.label}
              driverLocation={liveLocation}
              driverName={order.driver?.name}
              height="420px"
            />
          </Section>
        ) : null}

        <Section
          title={t('orders.orderItems')}
          action={
            order.items?.length ? (
              <span className="text-xs text-muted-foreground">
                {t('orders.itemsCountBadge', { count: order.items.length })}
              </span>
            ) : undefined
          }
        >
          {!order.items?.length ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              {t('orders.noOrderItems')}
            </p>
          ) : (
            order.items.map((item, index) => (
              <OrderLineItemCard
                key={item.id}
                item={item}
                index={index}
                t={t}
                statusTone={statusColors}
                getStatusLabel={(s) => getOrderStatusLabel(s, t, undefined)}
                onItemStatusChange={handleChangeItemStatus}
                itemStatusPending={changeItemStatusMutation.isPending}
              />
            ))
          )}
        </Section>

        <Section title={t('orders.pricing')}>
          <MoneyLine
            label={t('orders.subtotal')}
            value={formatMoneyLine(order.subtotal_formatted, order.subtotal)}
          />
          <MoneyLine
            label={t('orders.deliveryPrice')}
            value={formatMoneyLine(order.delivery_price_formatted, order.delivery_price)}
          />
          {order.total_with_delivery != null &&
          Number(order.total_with_delivery) !== Number(order.total) ? (
            <MoneyLine
              label={t('orders.totalWithDelivery')}
              value={formatMoneyLine(order.total_formatted, order.total_with_delivery)}
            />
          ) : null}
          <MoneyLine
            label={t('orders.basketDiscount')}
            value={formatMoneyLine(order.basket_discount_formatted, order.basket_discount)}
          />
          {order.coupon_discount != null && order.coupon_discount !== 0 ? (
            <MoneyLine label={t('orders.couponDiscount')} value={String(order.coupon_discount)} />
          ) : null}
          {order.coupon_discount_from_points != null &&
          order.coupon_discount_from_points !== '0' &&
          order.coupon_discount_from_points !== '0.00' ? (
            <MoneyLine
              label={t('orders.couponDiscountFromPoints')}
              value={String(order.coupon_discount_from_points)}
            />
          ) : null}
          {order.free_delivery_from_points != null && order.free_delivery_from_points !== 0 ? (
            <MoneyLine
              label={t('orders.freeDeliveryFromPoints')}
              value={String(order.free_delivery_from_points)}
            />
          ) : null}
          <MoneyLine label={t('orders.total')} value={totalLabel} emphasize />
        </Section>

        <Section title={t('orders.statusTimeline')}>
          <Fields>
            <Field label={t('orders.pendingAt')} value={formatDate(order.timestamps?.pending_at)} />
            <Field
              label={t('orders.preparingAt')}
              value={formatDate(order.timestamps?.preparing_at)}
            />
            <Field
              label={t('orders.outForDeliveryAt')}
              value={formatDate(order.timestamps?.out_delivery_at)}
            />
            <Field
              label={t('orders.deliveredAt')}
              value={formatDate(order.timestamps?.delivered_at)}
            />
            <Field
              label={t('orders.returnedByUserAt')}
              value={formatDate(order.timestamps?.returned_by_user_at)}
            />
          </Fields>
        </Section>

        {order.affiliate || order.driver ? (
          <>
            {order.affiliate ? (
              <Section title={t('orders.affiliate')}>
                <Fields>
                  <Field label={t('orders.rate')} value={order.affiliate.affiliate_rate} />
                  <Field label={t('orders.source')} value={order.affiliate.affiliate_source} />
                  <Field
                    label={t('orders.commission')}
                    value={order.affiliate.affiliate_commission}
                  />
                  {order.affiliate.affiliate_commission_type ? (
                    <Field
                      label={t('orders.affiliateCommissionType')}
                      value={order.affiliate.affiliate_commission_type}
                    />
                  ) : null}
                  {order.affiliate.affiliate_fixed_commission != null &&
                  order.affiliate.affiliate_fixed_commission !== '' ? (
                    <Field
                      label={t('orders.affiliateFixedCommission')}
                      value={String(order.affiliate.affiliate_fixed_commission)}
                    />
                  ) : null}
                  {order.affiliate.affiliate_commission_amount != null ? (
                    <Field
                      label={t('orders.affiliateCommissionAmount')}
                      value={order.affiliate.affiliate_commission_amount}
                    />
                  ) : null}
                </Fields>
              </Section>
            ) : null}

            {order.driver ? (
              <Section title={t('orders.driver')}>
                <div className="mb-4 flex items-center gap-3">
                  {driverPhoto ? (
                    <img src={driverPhoto} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {(order.driver.name || '?').slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{order.driver.name}</div>
                    <a
                      href={`tel:${order.driver.phone}`}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      {order.driver.phone}
                    </a>
                  </div>
                </div>
                <Fields>
                  <Field
                    label={t('orders.status')}
                    value={<span className="capitalize">{order.driver.status}</span>}
                  />
                  <Field label={t('orders.averageRating')} value={order.driver.average_rating} />
                  <Field label={t('orders.totalOrders')} value={order.driver.total_orders} />
                  <Field
                    label={t('orders.completedOrders')}
                    value={order.driver.completed_orders}
                  />
                  <Field label={t('orders.totalEarnings')} value={order.driver.total_earnings} />
                  <Field label={t('orders.ratePerOrder')} value={order.driver.rate_per_order} />
                </Fields>
              </Section>
            ) : null}
          </>
        ) : null}
      </Box>
    </>
  );
}
