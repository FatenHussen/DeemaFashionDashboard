import type { TFunction } from 'i18next';
import type { OrderFormValues } from '@/columns/one/orders/one';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '@/shared/ui/modal';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { Iconify } from '@/shared/components/iconify';
import { useChangeOrderStatus } from '@/pages/dashboard/orders/hooks/order';

type FormValues = { rejection_reason: string };

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderFormValues | null;
  t: TFunction<'table'>;
  /** When set, refetches this query key after success (e.g. route param string). */
  queryId?: number | string;
};

export function RejectOrderModal({ open, onClose, order, t, queryId }: Props) {
  const changeStatusMutation = useChangeOrderStatus();

  const form = useForm<FormValues>({
    defaultValues: { rejection_reason: '' },
  });

  const { reset, handleSubmit, register, formState } = form;

  useEffect(() => {
    if (!open) return;
    reset({ rejection_reason: '' });
  }, [open, order?.id, reset]);

  const orderRef =
    order?.order_code ?? order?.order_number ?? (order ? String(order.id) : '');
  const isBusy = changeStatusMutation.isPending;

  const onSubmit = handleSubmit(async (data) => {
    const reason = data.rejection_reason.trim();
    if (!order || !reason) {
      toast.error(t('rejectionReasonRequired'));
      return;
    }
    try {
      await changeStatusMutation.mutateAsync({
        id: order.id,
        data: { status: 'cancelled_by_admin', rejection_reason: reason },
        queryId: queryId ?? order.id,
      });
      toast.success(t('orderRejectSuccess'));
      onClose();
    } catch {
      // ignore
    }
  });

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
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 px-6 pb-12 pt-7 text-primary-foreground">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div className="relative flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-md">
              <Iconify icon="solar:close-circle-bold" width={36} height={36} className="text-white" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                {t('rejectOrderModalKicker')}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                {t('rejectOrderModalTitle')}
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
          <p className="text-sm leading-relaxed text-muted-foreground">{t('rejectOrderModalHint')}</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="reject-order-reason" className="text-sm font-medium text-foreground">
                {t('rejectionReason')}
              </label>
              <textarea
                id="reject-order-reason"
                rows={4}
                {...register('rejection_reason', { required: true })}
                placeholder={t('rejectionReasonPlaceholder')}
                disabled={isBusy}
                className="w-full resize-y rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              {formState.errors.rejection_reason ? (
                <p className="text-xs text-destructive">{t('rejectionReasonRequired')}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-5">
              <Button type="button" variant="outlined" onClick={onClose} disabled={isBusy}>
                {t('cancel')}
              </Button>
              <Button type="submit" color="error" disabled={isBusy}>
                {isBusy ? t('updating') : t('rejectOrderConfirm')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
