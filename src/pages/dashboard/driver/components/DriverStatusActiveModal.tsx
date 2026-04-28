import type { TFunction } from 'i18next';

import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { SimpleSelect } from '@/shared/ui/select';
import { Iconify } from '@/shared/components/iconify';
import {
  DRIVER_AVAILABILITY_BADGE,
  type DriverAvailabilityKey,
} from '@/shared/utils/driver-status-badge';

type Props = {
  open: boolean;
  onClose: () => void;
  driverName?: string;
  driverPhone?: string;
  chosenStatus: DriverAvailabilityKey;
  onChosenStatus: (s: DriverAvailabilityKey) => void;
  chosenActive: boolean;
  onChosenActive: (v: boolean) => void;
  onApply: () => void;
  isBusy: boolean;
  isDetailsLoading: boolean;
  canSave: boolean;
  t: TFunction<'table'>;
};

const STATUS_ORDER: DriverAvailabilityKey[] = ['available', 'busy', 'inactive'];

export function DriverStatusActiveModal({
  open,
  onClose,
  driverName,
  driverPhone,
  chosenStatus,
  onChosenStatus,
  chosenActive,
  onChosenActive,
  onApply,
  isBusy,
  isDetailsLoading,
  canSave,
  t,
}: Props) {
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
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-violet-600 px-6 pb-12 pt-7 text-primary-foreground">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-10 left-1/4 h-32 w-32 rounded-full bg-violet-400/30 blur-3xl"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.06)_50%,transparent_60%)]" />

          <div className="relative flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-md">
              <Iconify icon="solar:delivery-bold" width={36} height={36} className="text-white" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                {t('driverStatusActiveModalKicker')}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                {t('driverStatusActiveModalTitle')}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="max-w-full truncate rounded-lg bg-black/20 px-2.5 py-1 text-sm font-medium text-white/95 ring-1 ring-white/15">
                  {driverName || '—'}
                </span>
                {driverPhone ? (
                  <code className="max-w-full truncate rounded-lg bg-black/20 px-2.5 py-1 text-xs font-mono text-white/95 ring-1 ring-white/15">
                    {driverPhone}
                  </code>
                ) : null}
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
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('driverStatusActiveModalHint')}
          </p>

          {isDetailsLoading ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
              <Iconify icon="svg-spinners:ring-resize" width={22} className="shrink-0 text-primary" />
              {t('loadingData')}
            </div>
          ) : null}

          <div className="mt-6 space-y-5">
            <div>
              <span className="mb-2 block text-xs font-medium text-muted-foreground">
                {t('columns.status')}
              </span>
              <div className="mb-3 flex flex-wrap gap-2">
                {STATUS_ORDER.map((key) => {
                  const badge = DRIVER_AVAILABILITY_BADGE[key];
                  const selected = chosenStatus === key;
                  const labelKey =
                    key === 'available'
                      ? 'driverAvailAvailable'
                      : key === 'busy'
                        ? 'driverAvailBusy'
                        : 'driverAvailInactive';
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isBusy || isDetailsLoading}
                      onClick={() => onChosenStatus(key)}
                      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-semibold shadow-sm transition ring-2 ring-offset-2 ring-offset-background ${
                        selected
                          ? 'ring-primary border-primary'
                          : 'ring-transparent opacity-80 hover:opacity-100'
                      } ${badge.className}`}
                    >
                      <Iconify
                        icon={
                          key === 'available'
                            ? 'solar:check-circle-bold'
                            : key === 'busy'
                              ? 'solar:clock-circle-bold'
                              : 'solar:close-circle-bold'
                        }
                        width={14}
                        height={14}
                        className={`flex-shrink-0 ${badge.iconClassName}`}
                      />
                      {t(labelKey)}
                    </button>
                  );
                })}
              </div>
            </div>

            <SimpleSelect
              label={t('columns.active')}
              fullWidth
              value={chosenActive ? '1' : '0'}
              onChange={(v) => onChosenActive(v === '1' || v === 1)}
              disabled={isBusy || isDetailsLoading}
              options={[
                { value: '1', label: t('active') },
                { value: '0', label: t('inactive') },
              ]}
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-border/60 pt-5">
            <Button type="button" variant="outlined" onClick={onClose} disabled={isBusy}>
              {t('back')}
            </Button>
            <Button
              type="button"
              onClick={() => void onApply()}
              disabled={isBusy || isDetailsLoading || !canSave}
            >
              {isBusy ? t('updating') : t('save')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
