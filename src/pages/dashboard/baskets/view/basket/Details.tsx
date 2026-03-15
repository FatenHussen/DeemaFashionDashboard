import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchBasketById } from '@/pages/dashboard/baskets/hooks/basket';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Basket Details | Dashboard - ${CONFIG.appName}` };

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box className="space-y-1">
      <Typography variant="caption" className="text-muted-foreground font-medium">{label}</Typography>
      <Typography variant="body1" className="font-medium">{value ?? '-'}</Typography>
    </Box>
  );
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
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
  const discountVal = basket.discount ?? basket.discount_value ?? '';
  const discountText = basket.discount_type === 'percentage' ? `${discountVal}%` : discountVal ? `Fixed: ${discountVal}` : '-';
  const categoryName = typeof basket.category?.name === 'object' ? (basket.category.name as any)?.en || (basket.category.name as any)?.ar : basket.category?.name;
  const imageUrl = basket.image
    ? (String(basket.image).startsWith('http') ? basket.image : `${CONFIG.serverUrl}/${basket.image}`)
    : null;

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
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={nameStr}
                  className="h-16 w-16 rounded-xl object-cover border border-primary/20"
                />
              ) : (
                <Box className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Iconify icon="solar:cart-large-2-bold" className="text-primary" width={32} height={32} />
                </Box>
              )}
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
              <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow label={t('columns.category')} value={categoryName} />
                <DetailRow label={t('columns.discount')} value={discountText} />
                <DetailRow label={t('form.offerEndsAt')} value={basket.offer_ends_at} />
                <DetailRow label={t('form.deliveryPrice')} value={basket.delivery_price != null ? basket.delivery_price : undefined} />
                <DetailRow label={t('form.originalPrice')} value={basket.original_price != null ? basket.original_price : undefined} />
                <DetailRow label={t('form.discountAmount')} value={basket.discount_amount != null ? basket.discount_amount : undefined} />
                <DetailRow label={t('form.finalPrice')} value={basket.final_price != null ? basket.final_price : undefined} />
                <DetailRow label={t('form.numVarieties')} value={basket.num_varieties} />
                <DetailRow label={t('form.itemsCount')} value={basket.items?.length ?? basket.items_count} />
                <DetailRow label={t('columns.rating')} value={basket.rating} />
                <DetailRow label={t('form.averageRating')} value={basket.average_rating} />
                <DetailRow label={t('form.numSold')} value={basket.num_sold} />
                <DetailRow label={t('form.onOffer')} value={basket.is_on_offer != null ? (basket.is_on_offer ? t('yes') : t('no')) : undefined} />
                <DetailRow label={t('form.scheduled')} value={basket.is_schedule != null ? (basket.is_schedule ? t('yes') : t('no')) : undefined} />
                <DetailRow label={t('columns.created')} value={basket.created_at ? new Date(basket.created_at).toLocaleString() : undefined} />
                <DetailRow label={t('columns.updatedAt')} value={basket.updated_at ? new Date(basket.updated_at).toLocaleString() : undefined} />
              </Box>
            </Box>
          </Box>

          {basket.items && basket.items.length > 0 && (
            <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">Items ({basket.items.length})</Typography>
                <Box className="space-y-3">
                  {basket.items.map((item, i) => {
                    const productName = typeof item.product?.name === 'object'
                      ? (item.product.name as any)?.en || (item.product.name as any)?.ar
                      : item.product?.name;
                    const shopName = item.shop_variant?.shop_name;
                    const unitPrice = item.unit_price;
                    const subtotal = item.subtotal;
                    return (
                      <Box key={item.id ?? i} className="flex flex-wrap items-center gap-4 rounded-xl border border-border/50 bg-background p-4">
                        {item.product?.image && (
                          <img
                            src={String(item.product.image).startsWith('http') ? item.product.image : `${CONFIG.serverUrl}/${item.product.image}`}
                            alt={String(productName || '')}
                            className="h-12 w-12 rounded-lg object-cover border border-border/60"
                          />
                        )}
                        <Box className="flex-1 min-w-0">
                          <Typography variant="subtitle2" className="font-semibold">{productName || `Variant #${item.shop_product_variant_id}`}</Typography>
                          {shopName && <Typography variant="caption" className="text-muted-foreground">{shopName}</Typography>}
                          {item.variant?.length ? <Typography variant="caption" className="text-muted-foreground ml-1">({item.variant.join(', ')})</Typography> : null}
                        </Box>
                        <Box className="flex items-center gap-4">
                          <Typography variant="body2" className="text-muted-foreground">Qty: {item.quantity}</Typography>
                          {unitPrice != null && <Typography variant="body2">Unit: {unitPrice}</Typography>}
                          {subtotal != null && <Typography variant="body2" className="font-medium">Subtotal: {subtotal}</Typography>}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
