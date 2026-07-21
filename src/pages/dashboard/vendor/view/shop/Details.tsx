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

function InfoTile({
  icon,
  label,
  value,
  accent = 'primary' as 'primary' | 'amber' | 'violet' | 'emerald',
}: {
  icon: string;
  label: string;
  value: ReactNode;
  accent?: 'primary' | 'amber' | 'violet' | 'emerald';
}) {
  const accentRing =
    accent === 'amber'
      ? 'from-amber-500/25 to-orange-500/10'
      : accent === 'violet'
        ? 'from-violet-500/25 to-fuchsia-500/10'
        : accent === 'emerald'
          ? 'from-emerald-500/25 to-teal-500/10'
          : 'from-primary/25 to-primary/5';
  const iconBg =
    accent === 'amber'
      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
      : accent === 'violet'
        ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300'
        : accent === 'emerald'
          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
          : 'bg-primary/15 text-primary';

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/35 hover:shadow-md"
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${accentRing} blur-2xl`}
      />
      <div className="relative flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/40 ${iconBg}`}
        >
          <Iconify icon={icon} width={22} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="text-sm font-semibold leading-snug text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}

function SectionShell({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-card/95 to-muted/10 shadow-lg shadow-black/[0.03] backdrop-blur-md dark:shadow-black/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="border-b border-border/40 bg-muted/20 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner ring-1 ring-primary/15">
            <Iconify icon={icon} width={26} />
          </div>
          <div>
            <Typography variant="h6" className="font-bold tracking-tight text-foreground">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" className="mt-0.5 text-muted-foreground">
                {subtitle}
              </Typography>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
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

  const typeIcon =
    shopType === 'restaurant'
      ? 'solar:chef-hat-bold'
      : shopType === 'service_provider'
        ? 'solar:hand-stars-bold'
        : 'solar:shop-bold';

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

      <Box className="relative min-h-screen overflow-hidden bg-background">
        {/* ambient */}
        <Box className="pointer-events-none fixed inset-0">
          <Box className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/15 blur-[100px]" />
          <Box className="absolute -right-24 bottom-32 h-80 w-80 rounded-full bg-violet-500/10 blur-[90px]" />
          <Box className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[80px]" />
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_85%_65%_at_50%_30%,#000_45%,transparent)] opacity-40 dark:opacity-25" />
        </Box>

        <Box className="relative z-[1] mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Button
            variant="text"
            onClick={() => navigate(basePath)}
            className="group mb-6 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/80 transition group-hover:border-primary/40 group-hover:bg-primary/5">
              <Iconify icon="solar:arrow-left-bold" width={18} />
            </span>
            {isRestaurantRoute ? t('shopDetails.backToRestaurants') : t('shopDetails.backToList')}
          </Button>

          {/* Hero */}
          <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/30 shadow-2xl shadow-black/[0.06] dark:shadow-black/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-violet-500/[0.06]" />
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/4 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-tr from-orange-500/15 to-transparent blur-3xl" />

            <div className="relative flex flex-col gap-8 p-6 sm:flex-row sm:items-start sm:gap-10 sm:p-10">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/40 via-orange-400/30 to-violet-500/40 opacity-80 blur-sm" />
                <div className="relative">
                  {item.logo_url ? (
                    <img
                      src={item.logo_url}
                      alt={formatTranslated(item.name)}
                      className="h-28 w-28 rounded-2xl border-2 border-background object-cover shadow-xl ring-4 ring-primary/15 sm:h-32 sm:w-32"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-background bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl ring-4 ring-primary/15 sm:h-32 sm:w-32">
                      <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={44} height={44} />
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 font-mono text-xs font-semibold text-muted-foreground">
                    ID · {id}
                  </span>
                  {item.is_open_now ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-400 bg-emerald-950/90 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                        <Iconify icon="solar:shop-2-bold" width={12} className="text-white" />
                      </span>
                      {t('columns.openNow')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-red-400 bg-red-950/90 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                        <Iconify icon="solar:close-circle-bold" width={12} className="text-white" />
                      </span>
                      {t('closed')}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-bold text-white shadow-sm ${
                      item.is_active
                        ? 'border-cyan-400 bg-slate-700 dark:bg-slate-800'
                        : 'border-slate-500 bg-slate-900'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        item.is_active ? 'bg-cyan-400' : 'bg-slate-800'
                      }`}
                    >
                      <Iconify
                        icon={item.is_active ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                        width={12}
                        className="text-white"
                      />
                    </span>
                    {item.is_active ? t('active') : t('inactive')}
                  </span>
                </div>

                <div>
                  <Typography variant="h4" className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {formatTranslated(item.name)}
                  </Typography>
                  {item.description && (
                    <Typography variant="body1" className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
                      {formatTranslated(item.description)}
                    </Typography>
                  )}
                </div>

                {item.badges && item.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.badges.map((badge) => {
                      const colorClasses: Record<string, string> = {
                        success: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
                        warning: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
                        danger: 'bg-red-500/20 text-red-700 border-red-500/30',
                        primary: 'bg-primary/20 text-primary border-primary/30',
                      };
                      const cls =
                        (badge.color != null ? colorClasses[badge.color] : undefined) ||
                        'bg-muted text-muted-foreground border-border/50';
                      return (
                        <span
                          key={badge.name}
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
                        >
                          {badge.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex w-full shrink-0 sm:w-auto sm:items-start sm:justify-end">
                <Button
                  variant="contained"
                  onClick={() => navigate(`${basePath}/update/${id}`)}
                  className="h-12 w-full gap-2 rounded-xl px-8 shadow-lg shadow-primary/25 sm:w-auto"
                >
                  <Iconify icon="solar:pen-bold" width={18} /> {t('edit')}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick tiles */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile icon={typeIcon} label={t('columns.shopType')} value={shopTypeLabel} accent="amber" />
            <InfoTile
              icon="solar:tag-price-bold"
              label={t('form.shopPriceLevelLabel')}
              value={priceLevelLabel}
              accent="violet"
            />
            <InfoTile
              icon="solar:wallet-money-bold"
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
              accent="primary"
            />
            <InfoTile
              icon="solar:star-bold"
              label={t('columns.rating')}
              value={
                <>
                  {item.average_rating?.toFixed(1) ?? '0.0'}{' '}
                  <span className="font-normal text-muted-foreground">
                    ({t('shopDetails.reviewsCount', { count: item.ratings_count ?? 0 })})
                  </span>
                </>
              }
              accent="emerald"
            />
          </div>

          <div className="space-y-8">
            <SectionShell
              icon="solar:document-text-bold"
              title={t('shopDetails.information')}
              subtitle={formatTranslated(item.vendor?.name) || undefined}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoTile icon="solar:case-minimalistic-bold" label={t('columns.vendor')} value={formatTranslated(item.vendor?.name) || '-'} />
                <InfoTile icon="solar:letter-bold" label={t('columns.email')} value={item.email || '-'} />
                <InfoTile icon="solar:phone-bold" label={t('columns.phone')} value={item.phone || '-'} />
                <InfoTile icon="solar:iphone-bold" label={t('columns.mobile')} value={item.mobile || '-'} />
                <InfoTile
                  icon="solar:map-point-bold"
                  label={t('columns.address')}
                  value={formatTranslated(item.address) || '-'}
                />
                {item.area && (
                  <>
                    <InfoTile icon="solar:map-bold" label={t('area')} value={formatTranslated(item.area.name) || '-'} />
                    <InfoTile
                      icon="solar:routing-2-bold"
                      label={t('shopDetails.locationPath')}
                      value={
                        [
                          formatTranslated(item.area.city?.governorate?.name),
                          formatTranslated(item.area.city?.name),
                          formatTranslated(item.area.name),
                        ]
                          .filter(Boolean)
                          .join(' → ') || '-'
                      }
                    />
                    {item.area.base_fee != null && (
                      <InfoTile icon="solar:bill-list-bold" label={t('form.baseFee')} value={String(item.area.base_fee)} />
                    )}
                  </>
                )}
                {item.services && item.services.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <InfoTile
                      icon="solar:widget-5-bold"
                      label={t('columns.services')}
                      value={
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.services.map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary"
                            >
                              {formatTranslated(s.name) || `#${s.id}`}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  </div>
                )}
                {item.categories && item.categories.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <InfoTile
                      icon="solar:folder-bold"
                      label={t('form.shopCategoriesSection')}
                      value={
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.categories.map((c) => (
                            <span
                              key={c.id}
                              className="inline-flex rounded-lg border border-violet-500/20 bg-violet-500/5 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300"
                            >
                              {formatTranslated(c.name) || `#${c.id}`}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  </div>
                )}
                {(item.created_at || item.updated_at) && (
                  <div className="flex flex-wrap gap-6 border-t border-border/40 pt-6 sm:col-span-2 lg:col-span-3">
                    {item.created_at && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                          <Iconify icon="solar:calendar-add-bold" width={20} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t('columns.created')}
                          </p>
                          <p className="font-medium">{new Date(item.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {item.updated_at && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                          <Iconify icon="solar:calendar-mark-bold" width={20} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t('columns.updated')}
                          </p>
                          <p className="font-medium">{new Date(item.updated_at).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SectionShell>

            {item.working_hours && (
              <SectionShell icon="solar:clock-circle-bold" title={t('shopDetails.workingHours')}>
                <div className="relative">
                  <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/50 via-border to-transparent" />
                  <div className="space-y-0">
                    {WEEKDAYS.map((day) => {
                      const schedule = item.working_hours?.[day];
                      const line = formatWorkingHoursDay(schedule, t('closed'));
                      const isClosed = line === t('closed') || line === '-';
                      return (
                        <div
                          key={day}
                          className="relative flex gap-4 py-3 pl-1 sm:gap-6"
                        >
                          <div className="relative z-[1] flex w-8 shrink-0 justify-center pt-0.5">
                            <div
                              className={`h-3 w-3 rounded-full border-2 border-background shadow ${
                                isClosed ? 'bg-muted-foreground/40' : 'bg-primary shadow-primary/40'
                              }`}
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm font-bold capitalize tracking-tight text-foreground">
                              {t(`weekdays.${day}`)}
                            </span>
                            <span
                              className={`font-mono text-sm ${
                                isClosed ? 'text-muted-foreground' : 'font-semibold text-foreground'
                              }`}
                            >
                              {line}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionShell>
            )}

            {(item.lat ?? item.lng ?? item.area?.lat ?? item.area?.lng) && (
              <SectionShell icon="solar:gps-bold" title={t('shopDetails.locationCoordinates')}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 font-mono">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('columns.latitude')}
                    </p>
                    <p className="text-lg font-semibold text-foreground">{item.lat ?? item.area?.lat ?? '-'}</p>
                  </div>
                  <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 font-mono">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('columns.longitude')}
                    </p>
                    <p className="text-lg font-semibold text-foreground">{item.lng ?? item.area?.lng ?? '-'}</p>
                  </div>
                </div>
              </SectionShell>
            )}
          </div>
        </Box>
      </Box>
    </>
  );
}
