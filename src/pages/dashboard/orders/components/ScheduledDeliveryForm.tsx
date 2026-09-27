import type { FormEvent } from 'react';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useUpdateScheduledDelivery } from '@/pages/dashboard/orders/hooks/order';
import {
  parseOrderStatus,
  orderStatusBlocksScheduledDelivery,
} from '@/pages/dashboard/orders/types/order.types';
import {
  buildScheduledDeliveryAt,
  splitScheduledDeliveryAt,
  formatScheduledDeliveryAt,
} from '@/pages/dashboard/orders/utils/scheduled-delivery';

import { Box, Typography } from 'src/shared/ui';

const fieldClassName =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:opacity-50';

type ScheduledDeliveryFormProps = {
  orderId: number;
  queryId?: string;
  status: string | null | undefined;
  scheduledDeliveryAt: string | null | undefined;
};

export function ScheduledDeliveryForm({
  orderId,
  queryId,
  status,
  scheduledDeliveryAt,
}: ScheduledDeliveryFormProps) {
  const { t } = useTranslation('table');
  const updateScheduledDelivery = useUpdateScheduledDelivery();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const parsedStatus = parseOrderStatus(status);
  const isLocked = parsedStatus != null && orderStatusBlocksScheduledDelivery(parsedStatus);
  const canSave = parsedStatus != null && !isLocked;
  const displayValue = formatScheduledDeliveryAt(scheduledDeliveryAt);

  useEffect(() => {
    const parts = splitScheduledDeliveryAt(scheduledDeliveryAt);
    setDate(parts.date);
    setTime(parts.time);
  }, [scheduledDeliveryAt]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSave || updateScheduledDelivery.isPending) return;

    const scheduled_delivery_at = buildScheduledDeliveryAt(date, time);
    if (scheduled_delivery_at === 'incomplete') {
      toast.error(t('orders.scheduledDeliveryIncomplete'));
      return;
    }

    try {
      await updateScheduledDelivery.mutateAsync({
        id: orderId,
        queryId,
        data: { scheduled_delivery_at },
      });
      toast.success(
        scheduled_delivery_at == null
          ? t('orders.scheduledDeliveryCleared')
          : t('orders.scheduledDeliverySaved')
      );
    } catch {
      return;
    }
  };

  return (
    <Box className="rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4">
      <Typography variant="caption" className="text-muted-foreground">
        {t('orders.scheduledDelivery')}
      </Typography>
      <Typography
        variant="body1"
        className={
          displayValue
            ? 'mt-0.5 font-medium tabular-nums'
            : 'mt-0.5 font-medium text-muted-foreground'
        }
      >
        {displayValue ?? t('orders.scheduledDeliveryEmpty')}
      </Typography>

      {canSave ? (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <Box className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('orders.scheduledDeliveryDate')}
              </Typography>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={updateScheduledDelivery.isPending}
                className={fieldClassName}
              />
            </label>
            <label className="block space-y-1.5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('orders.scheduledDeliveryTime')}
              </Typography>
              <input
                type="time"
                step={60}
                value={time}
                onChange={(event) => setTime(event.target.value.slice(0, 5))}
                disabled={updateScheduledDelivery.isPending}
                className={fieldClassName}
              />
            </label>
          </Box>
          <Button
            type="submit"
            variant="contained"
            disabled={updateScheduledDelivery.isPending}
            className="w-full sm:w-auto"
          >
            {updateScheduledDelivery.isPending
              ? t('orders.scheduledDeliverySaving')
              : t('orders.scheduledDeliverySave')}
          </Button>
          <Typography variant="caption" className="block text-muted-foreground">
            {t('orders.scheduledDeliveryClearHint')}
          </Typography>
        </form>
      ) : isLocked ? (
        <Typography variant="caption" className="mt-2 block text-muted-foreground">
          {t('orders.scheduledDeliveryLocked')}
        </Typography>
      ) : null}
    </Box>
  );
}
