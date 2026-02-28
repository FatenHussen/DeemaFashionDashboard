import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchBasketById } from '@/pages/dashboard/baskets/hooks/basket';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Basket Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: basketResponse, isLoading, error } = useFetchBasketById(id || '');

  const basket = basketResponse?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !basket) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">Error Loading Basket</Typography>
          <Button variant="outlined" onClick={() => navigate('/baskets')}>Back to Baskets</Button>
        </Box>
      </Box>
    );
  }

  const nameStr = typeof basket.name === 'object' ? (basket.name as any)?.en || (basket.name as any)?.ar || '-' : String(basket.name || '-');
  const discountText = basket.discount_type === 'percentage' ? `${basket.discount}%` : `Fixed: ${basket.discount}`;

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="relative mx-auto max-w-4xl">
          <Box className="mb-6">
            <Button variant="text" onClick={() => navigate('/baskets')} className="-ml-2 mb-4 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> Back to Baskets
            </Button>
            <Box className="mb-2 flex items-center gap-4">
              <Box className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Iconify icon="solar:cart-large-2-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="mb-1 font-bold text-foreground">{nameStr}</Typography>
                <Typography variant="body2" className="text-muted-foreground">{discountText} discount</Typography>
              </Box>
              <Button variant="contained" onClick={() => navigate(`/baskets/update/${id}`)} className="gap-2">
                <Iconify icon="solar:pen-bold" width={18} /> Edit
              </Button>
            </Box>
          </Box>

          <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">Basket Information</Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Category</Typography>
                  <Typography variant="body1" className="font-medium">
                    {typeof basket.category?.name === 'object' ? (basket.category.name as any)?.en : basket.category?.name || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Discount</Typography>
                  <Typography variant="body1" className="font-medium">{discountText}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Offer Ends At</Typography>
                  <Typography variant="body1" className="font-medium">{basket.offer_ends_at || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Delivery Price</Typography>
                  <Typography variant="body1" className="font-medium">{basket.delivery_price ?? '-'}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {basket.items?.length > 0 && (
            <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">Items ({basket.items.length})</Typography>
                <Box className="space-y-3">
                  {basket.items.map((item, i) => (
                    <Box key={i} className="flex items-center gap-4 rounded-xl border border-border/50 bg-background p-3">
                      <Box className="flex-1">
                        <Typography variant="subtitle2" className="font-semibold">
                          {typeof item.product?.name === 'object' ? (item.product.name as any)?.en || (item.product.name as any)?.ar : item.product?.name || `Variant #${item.shop_product_variant_id}`}
                        </Typography>
                      </Box>
                      <Typography variant="body2" className="text-muted-foreground">Qty: {item.quantity}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
