import type { TFunction } from 'i18next';
import type { OrderFormValues } from '@/columns/one/orders/one';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { Iconify } from '@/shared/components/iconify';
import { useForm, FormProvider } from 'react-hook-form';
import { useAssignDriver } from '@/pages/dashboard/orders/hooks/order';
import { _DriverApi } from '@/pages/dashboard/driver/api/driver.services';
import { normalizeOrderStatus } from '@/pages/dashboard/orders/types/order.types';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';

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

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderFormValues | null;
  t: TFunction<'table'>;
};

export function AssignDriverModal({ open, onClose, order, t }: Props) {
  const assignDriverMutation = useAssignDriver();

  const form = useForm<{ driver_id: number }>({
    defaultValues: { driver_id: 0 },
  });

  const { watch, reset, handleSubmit } = form;
  const selectedDriverId = watch('driver_id');

  useEffect(() => {
    if (!open || !order) return;
    reset({ driver_id: order.driver?.id ?? 0 });
  }, [open, order, reset]);

  const orderRef =
    order?.order_code ?? order?.order_number ?? (order ? String(order.id) : '');
  const isBusy = assignDriverMutation.isPending;
  const st = order ? normalizeOrderStatus(order.status) : 'pending';
  const canAssignDriver = st !== 'delivered' && st !== 'out_delivery';

  const onSubmit = handleSubmit(async (data) => {
    if (!order || !canAssignDriver || !data.driver_id || data.driver_id === 0) return;
    try {
      await assignDriverMutation.mutateAsync({
        id: order.id,
        data: { driver_id: Number(data.driver_id) },
      });
      toast.success(t('form.driverAssignedSuccess'));
      onClose();
    } catch {
      /* toast from global handler if any */
    }
  });

  const currentDriverLabel = order?.driver?.name ?? order?.driver?.phone;

  return (
    <Modal
      open={open}
      onClose={isBusy ? undefined : onClose}
      maxWidth="md"
      disableBackdropClick={isBusy}
      disableEscapeKeyDown={isBusy}
      className="overflow-hidden rounded-2xl border border-border/60 shadow-2xl shadow-primary/10"
    >
      <div className="relative flex flex-col">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-700 px-6 pb-12 pt-7 text-primary-foreground">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-10 left-1/4 h-32 w-32 rounded-full bg-emerald-400/30 blur-3xl"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.06)_50%,transparent_60%)]" />

          <div className="relative flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-md">
              <Iconify icon="solar:scooter-bold" width={36} height={36} className="text-white" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                {t('assignDriverModalKicker')}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                {t('assignDriverModalTitle')}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="max-w-full truncate rounded-lg bg-black/20 px-2.5 py-1 text-xs font-mono text-white/95 ring-1 ring-white/15">
                  {orderRef}
                </code>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="absolute end-0 top-0 rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              aria-label={t('back')}
            >
              <Iconify icon="solar:close-circle-bold" width={22} height={22} />
            </button>
          </div>
        </div>

        <div className="relative -mt-8 flex flex-1 flex-col rounded-t-3xl border-x border-t border-border/60 bg-background px-5 pb-5 pt-6 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.35)] sm:px-7">
          <p className="text-sm leading-relaxed text-muted-foreground">{t('assignDriverModalHint')}</p>

          {order?.driver && currentDriverLabel ? (
            <div className="mt-4 rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {t('orders.currentDriver')}{' '}
              <span className="font-medium text-foreground">{currentDriverLabel}</span>
              {order.driver.phone && currentDriverLabel !== order.driver.phone ? (
                <span className="text-muted-foreground"> ({order.driver.phone})</span>
              ) : null}
            </div>
          ) : null}

          {!canAssignDriver && order ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t('orders.assignDriverDisabledDeliveredOrOut')}
            </p>
          ) : null}

          <FormProvider {...form}>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <RHFInfiniteSelect
                name="driver_id"
                queryKey={['order', 'assign-driver', 'modal', order?.id ?? 0]}
                fetcher={driverFetcher}
                placeholder={t('form.selectDriver')}
                initialLabel={order?.driver?.name ?? order?.driver?.phone}
                pageSize={10}
                disabled={isBusy || !canAssignDriver}
              />
              <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-5">
                <Button type="button" variant="outlined" onClick={onClose} disabled={isBusy}>
                  {t('back')}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isBusy ||
                    !canAssignDriver ||
                    !selectedDriverId ||
                    selectedDriverId === 0
                  }
                >
                  {isBusy ? t('updating') : t('orders.assign')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  );
}
