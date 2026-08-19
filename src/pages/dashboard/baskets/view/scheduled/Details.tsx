import type { ScheduledBasketData } from '@/pages/dashboard/baskets/types/scheduled-basket.types';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { formatBasketBrandLabel, resolveBasketGalleryUrls } from '@/utils/basket-gallery';
import { resolveShopVariantSaleFields } from '@/shared/api/shop-product-variant.services';
import { useFetchScheduledBasketById } from '@/pages/dashboard/baskets/hooks/scheduled-basket';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

function formatName(name: unknown): string {
  if (name && typeof name === 'object') {
    const o = name as { en?: string; ar?: string };
    return o.en || o.ar || '—';
  }
  return String(name ?? '—');
}

function categorySubtitle(row: ScheduledBasketData): string {
  if (row.categories?.length) {
    return row.categories
      .map((c) => formatTranslated(c.name as Parameters<typeof formatTranslated>[0]))
      .filter(Boolean)
      .join(' · ');
  }
  const cat = row.category;
  if (typeof cat === 'string') return cat;
  if (cat && typeof cat === 'object' && 'name' in cat) {
    return formatTranslated((cat as { name: unknown }).name as Parameters<typeof formatTranslated>[0]);
  }
  return '—';
}

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['table', 'nav']);
  const { data: apiResponse, isLoading, error } = useFetchScheduledBasketById(id || '');

  const scheduledBasket = apiResponse?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !scheduledBasket) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            {t('form.scheduledBasketDetailsErrorTitle')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/scheduled-baskets')}>
            {t('form.scheduledBasketDetailsBack')}
          </Button>
        </Box>
      </Box>
    );
  }

  const nameStr = formatName(scheduledBasket.name);
  const catName = categorySubtitle(scheduledBasket);
  const headerGallery = resolveBasketGalleryUrls(scheduledBasket);
  const discountText =
    scheduledBasket.discount_type === 'percentage' ? `${scheduledBasket.discount}%` : `${scheduledBasket.discount}`;

  return (
    <>
      <title>{t('form.scheduledBasketDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="relative w-full">
          <Box className="mb-6">
            <Button variant="text" onClick={() => navigate('/scheduled-baskets')} className="-ml-2 mb-4 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2 rtl:rotate-180" />{' '}
              {t('form.scheduledBasketDetailsBack')}
            </Button>
            <Box className="mb-2 flex items-center gap-4">
              {headerGallery.length > 0 ? (
                <Box className="flex flex-wrap gap-2">
                  {headerGallery.map((u) => (
                    <img key={u} src={u} alt={nameStr} className="h-16 w-16 rounded-xl object-cover border border-border/50" />
                  ))}
                </Box>
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
                <Iconify icon="solar:pen-bold" width={18} /> {t('edit')}
              </Button>
            </Box>
          </Box>

          {/* Pricing Info */}
          <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">{t('orders.pricing')}</Typography>
              <Box className="grid gap-4 sm:grid-cols-3">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.originalPrice')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">{scheduledBasket.original_price ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('columns.discount')}</Typography>
                  <Typography variant="body1" className="font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-medium">
                      {discountText} ({scheduledBasket.discount_type})
                    </span>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('form.discountAmount')}</Typography>
                  <Typography variant="body1" className="font-medium">{scheduledBasket.discount_amount ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('columns.finalPrice')}</Typography>
                  <Typography variant="body1" className="font-semibold text-primary">{scheduledBasket.final_price ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('orders.deliveryPrice')}</Typography>
                  <Typography variant="body1" className="font-medium">{scheduledBasket.delivery_price ?? '—'}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Stats */}
          <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">
                {t('statistics', { ns: 'nav' })}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-4">
                <Box className="rounded-xl border border-border/50 bg-background p-3 text-center">
                  <Typography variant="caption" className="text-muted-foreground">{t('columns.rating')}</Typography>
                  <Typography variant="h5" className="font-bold">
                    {scheduledBasket.average_rating ?? scheduledBasket.rating ?? '—'}
                    {(scheduledBasket.average_rating ?? scheduledBasket.rating) != null && <span className="text-yellow-500 ml-1">★</span>}
                  </Typography>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-background p-3 text-center">
                  <Typography variant="caption" className="text-muted-foreground">{t('columns.numSold')}</Typography>
                  <Typography variant="h5" className="font-bold">{scheduledBasket.num_sold ?? '—'}</Typography>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-background p-3 text-center">
                  <Typography variant="caption" className="text-muted-foreground">{t('columns.varieties')}</Typography>
                  <Typography variant="h5" className="font-bold">{scheduledBasket.num_varieties ?? '—'}</Typography>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-background p-3 text-center">
                  <Typography variant="caption" className="text-muted-foreground">{t('columns.scheduleCount')}</Typography>
                  <Typography variant="h5" className="font-bold">{scheduledBasket.schedule_count ?? '—'}</Typography>
                </Box>
              </Box>
              <Box className="mt-4 flex flex-wrap gap-4 text-sm">
                <span>
                  <span className="text-muted-foreground">{t('form.scheduledBasketDetailsIsSchedule')}: </span>
                  {scheduledBasket.is_schedule ? t('yes') : t('no')}
                </span>
                <span>
                  <span className="text-muted-foreground">{t('form.scheduledBasketDetailsHasSchedule')}: </span>
                  {scheduledBasket.has_schedule ? t('yes') : t('no')}
                </span>
              </Box>
            </Box>
          </Box>

          {/* Delivery schedules (API: schedules[]) */}
          {scheduledBasket.schedules && scheduledBasket.schedules.length > 0 && (
            <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">
                  {t('form.scheduleSection')}
                </Typography>
                <Box className="space-y-4">
                  {scheduledBasket.schedules.map((sch) => (
                    <Box key={sch.id ?? `${sch.number_of_days}-${formatName(sch.title)}`} className="rounded-xl border border-border/50 bg-background p-4">
                      <Typography variant="subtitle1" className="font-semibold">{formatName(sch.title)}</Typography>
                      <Box className="mt-2 grid gap-2 sm:grid-cols-2 text-sm">
                        <span>
                          <span className="text-muted-foreground">{t('form.numberOfDays')}: </span>
                          {sch.number_of_days}
                        </span>
                        <span>
                          <span className="text-muted-foreground">{t('form.scheduleDiscountType')}: </span>
                          {sch.discount_type ? `${sch.discount_type} ${sch.discount_value ?? ''}` : '—'}
                        </span>
                        <span>
                          <span className="text-muted-foreground">{t('form.scheduleActive')}: </span>
                          {sch.is_active ? t('active') : t('inactive')}
                        </span>
                        {sch.is_default != null && (
                          <span>
                            <span className="text-muted-foreground">{t('form.scheduledBasketDetailsDefault')}: </span>
                            {sch.is_default ? t('yes') : t('no')}
                          </span>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* Badges */}
          {scheduledBasket.badges && scheduledBasket.badges.length > 0 && (
            <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">{t('badges')}</Typography>
                <Box className="flex flex-wrap gap-3">
                  {scheduledBasket.badges.map((b) => (
                    <Box key={b.id} className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-2">
                      {b.icon ? <img src={b.icon} alt="" className="h-8 w-8 rounded object-cover" /> : null}
                      <Box>
                        <Typography variant="body2" className="font-medium">{b.name ?? `#${b.id}`}</Typography>
                        <Typography variant="caption" className="text-muted-foreground">{b.position}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* Line items (required + extras) */}
          {scheduledBasket.items && scheduledBasket.items.length > 0 && (
            <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">
                  {t('form.scheduledBasketDetailsItemsHeading', { count: scheduledBasket.items.length })}
                </Typography>
                <Box className="space-y-4">
                  {scheduledBasket.items.map((item, i) => (
                    <Box key={item.id ?? i} className="rounded-xl border border-border/50 bg-background p-4">
                      <Box className="flex flex-wrap items-start justify-between gap-2">
                        <Box>
                          <Typography variant="subtitle2" className="font-semibold">
                            {formatName(item.product?.name) || t('variantNumber', { id: item.shop_product_variant_id })}
                          </Typography>
                          {formatBasketBrandLabel(item.brand ?? item.product?.brand) ? (
                            <Typography variant="caption" className="text-muted-foreground">
                              {formatBasketBrandLabel(item.brand ?? item.product?.brand)}
                            </Typography>
                          ) : null}
                          {item.variant?.attributes && item.variant.attributes.length > 0 ? (
                            <Typography variant="caption" className="mt-1 block text-muted-foreground">
                              {item.variant.attributes.map((a) => `${a.name}: ${a.value}`).join(' · ')}
                            </Typography>
                          ) : null}
                          <Typography variant="caption" className="mt-1 block font-mono text-muted-foreground">
                            {t('form.productSku')}: {item.variant?.sku ?? '—'} · {t('form.productModel')}:{' '}
                            {item.variant?.model ?? '—'} · {t('form.productBarcode')}: {item.variant?.barcode ?? '—'}
                          </Typography>
                          {item.shop_variant ? (
                            <Typography variant="caption" className="mt-1 block text-muted-foreground">
                              {(() => {
                                const sale = resolveShopVariantSaleFields({
                                  shop_variant: item.shop_variant,
                                });
                                return `${t('form.priceLabel')}: ${sale.price ?? '—'} · ${t('columns.discount')}: ${sale.discount ?? '—'} · ${t('columns.priceAfterDiscount')}: ${sale.price_after_discount ?? '—'}`;
                              })()}
                            </Typography>
                          ) : null}
                        </Box>
                        <Box className="text-end text-sm">
                          <div>
                            {t('form.scheduledBasketDetailsQty')} {item.quantity}
                          </div>
                          {item.unit_price != null && (
                            <div className="text-muted-foreground">
                              {t('form.scheduledBasketDetailsUnit')} {item.unit_price}
                            </div>
                          )}
                          {item.subtotal != null && (
                            <div className="font-medium">
                              {t('form.scheduledBasketDetailsSubtotal')} {item.subtotal}
                            </div>
                          )}
                        </Box>
                      </Box>
                      <Box className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded bg-muted px-2 py-0.5">
                          {t('form.scheduledBasketDetailsRequiredFlag')}: {item.is_required ? t('yes') : t('no')}
                        </span>
                        <span className="rounded bg-muted px-2 py-0.5">
                          {t('form.scheduledBasketDetailsExtraFlag')}: {item.is_extra ? t('yes') : t('no')}
                        </span>
                        {item.min_quantity != null && (
                          <span className="rounded bg-muted px-2 py-0.5">
                            {t('form.scheduledBasketDetailsMin')} {item.min_quantity}
                          </span>
                        )}
                        {item.max_quantity != null && (
                          <span className="rounded bg-muted px-2 py-0.5">
                            {t('form.scheduledBasketDetailsMax')} {item.max_quantity}
                          </span>
                        )}
                      </Box>
                      {item.alternatives && item.alternatives.length > 0 && (
                        <Box className="mt-3 border-t border-border/40 pt-3">
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.scheduledBasketDetailsAlternatives')}
                          </Typography>
                          <Box className="mt-1 flex flex-wrap gap-2">
                            {item.alternatives.map((alt) => (
                              <span key={alt.shop_product_variant_id} className="rounded-md border border-border/50 px-2 py-1 text-xs">
                                {alt.name || `#${alt.shop_product_variant_id}`}
                                {formatBasketBrandLabel(alt.brand ?? alt.product?.brand)
                                  ? ` · ${formatBasketBrandLabel(alt.brand ?? alt.product?.brand)}`
                                  : ''}
                                {alt.price != null ? ` — ${t('form.priceLabel')}: ${alt.price}` : ''}
                                {alt.discount != null ? ` · ${t('columns.discount')}: ${alt.discount}` : ''}
                                {alt.price_after_discount != null
                                  ? ` · ${t('columns.priceAfterDiscount')}: ${alt.price_after_discount}`
                                  : ''}
                              </span>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* Extras (when API returns separately) */}
          {scheduledBasket.extras && scheduledBasket.extras.length > 0 && (
            <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">
                  {t('form.scheduledBasketDetailsExtrasHeading', { count: scheduledBasket.extras.length })}
                </Typography>
                <Box className="space-y-3">
                  {scheduledBasket.extras.map((item, i) => (
                    <Box key={item.id ?? `ex-${i}`} className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-3">
                      <Typography variant="subtitle2" className="font-semibold">
                        {formatName(item.product?.name) || t('variantNumber', { id: item.shop_product_variant_id })}
                      </Typography>
                      <Typography variant="body2" className="text-muted-foreground">
                        {t('form.scheduledBasketDetailsQty')}: {item.quantity}
                      </Typography>
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
