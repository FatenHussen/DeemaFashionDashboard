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
import { AssignDriverScheduleFields } from '@/pages/dashboard/orders/components/AssignDriverScheduleFields';
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
import {
  isAsapDelivery,
  deliveryChoiceLabel,
  buildScheduledDeliveryAt,
  splitScheduledDeliveryAt,
  formatScheduledDeliveryAt,
} from '@/pages/dashboard/orders/utils/scheduled-delivery';

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

function Panel({
  title,
  extra,
  children,
}: {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <Typography variant="subtitle2" component="h2" className="text-foreground">
          {title}
        </Typography>
        {extra}
      </div>
      <div className="px-4 py-1">{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border/70 py-2.5 last:border-b-0">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end text-sm font-medium text-foreground">{value}</dd>
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

  const assignDriverForm = useForm<{
    driver_id: number;
    scheduled_date: string;
    scheduled_time: string;
  }>({
    defaultValues: { driver_id: 0, scheduled_date: '', scheduled_time: '' },
  });

  const {
    watch: watchDriverId,
    reset: resetDriverForm,
    setValue: setAssignDriverValue,
  } = assignDriverForm;
  const selectedDriverId = watchDriverId('driver_id');
  const scheduledDate = watchDriverId('scheduled_date');
  const scheduledTime = watchDriverId('scheduled_time');
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
    const parts = isAsapDelivery(order)
      ? splitScheduledDeliveryAt(order.scheduled_delivery_at)
      : { date: '', time: '' };
    resetDriverForm({
      driver_id: order.driver?.id ?? 0,
      scheduled_date: parts.date,
      scheduled_time: parts.time,
    });
  }, [
    order?.id,
    order?.driver?.id,
    order?.scheduled_delivery_at,
    order?.delivery_choice,
    order?.is_instant_delivery,
    resetDriverForm,
  ]);

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

  const handleAssignDriver = async (data: {
    driver_id: number;
    scheduled_date: string;
    scheduled_time: string;
  }) => {
    if (!canAssignDriver) return;
    const driverId = data.driver_id;
    if (!driverId || driverId === 0) return;

    const payload: { driver_id: number; scheduled_delivery_at?: string } = {
      driver_id: Number(driverId),
    };
    if (isAsapDelivery(order)) {
      const scheduled = buildScheduledDeliveryAt(data.scheduled_date, data.scheduled_time);
      if (scheduled === 'incomplete') {
        toast.error(t('orders.scheduledDeliveryIncomplete'));
        return;
      }
      if (scheduled) payload.scheduled_delivery_at = scheduled;
    }

    try {
      await assignDriverMutation.mutateAsync({
        id: order.id,
        data: payload,
        queryId: id,
      });
      toast.success(t('form.driverAssignedSuccess'));
      resetDriverForm({ driver_id: 0, scheduled_date: '', scheduled_time: '' });
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

  const copyOrderCode = async () => {
    try {
      await navigator.clipboard.writeText(order.order_code);
      toast.success(t('orders.orderCodeCopied'));
    } catch {
      return;
    }
  };

  const timelineSteps: { status: OrderStatus; at: string | null | undefined }[] = [
    { status: 'pending', at: order.timestamps?.pending_at },
    { status: 'preparing', at: order.timestamps?.preparing_at },
    { status: 'out_delivery', at: order.timestamps?.out_delivery_at },
    { status: 'delivered', at: order.timestamps?.delivered_at },
  ];
  if (order.timestamps?.returned_by_user_at || normalizedOrderStatus === 'returned_by_user') {
    timelineSteps.push({
      status: 'returned_by_user',
      at: order.timestamps?.returned_by_user_at,
    });
  }
  const terminalStatuses: OrderStatus[] = [
    'cancelled',
    'cancelled_by_admin',
    'rejected_by_delivery',
    'faild_deliver',
  ];
  if (terminalStatuses.includes(normalizedOrderStatus)) {
    timelineSteps.push({ status: normalizedOrderStatus, at: null });
  }

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

      <Box className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:pb-10">
        <Button
          variant="text"
          color="inherit"
          onClick={() => navigate('/orders')}
          className="-ms-2 mb-4 text-muted-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={18} className="me-1.5 rtl:rotate-180" />
          {t('orders.backToOrders')}
        </Button>

        <header className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <Typography variant="h3" component="h1" className="truncate tracking-tight">
                {order.order_code}
              </Typography>
              <button
                type="button"
                onClick={() => void copyOrderCode()}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label={t('orders.copyOrderCode')}
              >
                <Iconify icon="solar:copy-bold" width={16} />
              </button>
            </div>
            <Typography variant="body2" className="mt-1 text-muted-foreground">
              {formatDate(order.created_at)}
            </Typography>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={normalizedOrderStatus} label={statusLabel} />
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                  order.is_paid
                    ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {order.is_paid ? t('orders.isPaid') : t('orders.unpaid')}
              </span>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                {choiceLabel}
              </span>
            </div>
          </div>
          <div className="sm:text-end">
            <Typography variant="body2" className="text-muted-foreground">
              {t('orders.total')}
            </Typography>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {totalLabel}
            </p>
          </div>
        </header>

        {order.rejection_reason ? (
          <div className="mt-4 rounded-lg border border-rose-500/25 bg-rose-500/10 px-4 py-3">
            <Typography variant="caption" className="font-medium text-rose-700 dark:text-rose-300">
              {t('rejectionReason')}
            </Typography>
            <Typography variant="body2" className="mt-1 text-foreground">
              {order.rejection_reason}
            </Typography>
          </div>
        ) : null}

        <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-border rtl:lg:divide-x-reverse">
            <div className="p-4">
              <Typography variant="subtitle2" component="h2">
                {t('orders.changeOrderStatus')}
              </Typography>
              <Typography variant="caption" className="mt-1 block text-muted-foreground">
                {allowedNextStatuses.length === 0
                  ? t('orders.finalStatusNoChanges')
                  : t('orders.changeOrderStatusHint')}
              </Typography>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
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
                  className="shrink-0"
                >
                  {changeStatusMutation.isPending
                    ? t('orders.updatingStatus')
                    : t('orders.applyOrderStatus')}
                </Button>
              </div>
            </div>

            <div className="border-t border-border p-4 lg:border-t-0">
              <Typography variant="subtitle2" component="h2">
                {t('orders.assignDriver')}
              </Typography>
              {order.driver ? (
                <Typography variant="body2" className="mt-1 text-muted-foreground">
                  {t('orders.currentDriver')}{' '}
                  <span className="font-medium text-foreground">{order.driver.name}</span>
                  {order.driver.phone ? (
                    <>
                      {' '}
                      <a href={`tel:${order.driver.phone}`} className="hover:text-foreground">
                        {order.driver.phone}
                      </a>
                    </>
                  ) : null}
                </Typography>
              ) : null}
              {!canAssignDriver ? (
                <Typography variant="caption" className="mt-1 block text-muted-foreground">
                  {t('orders.assignDriverDisabledDeliveredOrOut')}
                </Typography>
              ) : null}
              <FormProvider {...assignDriverForm}>
                <form
                  onSubmit={assignDriverForm.handleSubmit(handleAssignDriver)}
                  className="mt-3 flex flex-col gap-3"
                >
                  {isAsapDelivery(order) ? (
                    <AssignDriverScheduleFields
                      date={scheduledDate}
                      time={scheduledTime}
                      disabled={!canAssignDriver || assignDriverMutation.isPending}
                      onDateChange={(value) => setAssignDriverValue('scheduled_date', value)}
                      onTimeChange={(value) => setAssignDriverValue('scheduled_time', value)}
                    />
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <RHFInfiniteSelect
                        name="driver_id"
                        queryKey={['order', 'assign-driver', id]}
                        fetcher={driverFetcher}
                        placeholder={t('form.selectDriver')}
                        initialLabel={order.driver?.name}
                        pageSize={10}
                        disabled={!canAssignDriver}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="contained"
                      className="shrink-0"
                      disabled={
                        !canAssignDriver ||
                        !selectedDriverId ||
                        selectedDriverId === 0 ||
                        assignDriverMutation.isPending
                      }
                    >
                      {t('orders.assign')}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        </section>

        {isTrackable && address?.lat != null && address?.lng != null ? (
          <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <Typography variant="subtitle2" component="h2">
                {t('orders.liveTracking')}
              </Typography>
              <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>
            <OrderTrackingMap
              destinationLat={Number(address.lat)}
              destinationLng={Number(address.lng)}
              destinationLabel={address.label}
              driverLocation={liveLocation}
              driverName={order.driver?.name}
              height="420px"
            />
          </section>
        ) : null}

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="order-2 min-w-0 space-y-5 lg:order-1">
            <Panel
              title={t('orders.orderItems')}
              extra={
                order.items?.length ? (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {t('orders.itemsCountBadge', { count: order.items.length })}
                  </span>
                ) : undefined
              }
            >
              <div className="space-y-3 py-3">
                {!order.items?.length ? (
                  <Typography variant="body2" className="py-8 text-center text-muted-foreground">
                    {t('orders.noOrderItems')}
                  </Typography>
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
              </div>
            </Panel>

            <Panel title={t('orders.pricing')}>
              <div className="py-2">
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
                  <MoneyLine
                    label={t('orders.couponDiscount')}
                    value={String(order.coupon_discount)}
                  />
                ) : null}
                {order.coupon_discount_from_points != null &&
                order.coupon_discount_from_points !== '0' &&
                order.coupon_discount_from_points !== '0.00' ? (
                  <MoneyLine
                    label={t('orders.couponDiscountFromPoints')}
                    value={String(order.coupon_discount_from_points)}
                  />
                ) : null}
                {order.free_delivery_from_points != null &&
                order.free_delivery_from_points !== 0 ? (
                  <MoneyLine
                    label={t('orders.freeDeliveryFromPoints')}
                    value={String(order.free_delivery_from_points)}
                  />
                ) : null}
                <MoneyLine label={t('orders.total')} value={totalLabel} emphasize />
              </div>
            </Panel>
          </div>

          <aside className="order-1 space-y-5 lg:order-2">
            <Panel title={t('orders.orderInformation')}>
              <dl>
                <Fact
                  label={t('orders.cartType')}
                  value={<span className="capitalize">{order.cart_type}</span>}
                />
                <Fact label={t('orders.deliveryChoice')} value={choiceLabel} />
                <Fact label={t('orders.totalQuantity')} value={order.total_quantity} />
                <Fact
                  label={t('orders.assignedBy')}
                  value={<span className="capitalize">{order.assigned_by || '—'}</span>}
                />
                <Fact label={t('orders.createdAt')} value={formatDate(order.created_at)} />
              </dl>
              <div className="border-t border-border py-3">
                {isAsapDelivery(order) && !scheduledLabel ? (
                  <Typography variant="body2" className="text-muted-foreground">
                    {t('orders.asapScheduleOnAssign')}
                  </Typography>
                ) : (
                  <ScheduledDeliveryForm
                    orderId={order.id}
                    queryId={id}
                    status={order.status}
                    scheduledDeliveryAt={order.scheduled_delivery_at}
                  />
                )}
              </div>
            </Panel>

            <Panel title={t('orders.customer')}>
              <div className="py-3">
                <Typography variant="subtitle1" className="font-semibold">
                  {order.user?.name || '—'}
                </Typography>
                <div className="mt-2 space-y-1">
                  {order.user?.phone ? (
                    <a
                      href={`tel:${order.user.phone}`}
                      className="block text-sm text-foreground hover:underline"
                    >
                      {order.user.phone}
                    </a>
                  ) : (
                    <Typography variant="body2" className="text-muted-foreground">
                      —
                    </Typography>
                  )}
                  {order.user?.email ? (
                    <a
                      href={`mailto:${order.user.email}`}
                      className="block truncate text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {order.user.email}
                    </a>
                  ) : null}
                </div>
              </div>
              <dl className="border-t border-border">
                <Fact label={t('orders.memberSince')} value={formatDate(order.user?.created_at)} />
                {order.user?.affiliate?.is_affiliate ? (
                  <Fact label={t('orders.affiliateId')} value={order.user.affiliate.affiliate_id} />
                ) : null}
              </dl>
            </Panel>

            {address ? (
              <Panel
                title={t('orders.deliveryAddress')}
                extra={
                  mapHref ? (
                    <a
                      href={mapHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {t('orders.openInMaps')}
                    </a>
                  ) : undefined
                }
              >
                <dl>
                  <Fact label={t('orders.label')} value={address.label || '—'} />
                  <Fact label={t('orders.area')} value={address.area || '—'} />
                  <Fact label={t('orders.streetName')} value={address.street_name || '—'} />
                  <Fact label={t('orders.buildingNumber')} value={address.building_number || '—'} />
                  <Fact label={t('orders.floorApartment')} value={address.floor_apartment || '—'} />
                  <Fact
                    label={t('orders.nearestLandmark')}
                    value={address.nearest_landmark || '—'}
                  />
                  <Fact
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
                </dl>
              </Panel>
            ) : null}

            {order.driver ? (
              <Panel title={t('orders.driver')}>
                <div className="flex items-center gap-3 py-3">
                  {driverPhoto ? (
                    <img src={driverPhoto} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                      {(order.driver.name || '?').slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <Typography variant="subtitle2" className="truncate">
                      {order.driver.name}
                    </Typography>
                    <a
                      href={`tel:${order.driver.phone}`}
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {order.driver.phone}
                    </a>
                  </div>
                </div>
                <dl className="border-t border-border">
                  <Fact
                    label={t('orders.status')}
                    value={<span className="capitalize">{order.driver.status}</span>}
                  />
                  <Fact label={t('orders.averageRating')} value={order.driver.average_rating} />
                  <Fact label={t('orders.totalOrders')} value={order.driver.total_orders} />
                  <Fact label={t('orders.completedOrders')} value={order.driver.completed_orders} />
                  <Fact label={t('orders.totalEarnings')} value={order.driver.total_earnings} />
                  <Fact label={t('orders.ratePerOrder')} value={order.driver.rate_per_order} />
                </dl>
              </Panel>
            ) : null}

            {order.affiliate ? (
              <Panel title={t('orders.affiliate')}>
                <dl>
                  <Fact label={t('orders.rate')} value={order.affiliate.affiliate_rate} />
                  <Fact label={t('orders.source')} value={order.affiliate.affiliate_source} />
                  <Fact
                    label={t('orders.commission')}
                    value={order.affiliate.affiliate_commission}
                  />
                  {order.affiliate.affiliate_commission_type ? (
                    <Fact
                      label={t('orders.affiliateCommissionType')}
                      value={order.affiliate.affiliate_commission_type}
                    />
                  ) : null}
                  {order.affiliate.affiliate_fixed_commission != null &&
                  order.affiliate.affiliate_fixed_commission !== '' ? (
                    <Fact
                      label={t('orders.affiliateFixedCommission')}
                      value={String(order.affiliate.affiliate_fixed_commission)}
                    />
                  ) : null}
                  {order.affiliate.affiliate_commission_amount != null ? (
                    <Fact
                      label={t('orders.affiliateCommissionAmount')}
                      value={order.affiliate.affiliate_commission_amount}
                    />
                  ) : null}
                </dl>
              </Panel>
            ) : null}

            <Panel title={t('orders.statusTimeline')}>
              <ol className="list-none py-3">
                {timelineSteps.map((step, index) => {
                  const done = Boolean(step.at);
                  const current = step.status === normalizedOrderStatus;
                  const last = index === timelineSteps.length - 1;
                  return (
                    <li key={step.status} className="flex gap-3">
                      <div className="flex w-4 shrink-0 flex-col items-center">
                        <span
                          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                            current
                              ? 'bg-primary ring-4 ring-primary/20'
                              : done
                                ? 'bg-primary'
                                : 'border border-border bg-background'
                          }`}
                        />
                        {!last ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
                      </div>
                      <div className={last ? 'min-w-0' : 'min-w-0 pb-4'}>
                        <Typography
                          variant="body2"
                          className={current ? 'font-semibold text-foreground' : 'font-medium'}
                        >
                          {getOrderStatusLabel(step.status, t)}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {formatDate(step.at)}
                        </Typography>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          </aside>
        </div>
      </Box>
    </>
  );
}
