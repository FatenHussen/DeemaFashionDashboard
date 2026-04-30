import type { ReactNode } from 'react';
import type { DaySchedule } from '@/pages/dashboard/vendor/types/shop.types';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchShopById } from '@/pages/dashboard/vendor/hooks/shop';
import {
  paymentMethodsFromShop,
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
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/35 hover:shadow-md">
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
            {t('serviceProviderDetails.errorTitle')}
          </Typography>
          <Typography variant="body2" className="mb-6 text-muted-foreground">
            {error instanceof Error ? error.message : t('serviceProviderDetails.errorBody')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/service-providers')}>
            {t('serviceProviderDetails.backToList')}
          </Button>
        </Box>
      </Box>
    );
  }

  const priceLevel = normalizeShopPriceLevelFromApi(item);
  const paymentKeys = paymentMethodsFromShop(item);
  const priceLevelLabel =
    priceLevel === 'cheap'
      ? t('serviceProviderDetails.priceLevelCheap')
      : priceLevel === 'expensive'
        ? t('serviceProviderDetails.priceLevelExpensive')
        : t('serviceProviderDetails.priceLevelMedium');

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
      <title>{t('form.serviceProviderDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background">
        <Box className="pointer-events-none fixed inset-0">
          <Box className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/15 blur-[100px]" />
          <Box className="absolute -right-24 bottom-32 h-80 w-80 rounded-full bg-violet-500/10 blur-[90px]" />
          <Box className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[80px]" />
        </Box>

        <Box className="relative z-[1] mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Button
            variant="text"
            onClick={() => navigate('/service-providers')}
            className="group mb-6 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/80 transition group-hover:border-primary/40 group-hover:bg-primary/5">
              <Iconify icon="solar:arrow-left-bold" width={18} />
            </span>
            {t('serviceProviderDetails.backToList')}
          </Button>

          <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/30 shadow-2xl shadow-black/[0.06] dark:shadow-black/30">
            <div className="relative flex flex-col gap-8 p-6 sm:flex-row sm:items-start sm:gap-10 sm:p-10">
              <div className="relative shrink-0">
                {item.logo_url ? (
                  <img
                    src={item.logo_url}
                    alt={formatTranslated(item.name)}
                    className="h-28 w-28 rounded-2xl border-2 border-background object-cover shadow-xl ring-4 ring-primary/15 sm:h-32 sm:w-32"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-background bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl ring-4 ring-primary/15 sm:h-32 sm:w-32">
                    <Iconify icon="solar:hand-stars-bold" className="text-primary" width={44} height={44} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <Typography variant="h4" className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {formatTranslated(item.name)}
                </Typography>
                {item.description && (
                  <Typography variant="body1" className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
                    {formatTranslated(item.description)}
                  </Typography>
                )}
              </div>

              <div className="flex w-full shrink-0 sm:w-auto sm:items-start sm:justify-end">
                <Button
                  variant="contained"
                  onClick={() => navigate(`/service-providers/update/${id}`)}
                  className="h-12 w-full gap-2 rounded-xl px-8 shadow-lg shadow-primary/25 sm:w-auto"
                >
                  <Iconify icon="solar:pen-bold" width={18} /> {t('edit')}
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoTile icon="solar:hand-stars-bold" label={t('tableNames.serviceProviders')} value={t('tableNames.serviceProviders')} accent="amber" />
            <InfoTile
              icon="solar:tag-price-bold"
              label={t('serviceProviderDetails.priceLevelLabel')}
              value={priceLevelLabel}
              accent="violet"
            />
            <InfoTile
              icon="solar:wallet-money-bold"
              label={t('serviceProviderDetails.paymentMethodsLabel')}
              value={
                paymentKeys.length > 0
                  ? paymentKeys
                      .map((k) => {
                        const key = `serviceProviderDetails.paymentMethod_${k}`;
                        const fallbackKey = `form.shopPaymentMethod_${k}`;
                        const translated = t(key, {
                          defaultValue: t(fallbackKey, { defaultValue: k }),
                        });
                        return translated === key ? k : translated;
                      })
                      .join(', ')
                  : '—'
              }
              accent="primary"
            />
          </div>

          <div className="space-y-8">
            <SectionShell
              icon="solar:document-text-bold"
              title={t('serviceProviderDetails.information')}
              subtitle={formatTranslated(item.vendor?.name) || undefined}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoTile icon="solar:case-minimalistic-bold" label={t('columns.vendor')} value={formatTranslated(item.vendor?.name) || '-'} />
                <InfoTile icon="solar:letter-bold" label={t('columns.email')} value={item.email || '-'} />
                <InfoTile icon="solar:phone-bold" label={t('columns.phone')} value={item.phone || '-'} />
                <InfoTile icon="solar:iphone-bold" label={t('columns.mobile')} value={item.mobile || '-'} />
                <InfoTile icon="solar:map-point-bold" label={t('columns.address')} value={formatTranslated(item.address) || '-'} />
              </div>
            </SectionShell>

            {item.working_hours && (
              <SectionShell icon="solar:clock-circle-bold" title={t('serviceProviderDetails.workingHours')}>
                <div className="space-y-0">
                  {WEEKDAYS.map((day) => {
                    const schedule = item.working_hours?.[day];
                    const line = formatWorkingHoursDay(schedule, t('closed'));
                    return (
                      <div key={day} className="relative flex gap-4 py-3 pl-1 sm:gap-6">
                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm font-bold capitalize tracking-tight text-foreground">
                            {t(`weekdays.${day}`)}
                          </span>
                          <span className="font-mono text-sm text-muted-foreground">{line}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionShell>
            )}
          </div>
        </Box>
      </Box>
    </>
  );
}
