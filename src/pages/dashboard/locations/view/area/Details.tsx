import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchAreaById } from '@/pages/dashboard/locations/hooks/area';
import { MapDisplay } from '@/shared/components/map/map-display';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Area Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: area, isLoading, error } = useFetchAreaById(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !area) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              Error Loading Area
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load area information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/locations/area')}>
            Back to Areas
          </Button>
        </Box>
      </Box>
    );
  }

  const baseFee =
    area.base_fee != null ? String(area.base_fee) : '-';

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/locations/area')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Areas
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify
                  icon="solar:map-point-bold"
                  className="text-primary"
                  width={32}
                  height={32}
                />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {area.name}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {area.city?.name} - {area.city?.governorate?.name}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/locations/area/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                Edit
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Area Information
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    City
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {area.city?.name ?? '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Governorate
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {area.city?.governorate?.name ?? '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Base Fee
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {baseFee}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Coordinates
                  </Typography>
                  <Typography variant="body1" className="font-medium font-mono text-sm">
                    {area.lat && area.lng ? `${area.lat}, ${area.lng}` : '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Separator />

            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Map
              </Typography>
              <MapDisplay
                lat={area.lat ?? ''}
                lng={area.lng ?? ''}
                title={area.name}
                height="320px"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
