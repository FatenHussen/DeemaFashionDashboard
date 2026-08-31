import type { ReactNode } from 'react';
import type { DaySchedule } from '@/pages/dashboard/vendor/types/shop.types';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useFetchShopById } from '@/pages/dashboard/vendor/hooks/shop';
import {
  paymentMethodsFromShop,
  normalizeShopTypeFromApi,
  normalizeShopPriceLevelFromApi,
} from '@/pages/dashboard/vendor/types/shop.types';
import {
  ProductDetailsChip,
  ProductDetailsField,
  ProductDetailsSection,
  ProductDetailsFieldGrid,
  ProductDetailsPageShell,
} from '@/pages/dashboard/products/components/product-details-ui';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

function formatWorkingHoursDay(
  schedule: string | DaySchedule | undefined,
  closedLabel: string
): string {
  if (schedule == null) return '-';
  if (typeof schedule === 'string') return schedule || '-';
  const c = schedule.closed;
  const isClosed = c === true || c === 1 || c === '1' || c === 'true';
  if (isClosed) return closedLabel;
  if (schedule.open && schedule.close) return `${schedule.open} - ${schedule.close}`;
  return '-';
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return <ProductDetailsField label={label} value={value} emptyLabel="—" />;
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRestaurantRoute = pathname.startsWith('/restaurants');
  const basePath = isRestaurantRoute ? '/restaurants' : '/shop';
  const { data: response, isLoading, error } = useFetchShopById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;
  if (error || !item) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 shadow-xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Iconify icon="solar:danger-triangle-bold" width={32} />
          </div>
          <Typography variant="h6" className="mb-2 font-bold text-destructive">
            {t('shopDetails.errorTitle')}
          </Typography>
          <Typography variant="body2" className="mb-6 text-muted-foreground">
            {error instanceof Error ? error.message : t('shopDetails.errorBody')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate(basePath)}>
            {isRestaurantRoute ? t('shopDetails.backToRestaurants') : t('shopDetails.backToList')}
          </Button>
        </Box>
      </Box>
    );
  }

  const shopType = normalizeShopTypeFromApi(item);
  const priceLevel = normalizeShopPriceLevelFromApi(item);
  const paymentKeys = paymentMethodsFromShop(item);
  
  const shopTypeLabel =
    shopType === 'restaurant'
      ? t('shopTypeFilterRestaurant')
      : shopType === 'service_provider'
        ? t('shopTypeFilterServiceProvider')
        : t('shopTypeFilterStore');
  const priceLevelLabel =
    priceLevel === 'cheap'
      ? t('form.shopPriceLevelCheap')
      : priceLevel === 'expensive'
        ? t('form.shopPriceLevelExpensive')
        : t('form.shopPriceLevelMedium');

  const WEEKDAYS = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  return (
    <>
      <title>
        {isRestaurantRoute
          ? t('form.restaurantDetailsDocumentTitle', { appName: CONFIG.appName })
          : t('form.shopDetailsDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <ProductDetailsPageShell>
          <Button
            variant="text"
            onClick={() => navigate(basePath)}
            className="mb-3 -ml-2 h-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={18} className="rtl:rotate-180" />
            {isRestaurantRoute ? t('shopDetails.backToRestaurants') : t('shopDetails.backToList')}
          </Button>

          <Box className="relative mb-4 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <Box className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:gap-5 md:p-5">
              <Box className="relative shrink-0">
                {item.logo_url ? (
                  <img
                    src={item.logo_url}
                    alt={formatTranslated(item.name)}
                    className="h-20 w-20 rounded-xl border border-border/60 object-cover sm:h-24 sm:w-24"
                  />
                ) : (
                  <Box className="flex h-20 w-20 items-center justify-center rounded-xl border border-border/60 bg-muted/30 sm:h-24 sm:w-24">
                    <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={36} />
                  </Box>
                )}
              </Box>

              <Box className="min-w-0 flex-1 space-y-3">
                <Box className="flex flex-wrap items-center gap-1.5">
                  <ProductDetailsChip tone="neutral">ID · {id}</ProductDetailsChip>
                  {item.is_open_now ? (
                    <ProductDetailsChip tone="success">{t('columns.openNow')}</ProductDetailsChip>
                  ) : (
                    <ProductDetailsChip tone="danger">{t('closed')}</ProductDetailsChip>
                  )}
                  <ProductDetailsChip tone={item.is_active ? 'info' : 'neutral'}>
                    {item.is_active ? t('active') : t('inactive')}
                  </ProductDetailsChip>
                </Box>

                <Typography variant="h4" className="text-2xl font-bold tracking-tight md:text-3xl">
                  {formatTranslated(item.name)}
                </Typography>
                {item.description ? (
                  <Typography variant="body2" className="max-w-3xl text-muted-foreground">
                    {formatTranslated(item.description)}
                  </Typography>
                ) : null}

                {item.badges && item.badges.length > 0 ? (
                  <Box className="flex flex-wrap gap-1.5">
                    {item.badges.map((badge) => (
                      <ProductDetailsChip key={badge.name} tone="primary">
                        {badge.name}
                      </ProductDetailsChip>
                    ))}
                  </Box>
                ) : null}
              </Box>

              <Button
                variant="contained"
                onClick={() => navigate(`${basePath}/update/${id}`)}
                className="h-10 shrink-0 gap-2 px-5 md:self-start"
              >
                <Iconify icon="solar:pen-bold" width={18} /> {t('edit')}
              </Button>
            </Box>
          </Box>

          <Box className="mb-4">
          <ProductDetailsFieldGrid cols={2}>
            <DetailField label={t('columns.shopType')} value={shopTypeLabel} />
            <DetailField label={t('form.shopPriceLevelLabel')} value={priceLevelLabel} />
            <DetailField
              label={t('form.shopPaymentMethodsLabel')}
              value={
                paymentKeys.length > 0
                  ? paymentKeys
                      .map((k) => {
                        const key = `form.shopPaymentMethod_${k}`;
                        const translated = t(key);
                        return translated === key ? k : translated;
                      })
                      .join(', ')
                  : '—'
              }
            />
            <DetailField
              label={t('columns.rating')}
              value={`${item.average_rating?.toFixed(1) ?? '0.0'} (${t('shopDetails.reviewsCount', { count: item.ratings_count ?? 0 })})`}
            />
          </ProductDetailsFieldGrid>
          </Box>

          <Box className="space-y-4">
            <ProductDetailsSection
              icon="solar:document-text-bold"
              title={t('shopDetails.information')}
            >
              <ProductDetailsFieldGrid cols={2}>
                <DetailField label={t('columns.vendor')} value={formatTranslated(item.vendor?.name) || '—'} />
                <DetailField label={t('columns.email')} value={item.email || '—'} />
                <DetailField label={t('columns.phone')} value={item.phone || '—'} />
                <DetailField label={t('columns.mobile')} value={item.mobile || '—'} />
                <DetailField label={t('columns.address')} value={formatTranslated(item.address) || '—'} />
                {item.area ? (
                  <>
                    <DetailField label={t('area')} value={formatTranslated(item.area.name) || '—'} />
                    <DetailField
                      label={t('shopDetails.locationPath')}
                      value={
                        [
                          formatTranslated(item.area.city?.governorate?.name),
                          formatTranslated(item.area.city?.name),
                          formatTranslated(item.area.name),
                        ]
                          .filter(Boolean)
                          .join(' → ') || '—'
                      }
                    />
                    {item.area.base_fee != null ? (
                      <DetailField label={t('form.baseFee')} value={String(item.area.base_fee)} />
                    ) : null}
                  </>
                ) : null}
              </ProductDetailsFieldGrid>

              {item.services && item.services.length > 0 ? (
                <Box className="mt-3">
                  <Typography variant="caption" className="mb-2 block text-muted-foreground">
                    {t('columns.services')}
                  </Typography>
                  <Box className="flex flex-wrap gap-1.5">
                    {item.services.map((s) => (
                      <ProductDetailsChip key={s.id} tone="primary">
                        {formatTranslated(s.name) || `#${s.id}`}
                      </ProductDetailsChip>
                    ))}
                  </Box>
                </Box>
              ) : null}

              {item.categories && item.categories.length > 0 ? (
                <Box className="mt-3">
                  <Typography variant="caption" className="mb-2 block text-muted-foreground">
                    {t('form.shopCategoriesSection')}
                  </Typography>
                  <Box className="flex flex-wrap gap-1.5">
                    {item.categories.map((c) => (
                      <ProductDetailsChip key={c.id} tone="info">
                        {formatTranslated(c.name) || `#${c.id}`}
                      </ProductDetailsChip>
                    ))}
                  </Box>
                </Box>
              ) : null}

              {(item.created_at || item.updated_at) && (
                <Box className="mt-3">
                  <ProductDetailsFieldGrid cols={2}>
                  {item.created_at ? (
                    <DetailField label={t('columns.created')} value={new Date(item.created_at).toLocaleString()} />
                  ) : null}
                  {item.updated_at ? (
                    <DetailField label={t('columns.updated')} value={new Date(item.updated_at).toLocaleString()} />
                  ) : null}
                  </ProductDetailsFieldGrid>
                </Box>
              )}
            </ProductDetailsSection>

            {item.working_hours && (
              <ProductDetailsSection icon="solar:clock-circle-bold" title={t('shopDetails.workingHours')}>
                <Box className="divide-y divide-border/40 rounded-lg border border-border/45">
                  {WEEKDAYS.map((day) => {
                    const schedule = item.working_hours?.[day];
                    const line = formatWorkingHoursDay(schedule, t('closed'));
                    const isClosed = line === t('closed') || line === '-';
                    return (
                      <Box
                        key={day}
                        className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
                      >
                        <span className="font-medium capitalize text-foreground">{t(`weekdays.${day}`)}</span>
                        <span className={isClosed ? 'text-muted-foreground' : 'font-semibold tabular-nums'}>
                          {line}
                        </span>
                      </Box>
                    );
                  })}
                </Box>
              </ProductDetailsSection>
            )}

            {(item.lat ?? item.lng ?? item.area?.lat ?? item.area?.lng) && (
              <ProductDetailsSection icon="solar:gps-bold" title={t('shopDetails.locationCoordinates')}>
                <ProductDetailsFieldGrid cols={2}>
                  <DetailField label={t('columns.latitude')} value={String(item.lat ?? item.area?.lat ?? '—')} />
                  <DetailField label={t('columns.longitude')} value={String(item.lng ?? item.area?.lng ?? '—')} />
                </ProductDetailsFieldGrid>
              </ProductDetailsSection>
            )}
          </Box>
      </ProductDetailsPageShell>
    </>
  );
}
