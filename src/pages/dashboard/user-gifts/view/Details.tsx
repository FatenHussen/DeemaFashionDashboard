import type { UserGiftStatus } from '@/pages/dashboard/user-gifts/types/user-gift.types';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  useUpdateUserGift,
  useDeleteUserGift,
  useFetchUserGiftById,
} from '@/pages/dashboard/user-gifts/hooks/user-gift';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `User Gift Details | Dashboard - ${CONFIG.appName}` };

const toStr = (val: string | { ar?: string; en?: string } | undefined): string => {
  if (!val) return '-';
  if (typeof val === 'string') return val;
  return val.en || val.ar || '-';
};

const STATUS_OPTIONS: UserGiftStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchUserGiftById(id || '');
  const updateMutation = useUpdateUserGift();
  const deleteMutation = useDeleteUserGift();

  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">
            Error Loading User Gift
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/user-gifts')}>
            Back to User Gifts
          </Button>
        </Box>
      </Box>
    );
  }

  const handleStatusUpdate = async (status: UserGiftStatus) => {
    try {
      await updateMutation.mutateAsync({ id: item.id, data: { status } });
      toast.success(`Status updated to ${status} successfully`);
    } catch {
      return;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this user gift assignment?')) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('User gift deleted successfully');
      navigate('/user-gifts');
    } catch {
      return;
    }
  };

  const statusColor =
    item.status === 'delivered'
      ? 'bg-green-500/20 text-green-600'
      : item.status === 'cancelled'
        ? 'bg-red-500/20 text-red-600'
        : item.status === 'shipped'
          ? 'bg-blue-500/20 text-blue-600'
          : item.status === 'processing'
            ? 'bg-amber-500/20 text-amber-600'
            : 'bg-yellow-500/20 text-yellow-600';

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/user-gifts')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to User Gifts
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              {item.gift?.image ? (
                <img
                  src={item.gift.image}
                  alt={toStr(item.gift?.name)}
                  className="w-16 h-16 rounded-xl object-cover border border-border"
                />
              ) : (
                <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify icon="solar:gift-bold" className="text-primary" width={32} height={32} />
                </Box>
              )}
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {toStr(item.gift?.name)}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  Assigned to {item.user?.name ?? '-'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="gap-2"
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                Delete
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Gift Information
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Gift
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {toStr(item.gift?.name)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Points Required
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.gift?.points_required ?? '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    User
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.user?.name ?? '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    User Phone
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.user?.phone ?? '-'}
                  </Typography>
                </Box>
                {item.user?.email && (
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      User Email
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {item.user.email}
                    </Typography>
                  </Box>
                )}
                {item.address && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">
                      Delivery Address
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {item.address.full_address ?? '-'}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Status
                  </Typography>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                    {item.status?.charAt(0)?.toUpperCase() + item.status?.slice(1)}
                  </span>
                </Box>
                {item.delivered_at && (
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      Delivered At
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {new Date(item.delivered_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                <Box className="sm:col-span-2">
                  <Typography variant="caption" className="text-muted-foreground">
                    Created At
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}
                  </Typography>
                </Box>
                {item.admin_notes && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">
                      Admin Notes
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {item.admin_notes}
                    </Typography>
                  </Box>
                )}
                {item.user_notes && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">
                      User Notes
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {item.user_notes}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Separator />

            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Update Status
              </Typography>
              <Box className="flex flex-wrap gap-3">
                {STATUS_OPTIONS.map((status) => (
                  <Button
                    key={status}
                    variant={item.status === status ? 'contained' : 'outlined'}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updateMutation.isPending || item.status === status}
                    className="gap-2"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </Box>
              {updateMutation.isPending && (
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
