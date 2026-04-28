import type { TFunction } from 'i18next';

import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { Iconify } from '@/shared/components/iconify';
import { DriverAssignOrderForm } from '@/pages/dashboard/driver/components/driver-assign-order-form';

import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

export type DriverAssignOrderModalProps = {
  open: boolean;
  onClose: () => void;
  driverId: number;
  driverLabel?: string;
  t: TFunction<'table'>;
};

export function DriverAssignOrderModal({
  open,
  onClose,
  driverId,
  driverLabel,
  t,
}: DriverAssignOrderModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="md"
      disableBackdropClick={false}
      className="overflow-hidden rounded-2xl border border-border/60 shadow-2xl shadow-primary/10"
    >
      <div className="relative flex flex-col">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-700 px-6 pb-10 pt-7 text-primary-foreground">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div className="relative flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-md">
              <Iconify icon="solar:clipboard-list-bold" width={32} height={32} className="text-white" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                {t('tableNames.driver')}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                {t('form.driverAssignOrderSection')}
              </h2>
              {driverLabel ? (
                <p className="mt-2 truncate text-sm text-white/90">{driverLabel}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute end-0 top-0 rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label={t('back')}
            >
              <Iconify icon="solar:close-circle-bold" width={22} height={22} />
            </button>
          </div>
        </div>

        <div className="relative -mt-6 flex flex-1 flex-col rounded-t-3xl border-x border-t border-border/60 bg-background px-5 pb-5 pt-6 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.35)] sm:px-7">
          <Typography variant="body2" className="mb-4 text-muted-foreground">
            {t('form.driverAssignOrderModalHint')}
          </Typography>
          <DriverAssignOrderForm driverId={driverId} t={t} onAssigned={onClose} showViewOrderButton />
          <Box className="mt-6 flex justify-end border-t border-border/60 pt-4">
            <Button type="button" variant="outlined" onClick={onClose}>
              {t('back')}
            </Button>
          </Box>
        </div>
      </div>
    </Modal>
  );
}
