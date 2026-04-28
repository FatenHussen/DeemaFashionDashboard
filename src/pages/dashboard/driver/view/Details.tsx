import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchDriverById } from '@/pages/dashboard/driver/hooks/driver';
import { DriverAssignOrderCard } from '@/pages/dashboard/driver/components/DriverAssignOrderCard';
import {
  DRIVER_AVAILABILITY_BADGE,
  DRIVER_ACCOUNT_ACTIVE_BADGE,
  normalizeDriverAvailabilityStatus,
} from '@/shared/utils/driver-status-badge';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canAssignOrdersToDriver = can('order.update');
  const { data: driverResponse, isLoading, error } = useFetchDriverById(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !driverResponse?.data) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.driverLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.driverLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/driver')}>
            {t('form.backToDrivers')}
          </Button>
        </Box>
      </Box>
    );
  }

  const driver = driverResponse.data;

  const availabilityKey = normalizeDriverAvailabilityStatus(String(driver.status));
  const availabilityBadge = DRIVER_AVAILABILITY_BADGE[availabilityKey];
  const availabilityLabelKey =
    availabilityKey === 'available'
      ? 'driverAvailAvailable'
      : availabilityKey === 'busy'
        ? 'driverAvailBusy'
        : 'driverAvailInactive';

  const hasStats =
    driver.average_rating != null ||
    driver.total_orders != null ||
    driver.completed_orders != null ||
    driver.total_earnings != null;

  const hasVehicle =
    !!(driver.vehicle_name || driver.vehicle_type || driver.vehicle_number || driver.vehicle_image);

  const hasSidebar =
    canAssignOrdersToDriver ||
    (driver.shops && driver.shops.length > 0) ||
    (driver.cities && driver.cities.length > 0);

  return (
    <>
      <title>{t('form.driverDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative w-full min-h-screen overflow-hidden bg-background">
        {/* Ambient background */}
        <Box className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgb(var(--primary)_/_0.12),transparent_50%)]" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.35] dark:opacity-[0.2] bg-[linear-gradient(to_right,rgb(var(--foreground)_/_0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--foreground)_/_0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <Box className="relative w-full max-w-none px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <Button
            variant="text"
            onClick={() => navigate('/driver')}
            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2 rtl:rotate-180" />
            {t('form.backToDrivers')}
          </Button>

          {/* Hero */}
          <Box className="relative mb-8 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-background/95 to-muted/30 shadow-xl shadow-primary/5 backdrop-blur-sm">
            <Box className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
            <Box className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
            <Box className="relative border-b border-border/40 bg-gradient-to-r from-primary/[0.07] via-transparent to-muted/20 px-5 py-6 sm:px-8 sm:py-8">
              <Box className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <Box className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {driver.image ? (
                    <Box className="relative shrink-0">
                      <Box className="absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-primary/50 via-primary/20 to-transparent opacity-80" />
                      <img
                        src={driver.image}
                        alt={driver.name || t('form.driverAltFallback')}
                        className="relative h-28 w-28 rounded-2xl object-cover shadow-lg ring-4 ring-background sm:h-32 sm:w-32"
                      />
                    </Box>
                  ) : (
                    <Box className="relative shrink-0">
                      <Box className="absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-primary/40 to-primary/10" />
                      <Box className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-primary/10 shadow-inner ring-4 ring-background sm:h-32 sm:w-32">
                        <Iconify icon="solar:user-bold" className="text-primary" width={48} height={48} />
                      </Box>
                    </Box>
                  )}
                  <Box className="min-w-0 flex-1">
                    <Typography
                      variant="h4"
                      className="mb-2 font-bold tracking-tight text-foreground sm:text-3xl"
                    >
                      {driver.name || t('reports.driverFallback', { id: driver.id })}
                    </Typography>
                    <Box className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                        {t('form.driverIdChip', { id: driver.id })}
                      </span>
                      <Box className={availabilityBadge.className}>
                        <Iconify
                          icon={
                            availabilityKey === 'available'
                              ? 'solar:check-circle-bold'
                              : availabilityKey === 'busy'
                                ? 'solar:clock-circle-bold'
                                : 'solar:close-circle-bold'
                          }
                          width={14}
                          height={14}
                          className={availabilityBadge.iconClassName}
                        />
                        <span>{t(availabilityLabelKey)}</span>
                      </Box>
                      <Box
                        className={
                          driver.is_active === 1 || driver.is_active === true
                            ? DRIVER_ACCOUNT_ACTIVE_BADGE.active
                            : DRIVER_ACCOUNT_ACTIVE_BADGE.inactive
                        }
                      >
                        <Iconify
                          icon={
                            driver.is_active === 1 || driver.is_active === true
                              ? 'solar:check-circle-bold'
                              : 'solar:close-circle-bold'
                          }
                          width={14}
                          height={14}
                          className="text-white"
                        />
                        <span>
                          {driver.is_active === 1 || driver.is_active === true
                            ? t('active')
                            : t('inactive')}
                        </span>
                      </Box>
                    </Box>
                    <Typography variant="body2" className="max-w-2xl text-muted-foreground">
                      {driver.name ? t('form.driverDetailsSubtitle') : ''}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/driver/update/${id}`)}
                  className="shrink-0 gap-2 self-start shadow-lg shadow-primary/25"
                >
                  <Iconify icon="solar:pen-bold" width={18} />
                  {t('form.editDriverButton')}
                </Button>
              </Box>

              {hasStats ? (
                <Box className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
                  {driver.average_rating != null && (
                    <Box className="group relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent p-4 transition-colors hover:border-amber-500/40">
                      <Iconify
                        icon="solar:star-bold"
                        className="mb-2 text-amber-500 opacity-80"
                        width={22}
                      />
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('form.driverAvgRatingLabel')}
                      </Typography>
                      <Typography variant="h5" className="mt-1 font-bold tabular-nums text-foreground">
                        {driver.average_rating}
                      </Typography>
                    </Box>
                  )}
                  {driver.total_orders != null && (
                    <Box className="group relative overflow-hidden rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/10 to-transparent p-4 transition-colors hover:border-sky-500/40">
                      <Iconify
                        icon="solar:cart-large-2-bold"
                        className="mb-2 text-sky-500 opacity-80"
                        width={22}
                      />
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('form.driverTotalOrdersLabel')}
                      </Typography>
                      <Typography variant="h5" className="mt-1 font-bold tabular-nums text-foreground">
                        {driver.total_orders}
                      </Typography>
                    </Box>
                  )}
                  {driver.completed_orders != null && (
                    <Box className="group relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 transition-colors hover:border-emerald-500/40">
                      <Iconify
                        icon="solar:check-circle-bold"
                        className="mb-2 text-emerald-500 opacity-80"
                        width={22}
                      />
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('form.driverCompletedOrdersLabel')}
                      </Typography>
                      <Typography variant="h5" className="mt-1 font-bold tabular-nums text-foreground">
                        {driver.completed_orders}
                      </Typography>
                    </Box>
                  )}
                  {driver.total_earnings != null && (
                    <Box className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-transparent p-4 transition-colors hover:border-primary/45">
                      <Iconify
                        icon="solar:wallet-money-bold"
                        className="mb-2 text-primary opacity-90"
                        width={22}
                      />
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('form.driverTotalEarningsLabel')}
                      </Typography>
                      <Typography variant="h5" className="mt-1 font-bold tabular-nums text-foreground">
                        {driver.total_earnings}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : null}
            </Box>
          </Box>

          <Box
            className={
              hasSidebar
                ? 'grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8'
                : 'grid grid-cols-1'
            }
          >
            {/* Main column */}
            <Box className={hasSidebar ? 'space-y-6 xl:col-span-8' : 'space-y-6'}>
              <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-sm backdrop-blur-sm">
                <Box className="border-b border-border/40 bg-muted/20 px-5 py-4 sm:px-6">
                  <Typography
                    variant="h6"
                    className="flex items-center gap-2 font-semibold text-foreground"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Iconify icon="solar:info-circle-bold" width={20} />
                    </span>
                    {t('form.userDetailsBasicInfo')}
                  </Typography>
                </Box>
                <Box className="space-y-6 p-5 sm:p-6">
                  <Box className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Box className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-4">
                      <Typography variant="body2" className="font-medium text-muted-foreground">
                        {t('form.driverIdLabel')}
                      </Typography>
                      <Box className="inline-flex items-center gap-2">
                        <span className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg bg-primary/15 px-2 text-sm font-bold text-primary">
                          {driver.id}
                        </span>
                      </Box>
                    </Box>

                    <Box className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-4">
                      <Typography variant="body2" className="font-medium text-muted-foreground">
                        {t('columns.phone')}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Iconify icon="solar:phone-bold" className="shrink-0 text-primary" width={18} />
                        <Typography variant="body1" className="break-all text-foreground">
                          {driver.phone}
                        </Typography>
                      </Box>
                    </Box>

                    <Box className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-4 sm:col-span-2 lg:col-span-1">
                      <Typography variant="body2" className="font-medium text-muted-foreground">
                        {t('columns.name')}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Iconify icon="solar:user-rounded-bold" className="shrink-0 text-primary" width={18} />
                        <Typography variant="body1" className="text-foreground">
                          {driver.name || '-'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-4 sm:col-span-2 lg:col-span-3">
                      <Typography variant="body2" className="font-medium text-muted-foreground">
                        {t('columns.address')}
                      </Typography>
                      <Box className="flex items-start gap-2">
                        <Iconify icon="solar:map-point-bold" className="mt-0.5 shrink-0 text-primary" width={18} />
                        <Typography variant="body1" className="text-foreground">
                          {driver.address}
                        </Typography>
                      </Box>
                    </Box>

                    <Box className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-4">
                      <Typography variant="body2" className="font-medium text-muted-foreground">
                        {t('form.driverRatePerOrderField')}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Iconify icon="solar:dollar-bold" className="shrink-0 text-primary" width={18} />
                        <Typography variant="body1" className="text-foreground">
                          {driver.rate_per_order ?? '-'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-4">
                      <Typography variant="body2" className="font-medium text-muted-foreground">
                        {t('columns.createdAt')}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Iconify icon="solar:calendar-date-bold" className="shrink-0 text-primary" width={18} />
                        <Typography variant="body1" className="text-foreground">
                          {driver.created_at}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {hasVehicle ? (
                    <>
                      <Separator className="bg-border/60" />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          className="mb-4 flex items-center gap-2 font-semibold text-foreground"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                            <Iconify icon="solar:delivery-bold" width={18} />
                          </span>
                          {t('columns.vehicleName')}
                        </Typography>
                        <Box className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                          {driver.vehicle_image && (
                            <Box className="overflow-hidden rounded-2xl border border-border/50 bg-muted/30 p-2">
                              <img
                                src={driver.vehicle_image}
                                alt={t('form.driverVehicleImagePreviewAlt')}
                                className="h-auto max-h-64 w-full rounded-xl object-cover"
                              />
                            </Box>
                          )}
                          <Box className="flex flex-col gap-3">
                            {driver.vehicle_name && (
                              <Box className="rounded-xl border border-border/40 bg-muted/15 p-4">
                                <Typography variant="caption" className="text-muted-foreground">
                                  {t('form.driverVehicleNameField')}
                                </Typography>
                                <Typography variant="body1" className="mt-1 font-medium text-foreground">
                                  {driver.vehicle_name}
                                </Typography>
                              </Box>
                            )}
                            {driver.vehicle_type && (
                              <Box className="rounded-xl border border-border/40 bg-muted/15 p-4">
                                <Typography variant="caption" className="text-muted-foreground">
                                  {t('form.driverVehicleTypeField')}
                                </Typography>
                                <Typography variant="body1" className="mt-1 capitalize text-foreground">
                                  {driver.vehicle_type}
                                </Typography>
                              </Box>
                            )}
                            {driver.vehicle_number && (
                              <Box className="rounded-xl border border-border/40 bg-muted/15 p-4">
                                <Typography variant="caption" className="text-muted-foreground">
                                  {t('form.driverVehicleNumberField')}
                                </Typography>
                                <Typography variant="body1" className="mt-1 font-mono text-foreground">
                                  {driver.vehicle_number}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </>
                  ) : null}
                </Box>
              </Box>
            </Box>

            {/* Sidebar */}
            {hasSidebar ? (
            <Box className="space-y-6 xl:col-span-4 xl:sticky xl:top-4 xl:self-start">
              {canAssignOrdersToDriver ? (
                <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
                  <DriverAssignOrderCard driverId={driver.id} t={t} hideLeadingSeparator />
                </Box>
              ) : null}

              {driver.shops && driver.shops.length > 0 ? (
                <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-sm">
                  <Box className="border-b border-border/40 px-5 py-4">
                    <Typography variant="subtitle1" className="flex items-center gap-2 font-semibold">
                      <Iconify icon="solar:shop-bold" width={20} className="text-primary" />
                      {t('form.driverShopsSection')}
                      <Typography component="span" variant="caption" className="ml-auto text-muted-foreground">
                        {driver.shops.length === 1
                          ? t('form.driverShopsCountOne', { count: driver.shops.length })
                          : t('form.driverShopsCount', { count: driver.shops.length })}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex flex-wrap gap-2 p-5">
                    {driver.shops.map((shop) => (
                      <Box
                        key={shop.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm transition-colors hover:border-primary/35"
                      >
                        <Iconify icon="solar:shop-bold" className="text-primary" width={16} height={16} />
                        <span className="font-medium text-foreground">{formatTranslated(shop.name)}</span>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : null}

              {driver.cities && driver.cities.length > 0 ? (
                <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-sm">
                  <Box className="border-b border-border/40 px-5 py-4">
                    <Typography variant="subtitle1" className="flex items-center gap-2 font-semibold">
                      <Iconify icon="solar:map-point-bold" width={20} className="text-primary" />
                      {t('form.driverCitiesSection')}
                      <Typography component="span" variant="caption" className="ml-auto text-muted-foreground">
                        {driver.cities.length === 1
                          ? t('form.driverCitiesCountOne', { count: driver.cities.length })
                          : t('form.driverCitiesCount', { count: driver.cities.length })}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="space-y-3 p-5">
                    {driver.cities.map((city) => (
                      <Box
                        key={city.id}
                        className="rounded-xl border border-border/40 bg-gradient-to-br from-muted/40 to-transparent p-4"
                      >
                        <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                          {formatTranslated(city.name)}
                        </Typography>
                        <Box className="space-y-1.5 text-sm text-muted-foreground">
                          {city.governorate ? (
                            <Box className="flex items-center gap-2">
                              <Iconify icon="solar:global-bold" className="text-primary" width={16} />
                              <span>
                                {t('form.driverCityGovernorateLine', {
                                  name: formatTranslated(city.governorate.name),
                                })}
                              </span>
                            </Box>
                          ) : null}
                          {city.created_at ? (
                            <Box className="flex items-center gap-2">
                              <Iconify icon="solar:calendar-date-bold" className="text-primary" width={16} />
                              <span>{t('form.driverCityCreatedLine', { date: city.created_at })}</span>
                            </Box>
                          ) : null}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : null}
            </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </>
  );
}
