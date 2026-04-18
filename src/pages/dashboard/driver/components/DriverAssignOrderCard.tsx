import type { TFunction } from 'i18next';

import { Iconify } from '@/shared/components/iconify';
import { DriverAssignOrderForm } from '@/pages/dashboard/driver/components/driver-assign-order-form';

import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';

// ----------------------------------------------------------------------

type Props = {
  driverId: number;
  t: TFunction<'table'>;
  /** When true, omit the top separator (e.g. sidebar layout). */
  hideLeadingSeparator?: boolean;
};

export function DriverAssignOrderCard({ driverId, t, hideLeadingSeparator }: Props) {
  return (
    <>
      {!hideLeadingSeparator ? <Separator /> : null}
      <Box>
        <Typography variant="h6" className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <Iconify icon="solar:clipboard-list-bold" width={20} />
          {t('form.driverAssignOrderSection')}
        </Typography>
        <DriverAssignOrderForm driverId={driverId} t={t} showViewOrderButton />
      </Box>
    </>
  );
}
