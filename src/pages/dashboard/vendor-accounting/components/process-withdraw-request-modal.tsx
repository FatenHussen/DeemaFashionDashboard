import type { PaymentMethod, WithdrawRequest, UpdateWithdrawPayload } from '../types';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { getApiErrorMessage } from '@/lib/get-api-error-message';

import { useUpdateWithdrawRequest, useFetchWithdrawRequestDetail } from '../hooks';

// ----------------------------------------------------------------------

export type ProcessWithdrawRequestModalProps = {
  request: WithdrawRequest;
  onClose: () => void;
  onSuccess: () => void;
};

type ProcessAction = 'paid' | 'rejected';

export function ProcessWithdrawRequestModal({
  request,
  onClose,
  onSuccess,
}: ProcessWithdrawRequestModalProps) {
  const { t } = useTranslation('table');
  const [action, setAction] = useState<ProcessAction>('paid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [transferReference, setTransferReference] = useState('');
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const { data: detailEnvelope, isLoading: detailLoading, isError: detailError } =
    useFetchWithdrawRequestDetail(request.id);

  const { mutateAsync, isPending } = useUpdateWithdrawRequest();

  const effectiveRequest = detailEnvelope?.data ?? request;
  const canProcess = !detailLoading && !detailError && effectiveRequest.status === 'pending';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canProcess) {
      setError(t('vendorAccounting.withdrawNotPending'));
      return;
    }

    let payload: UpdateWithdrawPayload;
    if (action === 'paid') {
      if (!paymentMethod) {
        setError(t('vendorAccounting.paymentMethodRequired'));
        return;
      }
      payload = {
        status: 'paid',
        payment_method: paymentMethod,
        transfer_reference: transferReference || undefined,
        note: note || undefined,
      };
    } else {
      if (!rejectionReason.trim()) {
        setError(t('vendorAccounting.rejectionReasonRequired'));
        return;
      }
      payload = {
        status: 'rejected',
        rejection_reason: rejectionReason,
        note: note || undefined,
      };
    }

    try {
      await mutateAsync({ id: effectiveRequest.id, payload });
      toast.success(t('vendorAccounting.withdrawUpdated'));
      onSuccess();
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, t('vendorAccounting.withdrawUpdateFailed'));
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-[var(--layout-modal-zIndex)] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Iconify icon="solar:banknote-bold" className="text-primary" width={18} height={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {t('vendorAccounting.processWithdraw')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('vendorAccounting.requestId')} #{effectiveRequest.id} •{' '}
                {effectiveRequest.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
          >
            <Iconify icon="solar:close-bold" width={18} height={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {detailLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Iconify icon="svg-spinners:ring-resize" width={16} height={16} className="animate-spin" />
              {t('loading')}
            </div>
          )}

          {detailError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <Iconify icon="solar:danger-bold" width={16} height={16} />
              {t('vendorAccounting.withdrawDetailLoadFailed')}
            </div>
          )}

          {!detailLoading && !canProcess && !detailError && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
              <Iconify icon="solar:info-circle-bold" width={16} height={16} />
              {t('vendorAccounting.withdrawNotPending')}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAction('paid')}
              disabled={!canProcess}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                action === 'paid'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                  : 'border-border text-muted-foreground hover:border-border/80'
              } disabled:opacity-50`}
            >
              <Iconify icon="solar:check-circle-bold" width={16} height={16} />
              {t('vendorAccounting.markAsPaid')}
            </button>
            <button
              type="button"
              onClick={() => setAction('rejected')}
              disabled={!canProcess}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                action === 'rejected'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300'
                  : 'border-border text-muted-foreground hover:border-border/80'
              } disabled:opacity-50`}
            >
              <Iconify icon="solar:close-circle-bold" width={16} height={16} />
              {t('statusRejected')}
            </button>
          </div>

          {action === 'paid' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  {t('vendorAccounting.paymentMethod')}
                  <span className="text-destructive"> *</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  disabled={!canProcess}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="bank_transfer">{t('vendorAccounting.bankTransfer')}</option>
                  <option value="cash">{t('vendorAccounting.cash')}</option>
                  <option value="wallet">{t('vendorAccounting.walletMethod')}</option>
                  <option value="other">{t('vendorAccounting.other')}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  {t('vendorAccounting.transferReference')}{' '}
                  <span className="text-muted-foreground font-normal">({t('vendorAccounting.optional')})</span>
                </label>
                <input
                  type="text"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  disabled={!canProcess}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  placeholder={t('vendorAccounting.transferReferencePlaceholder')}
                />
              </div>
            </>
          )}

          {action === 'rejected' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                {t('vendorAccounting.rejectionReason')}
                <span className="text-destructive"> *</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={!canProcess}
                rows={3}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
                placeholder={t('vendorAccounting.rejectionReasonPlaceholder')}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {t('vendorAccounting.note')}{' '}
              <span className="text-muted-foreground font-normal">({t('vendorAccounting.optional')})</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={!canProcess}
              rows={2}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
              placeholder={t('vendorAccounting.notePlaceholder')}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <Iconify icon="solar:danger-bold" width={16} height={16} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending || !canProcess}
              className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                action === 'paid'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60'
                  : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-60'
              }`}
            >
              {isPending ? (
                <>
                  <Iconify icon="svg-spinners:ring-resize" width={16} height={16} />
                  {t('submitting')}
                </>
              ) : action === 'paid' ? (
                t('vendorAccounting.confirmPaid')
              ) : (
                t('vendorAccounting.confirmRejected')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
