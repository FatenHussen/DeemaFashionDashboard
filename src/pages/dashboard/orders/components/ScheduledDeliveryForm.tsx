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
    <div>
      <p
        className={
          displayValue
            ? 'text-sm font-medium tabular-nums text-foreground'
            : 'text-sm text-muted-foreground'
        }
      >
        {displayValue ?? t('orders.scheduledDeliveryEmpty')}
      </p>

      {canSave ? (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="block min-w-0 flex-1 space-y-1.5">
            <span className="text-xs text-muted-foreground">
              {t('orders.scheduledDeliveryDate')}
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={updateScheduledDelivery.isPending}
              className={fieldClassName}
            />
          </label>
          <label className="block min-w-0 flex-1 space-y-1.5">
            <span className="text-xs text-muted-foreground">
              {t('orders.scheduledDeliveryTime')}
            </span>
            <input
              type="time"
              step={60}
              value={time}
              onChange={(event) => setTime(event.target.value.slice(0, 5))}
              disabled={updateScheduledDelivery.isPending}
              className={fieldClassName}
            />
          </label>
          <Button type="submit" variant="contained" disabled={updateScheduledDelivery.isPending}>
            {updateScheduledDelivery.isPending
              ? t('orders.scheduledDeliverySaving')
              : t('orders.scheduledDeliverySave')}
          </Button>
        </form>
      ) : isLocked ? (
        <p className="mt-2 text-sm text-muted-foreground">{t('orders.scheduledDeliveryLocked')}</p>
      ) : null}
      {canSave ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {t('orders.scheduledDeliveryClearHint')}
        </p>
      ) : null}
    </div>
  );
}
