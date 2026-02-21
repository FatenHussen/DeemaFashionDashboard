import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchBrandById } from '@/pages/dashboard/products/hooks/brand';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Brand Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: brandResponse, isLoading, error } = useFetchBrandById(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !brandResponse?.data) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              Error Loading Brand
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load brand information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/products/brands')}>
            Back to Brands
          </Button>
        </Box>
      </Box>
    );
  }

  const brand = brandResponse.data;
  const imageUrl = brand.image ? `${CONFIG.serverUrl}/${brand.image}` : null;

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
              onClick={() => navigate('/products/brands')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Brands
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={brand.name}
                  className="w-16 h-16 rounded-xl object-cover border border-border/60"
                />
              ) : (
                <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:gallery-add-bold"
                    className="text-primary"
                    width={32}
                    height={32}
                  />
                </Box>
              )}
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {brand.name}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  Brand Details
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/products/brands/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                Edit Brand
              </Button>
            </Box>
          </Box>

          {/* Details Card */}
          <Box className="rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-sm overflow-hidden">
            <Box className="p-6 space-y-6">
              {/* Basic Information */}
              <Box>
                <Typography
                  variant="h6"
                  className="font-semibold text-foreground mb-4 flex items-center gap-2"
                >
                  <Iconify icon="solar:info-circle-bold" width={20} />
                  Basic Information
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Brand ID
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{brand.id}</span>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Brand Name
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:flag-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="text-foreground">
                        {brand.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Created At
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify
                        icon="solar:calendar-date-bold"
                        className="text-primary"
                        width={18}
                      />
                      <Typography variant="body1" className="text-foreground">
                        {new Date(brand.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Updated At
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify
                        icon="solar:calendar-date-bold"
                        className="text-primary"
                        width={18}
                      />
                      <Typography variant="body1" className="text-foreground">
                        {new Date(brand.updated_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Separator />

              {/* Brand Image */}
              <Box>
                <Typography
                  variant="h6"
                  className="font-semibold text-foreground mb-4 flex items-center gap-2"
                >
                  <Iconify icon="solar:gallery-add-bold" width={20} />
                  Brand Image
                </Typography>
                {imageUrl ? (
                  <Box className="flex items-center gap-4">
                    <img
                      src={imageUrl}
                      alt={brand.name}
                      className="w-48 h-48 object-cover rounded-lg border border-border/60"
                    />
                  </Box>
                ) : (
                  <Box className="text-center py-8">
                    <Iconify
                      icon="solar:gallery-add-bold"
                      className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2"
                    />
                    <Typography variant="body2" className="text-muted-foreground">
                      No image uploaded for this brand
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
