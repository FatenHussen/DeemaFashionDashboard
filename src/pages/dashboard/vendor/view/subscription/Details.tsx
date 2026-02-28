import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchVendorSubscriptionById } from '@/pages/dashboard/vendor/hooks/vendor-subscription';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Vendor Subscription Details | Dashboard - ${CONFIG.appName}` };

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-600',
  expired: 'bg-red-500/20 text-red-600',
  cancelled: 'bg-neutral-500/20 text-neutral-600',
  pending: 'bg-yellow-500/20 text-yellow-600',
};

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchVendorSubscriptionById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            Error Loading Subscription
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/vendor-subscriptions')}>
            Back to Subscriptions
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="relative mx-auto max-w-4xl">
          {/* Header */}
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/vendor-subscriptions')}
              className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Subscriptions
            </Button>

            <Box className="mb-2 flex items-center gap-4">
              <Box className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Iconify icon="solar:card-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="mb-1 font-bold text-foreground">
                  {item.shop.name}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {item.package.name}
                </Typography>
              </Box>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[item.status] ?? STATUS_COLORS.pending}`}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </Box>
          </Box>

          {/* Subscription Info */}
          <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">
                Subscription Details
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Shop</Typography>
                  <Typography variant="body1" className="font-medium">{item.shop.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Package</Typography>
                  <Typography variant="body1" className="font-medium">{item.package.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Starts At</Typography>
                  <Typography variant="body1" className="font-medium">{item.starts_at}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Ends At</Typography>
                  <Typography variant="body1" className="font-medium">{item.ends_at}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Auto Renew</Typography>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.auto_renew ? 'bg-blue-500/20 text-blue-600' : 'bg-muted text-muted-foreground'}`}
                  >
                    {item.auto_renew ? 'Yes' : 'No'}
                  </span>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Status</Typography>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status] ?? STATUS_COLORS.pending}`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </Box>
                {item.notified_at && (
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">Notified At</Typography>
                    <Typography variant="body1" className="font-medium">{item.notified_at}</Typography>
                  </Box>
                )}
                {item.notes && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">Notes</Typography>
                    <Typography variant="body1" className="font-medium">{item.notes}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Package Info */}
          <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">
                Package Details
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Package Name</Typography>
                  <Typography variant="body1" className="font-medium">{item.package.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Max Products</Typography>
                  <Typography variant="body1" className="font-medium">{item.package.max_products}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Commission Rate</Typography>
                  <Typography variant="body1" className="font-medium">{item.package.commission_rate}%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Created At</Typography>
                  <Typography variant="body1" className="font-medium">{item.created_at}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
