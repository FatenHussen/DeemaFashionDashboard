import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchSubscriptionById } from '@/pages/dashboard/subscriptions/hooks/subscription';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Subscription Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchSubscriptionById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">Error Loading Subscription</Typography>
          <Button variant="outlined" onClick={() => navigate('/subscriptions')}>Back to Subscriptions</Button>
        </Box>
      </Box>
    );
  }

  const pkgName = typeof item.package?.name === 'object' ? (item.package.name as any)?.en || (item.package.name as any)?.ar : item.package?.name;

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button variant="text" onClick={() => navigate('/subscriptions')} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> Back to Subscriptions
            </Button>
            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:card-recive-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">Subscription #{item.id}</Typography>
                <Typography variant="body2" className="text-muted-foreground">{item.user?.name || `User #${item.user_id}`}</Typography>
              </Box>
              <Button variant="contained" onClick={() => navigate(`/subscriptions/update/${id}`)} className="gap-2">
                <Iconify icon="solar:pen-bold" width={18} /> Edit
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">Subscription Information</Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">User</Typography>
                  <Typography variant="body1" className="font-medium">{item.user?.name || `User #${item.user_id}`}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Package</Typography>
                  <Typography variant="body1" className="font-medium">{pkgName || `Package #${item.package_id}`}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Start Date</Typography>
                  <Typography variant="body1" className="font-medium">{item.start_date ? new Date(item.start_date).toLocaleDateString() : '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">End Date</Typography>
                  <Typography variant="body1" className="font-medium">{item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Status</Typography>
                  <Typography variant="body1" className="font-medium capitalize">{item.status}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Active</Typography>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
