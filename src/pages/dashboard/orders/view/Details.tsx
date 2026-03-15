import type { OrderStatus } from '@/pages/dashboard/orders/types/order.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { _DriverApi } from '@/pages/dashboard/driver/api/driver.services';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import {
  useAssignDriver,
  useFetchOrderById,
  useChangeItemStatus,
  useChangeOrderStatus,
} from '@/pages/dashboard/orders/hooks/order';

import { toDisplayString } from 'src/utils/to-display-string';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

const metadata = { title: `Order Details | Dashboard - ${CONFIG.appName}` };

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600',
  preparing: 'bg-blue-500/20 text-blue-600',
  out_delivery: 'bg-purple-500/20 text-purple-600',
  delivered: 'bg-green-500/20 text-green-600',
};

const statuses: OrderStatus[] = ['pending', 'preparing', 'out_delivery', 'delivered'];

const statusOrder = ['pending', 'preparing', 'out_delivery', 'delivered'];
const getNextStatuses = (current: string): OrderStatus[] => {
  const idx = statusOrder.indexOf(current);
  if (idx === -1 || current === 'delivered') return [];
  return statusOrder.slice(idx + 1) as OrderStatus[];
};

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
            Loading order details...
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
              Order Not Found
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            Failed to load order details.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </Box>
      </Box>
    );
  }

  const handleChangeStatus = async (status: OrderStatus) => {
    try {
      await changeStatusMutation.mutateAsync({
        id: order.id,
        data: { status },
        queryId: id,
      });
      toast.success(`Order status changed to ${status}`);
    } catch { return; }
  };

  const handleAssignDriver = async (data: { driver_id: number }) => {
    const driverId = data.driver_id;
    if (!driverId || driverId === 0) return;
    try {
      await assignDriverMutation.mutateAsync({
        id: order.id,
        data: { driver_id: Number(driverId) },
        queryId: id,
      });
      toast.success('Driver assigned successfully');
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
      toast.success('Item status updated');
    } catch { return; }
  };

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

        <Box className="relative max-w-4xl mx-auto">
          {/* Header */}
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/orders')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Orders
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:bag-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  Order {order.order_code}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {formatDate(order.created_at)}
                </Typography>
              </Box>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}
              >
                {order.status?.replace('_', ' ')}
              </span>
            </Box>
          </Box>

          {/* Change Status */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Change Order Status
              </Typography>
              <Box className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}
                >
                  {order.status.replace('_', ' ')}
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
                        {s.replace('_', ' ')}
                      </Button>
                    ))}
                  </>
                ) : (
                  <Typography variant="caption" className="text-muted-foreground">
                    Final status — no further changes allowed
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Assign Driver */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Assign Driver
              </Typography>
              {order.driver && (
                <Typography variant="body2" className="mb-3 text-muted-foreground">
                  Current driver:{' '}
                  <span className="font-medium text-foreground">{order.driver.name}</span>{' '}
                  <span className="text-muted-foreground">({order.driver.phone})</span>
                </Typography>
              )}
              <FormProvider {...assignDriverForm}>
                <form
                  onSubmit={assignDriverForm.handleSubmit(handleAssignDriver)}
                  className="flex gap-2 items-end"
                >
                  <Box className="flex-1 min-w-0">
                    <RHFInfiniteSelect
                      name="driver_id"
                      queryKey={['order', 'assign-driver', id]}
                      fetcher={driverFetcher}
                      placeholder={t('form.selectDriver')}
                      initialLabel={order.driver?.name}
                      pageSize={10}
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      !selectedDriverId || selectedDriverId === 0 || assignDriverMutation.isPending
                    }
                  >
                    Assign
                  </Button>
                </form>
              </FormProvider>
            </Box>
          </Box>

          {/* Order Information */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Order Information
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Order Code
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.order_code}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Cart Type
                  </Typography>
                  <Typography variant="body1" className="font-medium capitalize">
                    {order.cart_type}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Instant Delivery
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.is_instant_delivery ? 'Yes' : 'No'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Assigned By
                  </Typography>
                  <Typography variant="body1" className="font-medium capitalize">
                    {order.assigned_by || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Total Quantity
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.total_quantity}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Created At
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.created_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Customer */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Customer
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Name
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.user?.name || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Email
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.user?.email || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Phone
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.user?.phone || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Member Since
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.user?.created_at)}
                  </Typography>
                </Box>
                {order.user?.affiliate?.is_affiliate && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">
                      Affiliate ID
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user.affiliate.affiliate_id}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Delivery Address */}
          {order.user_address && (
            <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
              <Box className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">
                  Delivery Address
                </Typography>
                <Box className="grid gap-4 sm:grid-cols-2">
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Label
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.label || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Area
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.area || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Street Name
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.street_name || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Building Number
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.building_number || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Floor / Apartment
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.floor_apartment || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Nearest Landmark
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.nearest_landmark || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Contact Phone
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.user_address.contact_phone || '-'}
                    </Typography>
                  </Box>
                  {(order.user_address.lat != null || order.user_address.lng != null) && (
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground">
                        Coordinates
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {order.user_address.lat}, {order.user_address.lng}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {/* Pricing */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Pricing
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Subtotal
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.subtotal}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Delivery Price
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.delivery_price}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Total with Delivery
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.total_with_delivery}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Basket Discount
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.basket_discount}
                  </Typography>
                </Box>
                {order.coupon_discount != null && order.coupon_discount !== 0 && (
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Coupon Discount
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
                        Coupon Discount from Points
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
                        Free Delivery from Points
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {order.free_delivery_from_points}
                      </Typography>
                    </Box>
                  )}
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Total
                  </Typography>
                  <Typography variant="body1" className="font-bold text-primary">
                    {order.total}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Status Timeline */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Status Timeline
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Pending At
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.timestamps.pending_at)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Preparing At
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.timestamps.preparing_at)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Out for Delivery At
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.timestamps.out_delivery_at)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Delivered At
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDate(order.timestamps.delivered_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Affiliate Info */}
          {order.affiliate && (
            <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
              <Box className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">
                  Affiliate
                </Typography>
                <Box className="grid gap-4 sm:grid-cols-3">
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Rate
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.affiliate.affiliate_rate}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Source
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.affiliate.affiliate_source}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Commission
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.affiliate.affiliate_commission}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Driver Info */}
          {order.driver && (
            <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
              <Box className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">
                  Driver
                </Typography>
                <Box className="grid gap-4 sm:grid-cols-2">
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Name
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Phone
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.phone}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Status
                    </Typography>
                    <Typography variant="body1" className="font-medium capitalize">
                      {order.driver.status}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Average Rating
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.average_rating}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Total Orders
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.total_orders}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Completed Orders
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.completed_orders}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Total Earnings
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.total_earnings}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Rate per Order
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.driver.rate_per_order}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Order Items */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Order Items
              </Typography>
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
                        Qty: {item.quantity} × {item.price}
                        {item.discount > 0 && ` · Discount: ${item.discount}`}
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
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status] || 'bg-muted text-muted-foreground'}`}
                      >
                        {item.status?.replace('_', ' ')}
                      </span>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleChangeItemStatus(item.id, e.target.value as OrderStatus)
                        }
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        disabled={changeItemStatusMutation.isPending}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
