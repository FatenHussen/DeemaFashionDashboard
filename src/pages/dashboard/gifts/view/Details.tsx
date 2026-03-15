import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchGiftById } from '@/pages/dashboard/gifts/hooks/gift';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Gift Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchGiftById(id || '');
  const item = response?.data;
  const toStr = (val: string | { ar?: string; en?: string } | undefined) =>
    typeof val === 'object' ? val?.en || val?.ar || '-' : String(val || '-');

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">Error Loading Gift</Typography>
          <Button variant="outlined" onClick={() => navigate('/gifts')}>Back to Gifts</Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button variant="text" onClick={() => navigate('/gifts')} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> Back to Gifts
            </Button>
            <Box className="flex items-center gap-4 mb-2">
              {item.image ? (
                <img
                  src={item.image}
                  alt={toStr(item.name)}
                  className="w-16 h-16 rounded-xl object-cover border border-border"
                />
              ) : (
                <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify icon="solar:gift-bold" className="text-primary" width={32} height={32} />
                </Box>
              )}
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">{toStr(item.name)}</Typography>
                <Typography variant="body2" className="text-muted-foreground">{item.points_required} points required</Typography>
              </Box>
              <Button variant="contained" onClick={() => navigate(`/gifts/update/${id}`)} className="gap-2">
                <Iconify icon="solar:pen-bold" width={18} /> Edit
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">Gift Information</Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Name</Typography>
                  <Typography variant="body1" className="font-medium">{toStr(item.name)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Points Required</Typography>
                  <Typography variant="body1" className="font-medium">{item.points_required}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Stock Quantity</Typography>
                  <Typography variant="body1" className="font-medium">{item.stock_quantity}</Typography>
                </Box>
                {item.exchanges_count != null && (
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">Exchanges Count</Typography>
                    <Typography variant="body1" className="font-medium">{item.exchanges_count}</Typography>
                  </Box>
                )}
                {item.shop_product_variant_id != null && (
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">Shop Product Variant ID</Typography>
                    <Typography variant="body1" className="font-medium">{item.shop_product_variant_id}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Status</Typography>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </Box>
                {item.description && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">Description</Typography>
                    <Typography variant="body1" className="font-medium">{toStr(item.description)}</Typography>
                  </Box>
                )}
                {item.terms_conditions && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">Terms & Conditions</Typography>
                    <Typography variant="body1" className="font-medium">{toStr(item.terms_conditions)}</Typography>
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
