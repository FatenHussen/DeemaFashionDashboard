import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchDriverById } from '@/pages/dashboard/driver/hooks/driver';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Driver Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
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
              Error Loading Driver
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load driver information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/driver')}>
            Back to Drivers
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

  return (
    <>
      <title>{metadata.title}</title>
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
              Back to Drivers
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:user-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  Driver #{driver.id}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  Driver Details
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/driver/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                Edit Driver
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
                  Basic Information
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Driver ID
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{driver.id}</span>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Phone
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
                      Address
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
                      Status
                    </Typography>
                    <Box className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}>
                      <Iconify
                        icon={driver.status === 'available' ? 'solar:check-circle-bold' : driver.status === 'busy' ? 'solar:clock-circle-bold' : 'solar:close-circle-bold'}
                        width={14}
                        height={14}
                      />
                      <span className="text-xs font-medium capitalize">{driver.status}</span>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Active Status
                    </Typography>
                    <Box
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${
                        driver.is_active === 1
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
                      }`}
                    >
                      <Iconify
                        icon={driver.is_active === 1 ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                        width={14}
                        height={14}
                      />
                      <span className="text-xs font-medium">{driver.is_active === 1 ? 'Active' : 'Inactive'}</span>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Rate per Order
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:dollar-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="text-foreground">
                        {driver.rate_per_order}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Created At
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

              {driver.areas && driver.areas.length > 0 && (
                <>
                  <Separator />
                  {/* Areas */}
                  <Box>
                    <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Iconify icon="solar:map-point-bold" width={20} />
                      Areas
                      <Typography variant="body2" className="text-muted-foreground font-normal ml-2">
                        ({driver.areas.length} area{driver.areas.length !== 1 ? 's' : ''})
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
                          <Box className="space-y-1 text-sm text-muted-foreground">
                            <Box className="flex items-center gap-2">
                              <Iconify icon="solar:city-bold" className="text-primary" width={16} />
                              <span>
                                City: {area.city.name}
                              </span>
                            </Box>
                            <Box className="flex items-center gap-2">
                              <Iconify icon="solar:global-bold" className="text-primary" width={16} />
                              <span>
                                Governorate: {area.city.governorate.name}
                              </span>
                            </Box>
                            <Box className="flex items-center gap-2">
                              <Iconify icon="solar:calendar-date-bold" className="text-primary" width={16} />
                              <span>
                                Created: {area.created_at}
                              </span>
                            </Box>
                          </Box>
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

