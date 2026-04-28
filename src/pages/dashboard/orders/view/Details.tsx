import type { ReactNode } from 'react';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { _DriverApi } from '@/pages/dashboard/driver/api/driver.services';
import { joinOrderRoom, leaveOrderRoom, useOrderLocation } from '@/lib/socket';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import {
  useAssignDriver,
  useFetchOrderById,
  useChangeItemStatus,
  useChangeOrderStatus,
} from '@/pages/dashboard/orders/hooks/order';
import {
  type OrderStatus,
  normalizeOrderStatus,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_PIPELINE,
} from '@/pages/dashboard/orders/types/order.types';

import { toDisplayString } from 'src/utils/to-display-string';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';

import OrderTrackingMap from '../components/OrderTrackingMap';

// ----------------------------------------------------------------------

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600',
  preparing: 'bg-blue-500/20 text-blue-600',
  out_delivery: 'bg-purple-500/20 text-purple-600',
  delivered: 'bg-green-500/20 text-green-600',
  cancelled: 'bg-muted text-muted-foreground',
};

function getOrderStatusLabel(statusRaw: string, t: (key: string) => string): string {
  const status = normalizeOrderStatus(statusRaw);
  const labels: Record<OrderStatus, string> = {
    pending: t('statusPending'),
    preparing: t('statusPreparing'),
    out_delivery: t('statusOutDelivery'),
    delivered: t('statusDelivered'),
    cancelled: t('statusCancelled'),
  };
  return labels[status] ?? status.replace(/_/g, ' ');
}

/** Next order-level statuses: forward steps, or full pipeline when cancelled (admin can reopen). */
function getNextStatuses(currentRaw: string): OrderStatus[] {
  const current = normalizeOrderStatus(currentRaw);
  if (current === 'delivered') return [];
  if (current === 'cancelled') {
    return [...ORDER_STATUS_PIPELINE];
  }
  const idx = ORDER_STATUS_PIPELINE.indexOf(current);
  if (idx === -1) return [];
  return ORDER_STATUS_PIPELINE.slice(idx + 1);
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

const driverFetcher = (page: number, limit: number) =>
  _DriverApi.getListDrivers({ page, per_page: limit }).then((r) => ({
    data: {
      items: (r.data?.items ?? []).map((d: { id: number; name?: string; phone: string }) => ({
        id: d.id,
        label: d.name || d.phone,
      })),
      pagination:
        r.data?.pagination ?? { current_page: 1, last_page: 1, per_page: limit, total: 0 },
    },
  }));

type OrderSectionProps = {
  title: string;
  children: ReactNode;
  icon?: string;
  className?: string;
  headerRight?: ReactNode;
};

function OrderSection({ title, children, icon, className, headerRight }: OrderSectionProps) {
  return (
    <Box
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm ${className ?? ''}`}
    >
      <Box className="flex items-center justify-between gap-3 border-b border-border/40 bg-muted/15 px-4 py-3.5 sm:px-5">
        <Box className="flex min-w-0 items-center gap-3">
          {icon && (
            <Box className="flex-shrink-0 rounded-lg border border-primary/10 bg-primary/10 p-2">
              <Iconify icon={icon} className="text-primary" width={20} />
            </Box>
          )}
          <Typography variant="subtitle1" className="truncate font-semibold">
            {title}
          </Typography>
        </Box>
        {headerRight}
      </Box>
      <Box className="flex-1 p-4 sm:p-5 md:p-6">{children}</Box>
    </Box>
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

  const { watch: watchDriverId, reset: resetDriverForm, setValue: setDriverId } = assignDriverForm;
  const selectedDriverId = watchDriverId('driver_id');
  const order = orderResponse?.data;

  // Live order tracking via socket
  const isTrackable = order?.status === 'out_delivery';
  const liveLocation = useOrderLocation(isTrackable ? order?.id ?? null : null);

  useEffect(() => {
    if (!isTrackable || !order?.id) return undefined;
    joinOrderRoom(order.id);
    return () => leaveOrderRoom(order.id);
  }, [isTrackable, order?.id]);

  useEffect(() => {
    if (order?.driver?.id) {
      setDriverId('driver_id', order.driver.id);
    }
  }, [order?.driver?.id, setDriverId]);

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="flex flex-col items-center gap-3">
          <Iconify icon="solar:refresh-bold" className="w-8 h-8 text-primary animate-spin" />
          <Typography variant="body2" className="text-muted-foreground">
            {t('orders.loadingOrderDetails')}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isError || !order) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('orders.orderNotFound')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {t('orders.failedToLoadOrderDetails')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/orders')}>
            {t('orders.backToOrders')}
          </Button>
        </Box>
      </Box>
    );
  }

  const normalizedOrderStatus = normalizeOrderStatus(order.status);
  const canAssignDriver =
    normalizedOrderStatus !== 'delivered' && normalizedOrderStatus !== 'out_delivery';

  const handleChangeStatus = async (status: OrderStatus) => {
    try {
      await changeStatusMutation.mutateAsync({
        id: order.id,
        data: { status },
        queryId: id,
      });
      toast.success(t('statusChangedSuccess'));
    } catch { return; }
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
    } catch { return; }
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
    } catch { return; }
  };

  return (
    <>
      <title>{t('form.orderDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

        <Box className="relative mx-auto w-full max-w-7xl">
          {/* Header */}
          <Box className="mb-6 lg:mb-8">
            <Button
              variant="text"
              onClick={() => navigate('/orders')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              {t('orders.backToOrders')}
            </Button>

            <Box className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <Box className="flex items-center gap-4">
                <Box className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 sm:h-16 sm:w-16">
                  <Iconify icon="solar:bag-bold" className="text-primary" width={28} height={28} />
                </Box>
                <Box className="min-w-0">
                  <Typography
                    variant="overline"
                    className="mb-0.5 block text-muted-foreground"
                  >
                    {t('orders.orderOverview')}
                  </Typography>
                  <Typography variant="h4" className="mb-1 font-bold text-foreground">
                    {order.order_code}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground">
                    {formatDate(order.created_at)}
                  </Typography>
                </Box>
              </Box>
              <span
                className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-medium capitalize ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}
              >
                {getOrderStatusLabel(order.status, t)}
              </span>
            </Box>
          </Box>

          {/* Actions: status + driver */}
          <Box className="mb-4 grid gap-4 lg:mb-5 lg:grid-cols-2 lg:gap-5">
            <OrderSection title={t('orders.changeOrderStatus')} icon="solar:transfer-horizontal-bold">
              <Box className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}
                >
                  {getOrderStatusLabel(order.status, t)}
                </span>
                {getNextStatuses(order.status).length > 0 ? (
                  <>
                    <Iconify icon="solar:arrow-right-bold" width={16} className="text-muted-foreground" />
                    {getNextStatuses(order.status).map((s) => (
                      <Button
                        key={s}
                        variant="outlined"
                        onClick={() => handleChangeStatus(s)}
                        disabled={changeStatusMutation.isPending}
                        className="text-sm"
                      >
                        {getOrderStatusLabel(s, t)}
                      </Button>
                    ))}
                  </>
                ) : (
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.finalStatusNoChanges')}
                  </Typography>
                )}
              </Box>
            </OrderSection>

            <OrderSection title={t('orders.assignDriver')} icon="solar:user-id-bold">
              {order.driver && (
                <Typography variant="body2" className="mb-3 text-muted-foreground">
                  {t('orders.currentDriver')}{' '}
                  <span className="font-medium text-foreground">{order.driver.name}</span>{' '}
                  <span className="text-muted-foreground">({order.driver.phone})</span>
                </Typography>
              )}
              {!canAssignDriver ? (
                <Typography variant="caption" className="mb-3 block text-muted-foreground">
                  {t('orders.assignDriverDisabledDeliveredOrOut')}
                </Typography>
              ) : null}
              <FormProvider {...assignDriverForm}>
                <form
                  onSubmit={assignDriverForm.handleSubmit(handleAssignDriver)}
                  className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                  <Box className="min-w-0 flex-1">
                    <RHFInfiniteSelect
                      name="driver_id"
                      queryKey={['order', 'assign-driver', id]}
                      fetcher={driverFetcher}
                      placeholder={t('form.selectDriver')}
                      initialLabel={order.driver?.name}
                      pageSize={10}
                      disabled={!canAssignDriver}
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    className="w-full shrink-0 sm:w-auto"
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
            </OrderSection>
          </Box>

          {/* Order info + customer */}
          <Box className="mb-4 grid gap-4 lg:mb-5 lg:grid-cols-2 lg:gap-5">
            <OrderSection title={t('orders.orderInformation')} icon="solar:clipboard-list-bold">
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.orderCode')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.order_code}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.cartType')}
                  </Typography>
                  <Typography variant="body1" className="font-medium capitalize">
                    {order.cart_type}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.instantDelivery')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.is_instant_delivery ? t('common.yes') : t('common.no')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.assignedBy')}
                  </Typography>
                  <Typography variant="body1" className="font-medium capitalize">
                    {order.assigned_by || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.totalQuantity')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.total_quantity}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.createdAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.created_at)}
                  </Typography>
                </Box>
              </Box>
            </OrderSection>

            <OrderSection title={t('orders.customer')} icon="solar:user-bold">
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.name')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.user?.name || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.email')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.user?.email || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.phone')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.user?.phone || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.memberSince')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.user?.created_at)}
                  </Typography>
                </Box>
                {order.user?.affiliate?.is_affiliate && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.affiliateId')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user.affiliate.affiliate_id}
                    </Typography>
                  </Box>
                )}
              </Box>
            </OrderSection>
          </Box>

          {/* Delivery Address */}
          {order.user_address && (
            <Box className="mb-4 lg:mb-5">
              <OrderSection title={t('orders.deliveryAddress')} icon="solar:delivery-bold">
                <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.label')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.label || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.area')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.area || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.streetName')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.street_name || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.buildingNumber')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.building_number || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.floorApartment')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.floor_apartment || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.nearestLandmark')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.nearest_landmark || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.contactPhone')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.contact_phone || '-'}
                    </Typography>
                  </Box>
                  {(order.user_address.lat != null || order.user_address.lng != null) && (
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('orders.coordinates')}
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {order.user_address.lat}, {order.user_address.lng}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </OrderSection>
            </Box>
          )}

          {/* Live Order Tracking Map */}
          {isTrackable && order.user_address?.lat != null && order.user_address?.lng != null && (
            <Box className="mb-4 lg:mb-5">
              <OrderSection
                title={t('orders.liveTracking')}
                icon="solar:map-bold"
                headerRight={
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  </span>
                }
              >
                <OrderTrackingMap
                  destinationLat={Number(order.user_address.lat)}
                  destinationLng={Number(order.user_address.lng)}
                  destinationLabel={order.user_address.label}
                  driverLocation={liveLocation}
                  driverName={order.driver?.name}
                  height="450px"
                />
              </OrderSection>
            </Box>
          )}

          {/* Pricing + timeline */}
          <Box className="mb-4 grid gap-4 lg:mb-5 lg:grid-cols-2 lg:gap-5">
            <OrderSection title={t('orders.pricing')} icon="solar:wallet-money-bold">
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.subtotal')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.subtotal}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.deliveryPrice')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.delivery_price}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.totalWithDelivery')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.total_with_delivery}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.basketDiscount')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.basket_discount}
                  </Typography>
                </Box>
                {order.coupon_discount != null && order.coupon_discount !== 0 && (
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.couponDiscount')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.coupon_discount}
                    </Typography>
                  </Box>
                )}
                {order.coupon_discount_from_points != null &&
                  order.coupon_discount_from_points !== '0' &&
                  order.coupon_discount_from_points !== '0.00' && (
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('orders.couponDiscountFromPoints')}
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {order.coupon_discount_from_points}
                      </Typography>
                    </Box>
                  )}
                {order.free_delivery_from_points != null &&
                  order.free_delivery_from_points !== 0 && (
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('orders.freeDeliveryFromPoints')}
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {order.free_delivery_from_points}
                      </Typography>
                    </Box>
                  )}
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.total')}
                  </Typography>
                  <Typography variant="body1" className="font-bold text-primary">
                    {order.total}
                  </Typography>
                </Box>
              </Box>
            </OrderSection>

            <OrderSection title={t('orders.statusTimeline')} icon="solar:history-bold">
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.pendingAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.timestamps.pending_at)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.preparingAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.timestamps.preparing_at)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.outForDeliveryAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.timestamps.out_delivery_at)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.deliveredAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.timestamps.delivered_at)}
                  </Typography>
                </Box>
              </Box>
            </OrderSection>
          </Box>

          {/* Affiliate + driver details */}
          {(order.affiliate || order.driver) && (
            <Box
              className={`mb-4 grid gap-4 lg:mb-5 lg:gap-5 ${order.affiliate && order.driver ? 'lg:grid-cols-2' : ''}`}
            >
              {order.affiliate && (
                <OrderSection title={t('orders.affiliate')} icon="solar:users-group-rounded-bold">
                  <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.rate')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.affiliate.affiliate_rate}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.source')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.affiliate.affiliate_source}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.commission')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.affiliate.affiliate_commission}
                    </Typography>
                  </Box>
                  {order.affiliate.affiliate_commission_type && (
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('orders.affiliateCommissionType')}
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {order.affiliate.affiliate_commission_type}
                      </Typography>
                    </Box>
                  )}
                  {order.affiliate.affiliate_fixed_commission != null &&
                    order.affiliate.affiliate_fixed_commission !== '' && (
                      <Box>
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('orders.affiliateFixedCommission')}
                        </Typography>
                        <Typography variant="body1" className="font-medium">
                          {String(order.affiliate.affiliate_fixed_commission)}
                        </Typography>
                      </Box>
                    )}
                  {order.affiliate.affiliate_commission_amount != null && (
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('orders.affiliateCommissionAmount')}
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {order.affiliate.affiliate_commission_amount}
                      </Typography>
                    </Box>
                  )}
                </Box>
                </OrderSection>
              )}

              {order.driver && (
                <OrderSection title={t('orders.driver')} icon="solar:scooter-bold">
                  <Box className="grid gap-4 sm:grid-cols-2">
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.name')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.phone')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.phone}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.status')}
                    </Typography>
                    <Typography variant="body1" className="font-medium capitalize">
                      {order.driver.status}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.averageRating')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.average_rating}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.totalOrders')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.total_orders}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.completedOrders')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.completed_orders}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.totalEarnings')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.total_earnings}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('orders.ratePerOrder')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.rate_per_order}
                    </Typography>
                  </Box>
                </Box>
                </OrderSection>
              )}
            </Box>
          )}

          {/* Order Items */}
          <OrderSection title={t('orders.orderItems')} icon="solar:cart-large-2-bold">
            <Box className="space-y-4">
                {order.items?.map((item) => (
                  <Box
                    key={item.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background"
                  >
                    <Box className="flex-1">
                      <Typography variant="subtitle2" className="font-semibold">
                        {item.product_name}
                      </Typography>
                      <Typography variant="caption" className="text-muted-foreground block">
                        {t('form.orderItemQtyPriceLine', { qty: item.quantity, price: item.price })}
                        {item.discount > 0 && ` · ${t('form.orderItemDiscountInline', { amount: item.discount })}`}
                      </Typography>
                      {item.variant_attributes &&
                        (Array.isArray(item.variant_attributes)
                          ? item.variant_attributes.length > 0
                          : Object.keys(item.variant_attributes).length > 0) && (
                          <Box className="flex flex-wrap gap-1 mt-1">
                            {Array.isArray(item.variant_attributes)
                              ? item.variant_attributes.map((attr: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground"
                                  >
                                    {toDisplayString(attr.attribute)}:{' '}
                                    {attr.type === 'color' ? (
                                      <span className="inline-flex items-center gap-1">
                                        <span
                                          className="inline-block w-3 h-3 rounded-full border border-border/50"
                                          style={{ backgroundColor: attr.value }}
                                        />
                                        {toDisplayString(attr.value)}
                                      </span>
                                    ) : (
                                      toDisplayString(attr.value)
                                    )}
                                  </span>
                                ))
                              : Object.entries(item.variant_attributes).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground"
                                  >
                                    {key}: {toDisplayString(value)}
                                  </span>
                                ))}
                          </Box>
                        )}
                    </Box>
                    <Box className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[normalizeOrderStatus(item.status)] || 'bg-muted text-muted-foreground'}`}
                      >
                        {getOrderStatusLabel(item.status, t)}
                      </span>
                      <select
                        value={normalizeOrderStatus(item.status)}
                        onChange={(e) =>
                          handleChangeItemStatus(item.id, e.target.value as OrderStatus)
                        }
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        disabled={changeItemStatusMutation.isPending}
                      >
                        {ORDER_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {getOrderStatusLabel(s, t)}
                          </option>
                        ))}
                      </select>
                    </Box>
                  </Box>
                ))}
            </Box>
          </OrderSection>
        </Box>
      </Box>
    </>
  );
}
