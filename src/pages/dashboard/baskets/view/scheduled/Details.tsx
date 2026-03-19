import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchScheduledBasketById } from '@/pages/dashboard/baskets/hooks/scheduled-basket';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Scheduled Basket Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('table');
  const { data: scheduledBasketResponse, isLoading, error } = useFetchScheduledBasketById(id || '');

  const scheduledBasket = scheduledBasketResponse?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !scheduledBasket) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">Error Loading Scheduled Basket</Typography>
          <Button variant="outlined" onClick={() => navigate('/scheduled-baskets')}>Back to Scheduled Baskets</Button>
        </Box>
      </Box>
    );
  }

  const nameStr = typeof scheduledBasket.name === 'object' ? (scheduledBasket.name as any)?.en || (scheduledBasket.name as any)?.ar || '—' : String(scheduledBasket.name || '—');
  const catName = scheduledBasket.category
    ? typeof scheduledBasket.category.name === 'object'
      ? (scheduledBasket.category.name as any)?.en || (scheduledBasket.category.name as any)?.ar
      : scheduledBasket.category.name
    : '—';
  const discountText = scheduledBasket.discount_type === 'percentage' ? `${scheduledBasket.discount}%` : `${scheduledBasket.discount}`;

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="relative mx-auto max-w-4xl">
          <Box className="mb-6">
            <Button variant="text" onClick={() => navigate('/scheduled-baskets')} className="-ml-2 mb-4 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> Back to Scheduled Baskets
            </Button>
            <Box className="mb-2 flex items-center gap-4">
              {scheduledBasket.image ? (
                <img src={scheduledBasket.image} alt={nameStr} className="h-16 w-16 rounded-xl object-cover border border-border/50" />
              ) : (
                <Box className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Iconify icon="solar:calendar-bold" className="text-primary" width={32} height={32} />
                </Box>
              )}
              <Box className="flex-1">
                <Typography variant="h4" className="mb-1 font-bold text-foreground">{nameStr}</Typography>
                <Typography variant="body2" className="text-muted-foreground">{catName}</Typography>
              </Box>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  scheduledBasket.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                }`}
              >
                {scheduledBasket.is_active ? t('active') : t('inactive')}
              </span>
              <Button variant="contained" onClick={() => navigate(`/scheduled-baskets/update/${id}`)} className="gap-2">
                <Iconify icon="solar:pen-bold" width={18} /> Edit
              </Button>
            </Box>
          </Box>

          {/* Pricing Info */}
          <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">Pricing</Typography>
              <Box className="grid gap-4 sm:grid-cols-3">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Original Price</Typography>
                  <Typography variant="body1" className="font-medium">{scheduledBasket.original_price ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Discount</Typography>
                  <Typography variant="body1" className="font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-medium">{discountText} ({scheduledBasket.discount_type})</span>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Discount Amount</Typography>
                  <Typography variant="body1" className="font-medium">{scheduledBasket.discount_amount ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Final Price</Typography>
                  <Typography variant="body1" className="font-semibold text-primary">{scheduledBasket.final_price ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Delivery Price</Typography>
                  <Typography variant="body1" className="font-medium">{scheduledBasket.delivery_price ?? '—'}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Stats */}
          <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">Statistics</Typography>
              <Box className="grid gap-4 sm:grid-cols-4">
                <Box className="rounded-xl border border-border/50 bg-background p-3 text-center">
                  <Typography variant="caption" className="text-muted-foreground">Rating</Typography>
                  <Typography variant="h5" className="font-bold">
                    {scheduledBasket.average_rating ?? scheduledBasket.rating ?? '—'}
                    {(scheduledBasket.average_rating ?? scheduledBasket.rating) != null && <span className="text-yellow-500 ml-1">★</span>}
                  </Typography>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-background p-3 text-center">
                  <Typography variant="caption" className="text-muted-foreground">Sold</Typography>
                  <Typography variant="h5" className="font-bold">{scheduledBasket.num_sold ?? '—'}</Typography>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-background p-3 text-center">
                  <Typography variant="caption" className="text-muted-foreground">Varieties</Typography>
                  <Typography variant="h5" className="font-bold">{scheduledBasket.num_varieties ?? '—'}</Typography>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-background p-3 text-center">
                  <Typography variant="caption" className="text-muted-foreground">Schedules</Typography>
                  <Typography variant="h5" className="font-bold">{scheduledBasket.schedule_count ?? '—'}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Schedule Info */}
          <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">Schedule Details</Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Is Scheduled</Typography>
                  <Typography variant="body1" className="font-medium">{scheduledBasket.is_schedule ? 'Yes' : 'No'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Has Schedule</Typography>
                  <Typography variant="body1" className="font-medium">{scheduledBasket.has_schedule ? 'Yes' : 'No'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Offer Ends At</Typography>
                  <Typography variant="body1" className="font-medium">{scheduledBasket.offer_ends_at || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Scheduled At</Typography>
                  <Typography variant="body1" className="font-medium">
                    {scheduledBasket.scheduled_at ? new Date(scheduledBasket.scheduled_at).toLocaleString() : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Scheduled End At</Typography>
                  <Typography variant="body1" className="font-medium">
                    {scheduledBasket.scheduled_end_at ? new Date(scheduledBasket.scheduled_end_at).toLocaleString() : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Recurring</Typography>
                  <Typography variant="body1" className="font-medium">
                    {scheduledBasket.is_recurring ? `Yes (${scheduledBasket.recurrence_type || '—'})` : 'No'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Items */}
          {scheduledBasket.items && scheduledBasket.items.length > 0 && (
            <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">Items ({scheduledBasket.items.length})</Typography>
                <Box className="space-y-3">
                  {scheduledBasket.items.map((item, i) => (
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
