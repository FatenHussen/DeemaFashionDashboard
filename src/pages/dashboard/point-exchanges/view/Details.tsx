import type { PointExchangeStatus } from '@/pages/dashboard/point-exchanges/types/point-exchange.types';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  useFetchPointExchangeById,
  useUpdatePointExchangeStatus,
} from '@/pages/dashboard/point-exchanges/hooks/point-exchange';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Point Exchange Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exchangeResponse, isLoading, error } = useFetchPointExchangeById(id || '');
  const updateStatusMutation = useUpdatePointExchangeStatus();
  const [selectedStatus, setSelectedStatus] = useState<PointExchangeStatus | ''>('');

  const exchange = exchangeResponse?.data;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !exchange) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              Error Loading Point Exchange
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load point exchange information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/point-exchanges')}>
            Back to Point Exchanges
          </Button>
        </Box>
      </Box>
    );
  }

  const handleStatusUpdate = async (status: PointExchangeStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: exchange.id, data: { status } });
      toast.success(`Status updated to ${status} successfully`);
      setSelectedStatus('');
    } catch {}
  };

  const statusColor =
    exchange.status === 'approved'
      ? 'bg-green-500/20 text-green-600'
      : exchange.status === 'rejected'
        ? 'bg-red-500/20 text-red-600'
        : 'bg-yellow-500/20 text-yellow-600';

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
              onClick={() => navigate('/point-exchanges')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Point Exchanges
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify
                  icon="solar:point-on-map-bold"
                  className="text-primary"
                  width={32}
                  height={32}
                />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  Point Exchange #{exchange.id}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {exchange.user?.name ?? '-'} - {exchange.points} points
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Exchange Information
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    User Name
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {exchange.user?.name ?? '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    User Email
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {exchange.user?.email ?? '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Points
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {exchange.points}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Status
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                    >
                      {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                    </span>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Created At
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {exchange.created_at
                      ? new Date(exchange.created_at).toLocaleString()
                      : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Updated At
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {exchange.updated_at
                      ? new Date(exchange.updated_at).toLocaleString()
                      : '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Separator />

            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Update Status
              </Typography>
              <Box className="flex flex-wrap gap-3">
                {(['approved', 'rejected', 'pending'] as PointExchangeStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={exchange.status === status ? 'contained' : 'outlined'}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updateStatusMutation.isPending || exchange.status === status}
                    className="gap-2"
                  >
                    <Iconify
                      icon={
                        status === 'approved'
                          ? 'solar:check-circle-bold'
                          : status === 'rejected'
                            ? 'solar:close-circle-bold'
                            : 'solar:clock-circle-bold'
                      }
                      width={18}
                    />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </Box>
              {updateStatusMutation.isPending && (
                <Typography variant="body2" className="text-muted-foreground mt-2">
                  Updating status...
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
