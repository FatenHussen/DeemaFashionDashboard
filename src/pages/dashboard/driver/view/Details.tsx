import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchDriverById } from '@/pages/dashboard/driver/hooks/driver';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    available: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    busy: {
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      border: 'border-orange-200 dark:border-orange-800/50',
      text: 'text-orange-700 dark:text-orange-300',
    },
    offline: {
      bg: 'bg-gray-50 dark:bg-gray-950/20',
      border: 'border-gray-200 dark:border-gray-800/50',
      text: 'text-gray-700 dark:text-gray-300',
    },
  };
  const statusColor = statusColors[driver.status] || statusColors.offline;

  const driverStatusLabelKey: Record<string, 'form.driverStatusAvailable' | 'form.driverStatusBusy' | 'form.driverStatusOffline'> = {
    available: 'form.driverStatusAvailable',
    busy: 'form.driverStatusBusy',
    offline: 'form.driverStatusOffline',
  };
  const statusLabelKey = driverStatusLabelKey[driver.status];

  return (
    <>
      <title>{t('form.driverDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        {/* Subtle background gradient */}
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

        {/* Refined grid overlay */}
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">
          {/* Header */}
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/driver')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              {t('form.backToDrivers')}
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              {driver.image ? (
                <img
                  src={driver.image}
                  alt={driver.name || t('form.driverAltFallback')}
                  className="w-16 h-16 rounded-xl object-cover border border-primary/20"
                />
              ) : (
                <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify icon="solar:user-bold" className="text-primary" width={32} height={32} />
                </Box>
              )}
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {driver.name || t('driverFallback', { id: driver.id })}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.driverIdChip', { id: driver.id })}
                  {driver.name ? ` · ${t('form.driverDetailsSubtitle')}` : ''}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/driver/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                {t('form.editDriverButton')}
              </Button>
            </Box>
          </Box>

          {/* Details Card */}
          <Box className="rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-sm overflow-hidden">
            <Box className="p-6 space-y-6">
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Iconify icon="solar:info-circle-bold" width={20} />
                  {t('form.userDetailsBasicInfo')}
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('form.driverIdLabel')}
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{driver.id}</span>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('columns.phone')}
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:phone-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="text-foreground">
                        {driver.phone}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('columns.address')}
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:map-point-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="text-foreground">
                        {driver.address}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('columns.status')}
                    </Typography>
                    <Box className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}>
                      <Iconify
                        icon={driver.status === 'available' ? 'solar:check-circle-bold' : driver.status === 'busy' ? 'solar:clock-circle-bold' : 'solar:close-circle-bold'}
                        width={14}
                        height={14}
                      />
                      <span className="text-xs font-medium capitalize">
                        {statusLabelKey ? t(statusLabelKey) : driver.status}
                      </span>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('form.driverActiveStatusLabel')}
                    </Typography>
                    <Box
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${
                        driver.is_active === 1 || driver.is_active === true
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
                      }`}
                    >
                      <Iconify
                        icon={driver.is_active === 1 || driver.is_active === true ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                        width={14}
                        height={14}
                      />
                      <span className="text-xs font-medium">
                        {driver.is_active === 1 || driver.is_active === true ? t('active') : t('inactive')}
                      </span>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('columns.name')}
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:user-rounded-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="text-foreground">
                        {driver.name || '-'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('form.driverRatePerOrderField')}
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:dollar-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="text-foreground">
                        {driver.rate_per_order ?? '-'}
                      </Typography>
                    </Box>
                  </Box>

                  {(driver.vehicle_type || driver.vehicle_number) && (
                    <>
                      {driver.vehicle_type && (
                        <Box className="space-y-2">
                          <Typography variant="body2" className="text-muted-foreground font-medium">
                            {t('form.driverVehicleTypeField')}
                          </Typography>
                          <Box className="flex items-center gap-2">
                            <Iconify icon="solar:delivery-bold" className="text-primary" width={18} />
                            <Typography variant="body1" className="text-foreground capitalize">
                              {driver.vehicle_type}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      {driver.vehicle_number && (
                        <Box className="space-y-2">
                          <Typography variant="body2" className="text-muted-foreground font-medium">
                            {t('form.driverVehicleNumberField')}
                          </Typography>
                          <Box className="flex items-center gap-2">
                            <Iconify icon="solar:card-recive-bold" className="text-primary" width={18} />
                            <Typography variant="body1" className="text-foreground">
                              {driver.vehicle_number}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('columns.createdAt')}
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:calendar-date-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="text-foreground">
                        {driver.created_at}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {(driver.average_rating != null || driver.total_orders != null || driver.completed_orders != null || driver.total_earnings != null) && (
                <>
                  <Separator />
                  {/* Statistics */}
                  <Box>
                    <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Iconify icon="solar:chart-2-bold" width={20} />
                      {t('form.driverStatisticsSection')}
                    </Typography>
                    <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {driver.average_rating != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">{t('form.driverAvgRatingLabel')}</Typography>
                          <Typography variant="h6" className="font-semibold mt-1 flex items-center gap-1">
                            <Iconify icon="solar:star-bold" className="text-amber-500" width={18} />
                            {driver.average_rating}
                          </Typography>
                        </Box>
                      )}
                      {driver.total_orders != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">{t('form.driverTotalOrdersLabel')}</Typography>
                          <Typography variant="h6" className="font-semibold mt-1">{driver.total_orders}</Typography>
                        </Box>
                      )}
                      {driver.completed_orders != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">{t('form.driverCompletedOrdersLabel')}</Typography>
                          <Typography variant="h6" className="font-semibold mt-1">{driver.completed_orders}</Typography>
                        </Box>
                      )}
                      {driver.total_earnings != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">{t('form.driverTotalEarningsLabel')}</Typography>
                          <Typography variant="h6" className="font-semibold mt-1 flex items-center gap-1">
                            <Iconify icon="solar:wallet-money-bold" className="text-primary" width={18} />
                            {driver.total_earnings}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {driver.areas && driver.areas.length > 0 && (
                <>
                  <Separator />
                  {/* Areas */}
                  <Box>
                    <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Iconify icon="solar:map-point-bold" width={20} />
                      {t('form.driverAreasSection')}
                      <Typography variant="body2" className="text-muted-foreground font-normal ml-2">
                        {driver.areas.length === 1
                          ? t('form.driverAreasCountOne', { count: driver.areas.length })
                          : t('form.driverAreasCount', { count: driver.areas.length })}
                      </Typography>
                    </Typography>

                    <Box className="space-y-4">
                      {driver.areas.map((area) => (
                        <Box
                          key={area.id}
                          className="p-4 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <Box className="flex items-start justify-between mb-2">
                            <Typography variant="subtitle2" className="font-semibold text-foreground">
                              {area.name}
                            </Typography>
                          </Box>
                          {area.city && (
                            <Box className="space-y-1 text-sm text-muted-foreground">
                              <Box className="flex items-center gap-2">
                                <Iconify icon="solar:city-bold" className="text-primary" width={16} />
                                <span>{t('form.driverAreaCityLine', { name: area.city.name })}</span>
                              </Box>
                              {area.city.governorate && (
                                <Box className="flex items-center gap-2">
                                  <Iconify icon="solar:global-bold" className="text-primary" width={16} />
                                  <span>{t('form.driverAreaGovernorateLine', { name: area.city.governorate.name })}</span>
                                </Box>
                              )}
                              {area.created_at && (
                                <Box className="flex items-center gap-2">
                                  <Iconify icon="solar:calendar-date-bold" className="text-primary" width={16} />
                                  <span>{t('form.driverAreaCreatedLine', { date: area.created_at })}</span>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

