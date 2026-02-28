import type { OrderData, OrderStatus } from '@/pages/dashboard/orders/types/order.types';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useFetchDrivers } from '@/pages/dashboard/driver/hooks/driver';
import {
  useAssignDriver,
  useChangeItemStatus,
  useChangeOrderStatus,
} from '@/pages/dashboard/orders/hooks/order';

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

// Status transitions are one-way only (API enforces this)
const statusOrder = ['pending', 'preparing', 'out_delivery', 'delivered'];
const getNextStatuses = (current: string): OrderStatus[] => {
  const idx = statusOrder.indexOf(current);
  if (idx === -1 || current === 'delivered') return [];
  return statusOrder.slice(idx + 1) as OrderStatus[];
};

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: driversResponse } = useFetchDrivers(1, 100);
  const changeStatusMutation = useChangeOrderStatus();
  const assignDriverMutation = useAssignDriver();
  const changeItemStatusMutation = useChangeItemStatus();

  const [selectedDriver, setSelectedDriver] = useState<number | ''>('');
  const [order, setOrder] = useState<OrderData | undefined>(
    (location.state as { order?: OrderData })?.order
  );

  const drivers = driversResponse?.data?.items || [];

  if (!order) {
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
            Please navigate to this page from the orders list.
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
      await changeStatusMutation.mutateAsync({ id: order.id, data: { status } });
      setOrder((prev) => prev ? { ...prev, status } : prev);
      toast.success(`Order status changed to ${status}`);
    } catch {}
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) return;
    try {
      await assignDriverMutation.mutateAsync({
        id: order.id,
        data: { driver_id: Number(selectedDriver) },
      });
      const assigned = drivers.find((d: any) => d.id === Number(selectedDriver));
      if (assigned) setOrder((prev) => prev ? { ...prev, driver: assigned } : prev);
      toast.success('Driver assigned successfully');
      setSelectedDriver('');
    } catch {}
  };

  const handleChangeItemStatus = async (itemId: number, status: OrderStatus) => {
    try {
      await changeItemStatusMutation.mutateAsync({ itemId, data: { status } });
      setOrder((prev) =>
        prev
          ? { ...prev, items: prev.items.map((i) => (i.id === itemId ? { ...i, status } : i)) }
          : prev
      );
      toast.success('Item status updated');
    } catch {}
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
                <Iconify
                  icon="solar:bag-bold"
                  className="text-primary"
                  width={32}
                  height={32}
                />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  Order {order.order_number}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {new Date(order.created_at).toLocaleString()}
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
                {/* Current status badge */}
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
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
                  Current driver: <span className="font-medium text-foreground">{order.driver.phone}</span>
                </Typography>
              )}
              <Box className="flex gap-2 items-center">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value ? Number(e.target.value) : '')}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm flex-1"
                >
                  <option value="">Select a driver...</option>
                  {drivers.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.phone}{d.address ? ` - ${d.address}` : ''}
                    </option>
                  ))}
                </select>
                <Button
                  variant="contained"
                  onClick={handleAssignDriver}
                  disabled={!selectedDriver || assignDriverMutation.isPending}
                >
                  Assign
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Order Info */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Order Information
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Customer
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
                    Total
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.total}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Delivery Price
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {order.delivery_price ?? '-'}
                  </Typography>
                </Box>
                {order.address && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">
                      Address
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.address}
                    </Typography>
                  </Box>
                )}
                {order.notes && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">
                      Notes
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {order.notes}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

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
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background"
                  >
                    <Box className="flex-1">
                      <Typography variant="subtitle2" className="font-semibold">
                        {typeof item.product?.name === 'object'
                          ? (item.product.name as any)?.en || (item.product.name as any)?.ar
                          : item.product?.name || `Product #${item.id}`}
                      </Typography>
                      <Typography variant="caption" className="text-muted-foreground">
                        Qty: {item.quantity} x {item.price}
                      </Typography>
                    </Box>
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
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
