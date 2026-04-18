import type { BasketItem } from '@/pages/dashboard/baskets/types/basket.types';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchBasketById } from '@/pages/dashboard/baskets/hooks/basket';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Basket Details | Dashboard - ${CONFIG.appName}` };

function formatName(name: unknown): string {
  if (name && typeof name === 'object') {
    const o = name as { en?: string; ar?: string };
    return o.en || o.ar || '—';
  }
  return String(name ?? '—');
}

function itemTitle(item: BasketItem): string {
  if (item.product?.name != null) {
    return typeof item.product.name === 'string'
      ? item.product.name
      : formatTranslated(item.product.name as Parameters<typeof formatTranslated>[0]);
  }
  if (item.shop_product_variant_id) return `#${item.shop_product_variant_id}`;
  return '—';
}

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['table', 'nav']);
  const { data: apiResponse, isLoading, error } = useFetchBasketById(id || '');

  const basket = apiResponse?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !basket) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            {t('errorLoading')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/baskets')}>
            {t('back')}
          </Button>
        </Box>
      </Box>
    );
  }

  const nameStr = formatName(basket.name);
  const catName = basket.category ? formatName(basket.category.name) : '—';
  const discountNum = basket.discount ?? basket.discount_value ?? 0;
  const discountText =
    basket.discount_type === 'percentage' ? `${discountNum}%` : String(discountNum);

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="relative w-full">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/baskets')}
              className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2 rtl:rotate-180" />{' '}
              {t('back')}
            </Button>
            <Box className="mb-2 flex flex-wrap items-center gap-4">
              {basket.image ? (
                <img
                  src={basket.image}
                  alt={nameStr}
                  className="h-16 w-16 rounded-xl border border-border/50 object-cover"
                />
              ) : (
                <Box className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Iconify icon="solar:cart-large-2-bold" className="text-primary" width={32} height={32} />
                </Box>
              )}
              <Box className="min-w-0 flex-1">
                <Typography variant="h4" className="mb-1 font-bold text-foreground">
                  {nameStr}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {catName}
                </Typography>
              </Box>
              {basket.is_active != null ? (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    basket.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                  }`}
                >
                  {basket.is_active ? t('active') : t('inactive')}
                </span>
              ) : null}
              <Button
                variant="contained"
                onClick={() => navigate(`/baskets/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} /> {t('edit')}
              </Button>
            </Box>
          </Box>

          <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">
                {t('orders.pricing')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-3">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.originalPrice')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {basket.original_price ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.discount')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                      {discountText} ({basket.discount_type ?? '—'})
                    </span>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.discountAmount')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {basket.discount_amount ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.finalPrice')}
                  </Typography>
                  <Typography variant="body1" className="font-semibold text-primary">
                    {basket.final_price ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('orders.deliveryPrice')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {basket.delivery_price ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.offerEndsAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {basket.offer_ends_at
                      ? String(basket.offer_ends_at).split('T')[0]
                      : '—'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {basket.items && basket.items.length > 0 ? (
            <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">
                  {t('form.basketItems')}
                </Typography>
                <Box className="space-y-3">
                  {basket.items.map((item, i) => (
                    <Box
                      key={item.id ?? `${item.shop_product_variant_id}-${i}`}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border/50 bg-background p-4"
                    >
                      <Box className="min-w-0">
                        <Typography variant="subtitle2" className="font-semibold">
                          {itemTitle(item)}
                        </Typography>
                        {item.shop_variant?.shop_name ? (
                          <Typography variant="caption" className="text-muted-foreground">
                            {item.shop_variant.shop_name}
                          </Typography>
                        ) : null}
                        {Array.isArray(item.variant) && item.variant.length > 0 ? (
                          <Typography variant="caption" className="mt-1 block text-muted-foreground">
                            {item.variant.map((v) => String(v)).join(' · ')}
                          </Typography>
                        ) : null}
                      </Box>
                      <Box className="text-end text-sm">
                        <div>
                          {t('form.quantity')}: {item.quantity}
                        </div>
                        {item.unit_price != null ? (
                          <div className="text-muted-foreground">
                            {t('columns.originalPrice')}: {item.unit_price}
                          </div>
                        ) : null}
                        {item.subtotal != null ? (
                          <div className="font-medium">{item.subtotal}</div>
                        ) : null}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </>
  );
}
