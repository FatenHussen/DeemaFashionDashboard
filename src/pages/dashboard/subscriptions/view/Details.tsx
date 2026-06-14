import type { ReactNode } from 'react';
import type { SubscriptionPackageDetail } from '@/pages/dashboard/subscriptions/types/subscription.types';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchSubscriptionById } from '@/pages/dashboard/subscriptions/hooks/subscription';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const pkgName = (p?: SubscriptionPackageDetail | null): string => {
  if (!p?.name) return '';
  if (typeof p.name === 'string') return p.name;
  return p.name.en || p.name.ar || '';
};

type FieldBoxProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

function FieldBox({ label, children, className }: FieldBoxProps) {
  return (
    <Box className={className}>
      <Typography variant="caption" className="text-muted-foreground block mb-1">
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchSubscriptionById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">
            {t('subscriptionDetailsError')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/subscriptions')}>
            {t('subscriptionBackToList')}
          </Button>
        </Box>
      </Box>
    );
  }

  const name = pkgName(item.package);

  const statusLabel =
    item.status === 'active'
      ? t('active')
      : item.status === 'expired'
        ? t('expired')
        : item.status === 'cancelled'
          ? t('statusCancelled')
          : item.status;

  const daysRemainingDisplay =
    item.days_remaining === null || item.days_remaining === undefined ? '—' : String(item.days_remaining);

  const remainingOrdersDisplay =
    item.remaining_orders === null || item.remaining_orders === undefined ? '∞' : String(item.remaining_orders);

  const priceDisplay =
    item.package?.price != null
      ? Number(item.package.price).toLocaleString(undefined, { maximumFractionDigits: 2 })
      : '—';

  return (
    <>
      <title>{t('form.subscriptionDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative w-full min-h-screen overflow-hidden bg-background">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/25" />
        <Box className="pointer-events-none fixed top-0 right-0 h-[min(60vh,520px)] w-[min(90vw,640px)] -translate-y-1/4 translate-x-1/4 rounded-full bg-primary/[0.07] blur-[100px]" />
        <Box className="pointer-events-none fixed bottom-0 left-0 h-[min(50vh,420px)] w-[min(80vw,520px)] translate-y-1/4 -translate-x-1/4 rounded-full bg-violet-500/[0.06] blur-[90px]" />

        <Box className="relative w-full px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Button
            variant="text"
            onClick={() => navigate('/subscriptions')}
            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> {t('subscriptionBackToList')}
          </Button>

          {/* Hero — full width */}
          <Box className="relative mb-8 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-card/95 via-card/90 to-primary/[0.04] shadow-lg shadow-primary/[0.04] ring-1 ring-border/40">
            <Box
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--border) / 0.45) 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />
            <Box className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <Box className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

            <Box className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between md:p-8 lg:p-10">
              <Box className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                <Box className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
                  <Iconify icon="solar:card-recive-bold" className="text-primary" width={40} height={40} />
                </Box>
                <Box className="min-w-0">
                  <Box className="mb-2 flex flex-wrap items-center gap-2">
                    <Typography variant="h4" className="font-bold tracking-tight text-foreground">
                      {t('subscriptionDetailTitle', { id: item.id })}
                    </Typography>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        item.status === 'active'
                          ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : item.status === 'expired'
                            ? 'border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                            : 'border-border bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </Box>
                  <Typography variant="body1" className="font-medium text-foreground/90">
                    {item.user?.name || '—'}
                  </Typography>
                  <Typography variant="body2" className="mt-1 truncate text-muted-foreground">
                    {item.user?.email ?? '—'}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                <Box className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 backdrop-blur-sm">
                  <Iconify icon="solar:box-minimalistic-bold" width={18} className="text-primary" />
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground block leading-none">
                      {t('columns.name')}
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {name || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Quick stats — full width strip */}
          <Box className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                icon: 'solar:flag-bold',
                label: t('columns.status'),
                value: statusLabel,
                accent: 'from-violet-500/15 to-transparent border-violet-500/20',
              },
              {
                icon: 'solar:calendar-bold',
                label: t('columns.daysRemaining'),
                value: daysRemainingDisplay,
                accent: 'from-sky-500/15 to-transparent border-sky-500/20',
              },
              {
                icon: 'solar:cart-large-2-bold',
                label: t('columns.remainingOrders'),
                value: remainingOrdersDisplay,
                accent: 'from-amber-500/15 to-transparent border-amber-500/20',
              },
              {
                icon: 'solar:wallet-money-bold',
                label: t('columns.price'),
                value: priceDisplay,
                accent: 'from-emerald-500/15 to-transparent border-emerald-500/20',
              },
              {
                icon: 'solar:check-circle-bold',
                label: t('columns.active'),
                value: item.is_active ? t('active') : t('inactive'),
                accent: 'from-primary/15 to-transparent border-primary/25',
              },
            ].map((stat) => (
              <Box
                key={stat.label}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${stat.accent} p-4 shadow-sm transition-shadow hover:shadow-md`}
              >
                <Box className="mb-3 flex items-center justify-between gap-2">
                  <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/70 ring-1 ring-border/50">
                    <Iconify icon={stat.icon} width={20} className="text-foreground/80" />
                  </Box>
                </Box>
                <Typography variant="caption" className="text-muted-foreground block">
                  {stat.label}
                </Typography>
                <Typography variant="h6" className="mt-0.5 font-bold tracking-tight">
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Bento grid — full width */}
          <Box className="grid gap-6 xl:grid-cols-3">
            <Box className="xl:col-span-1">
              <Box className="h-full rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm shadow-sm ring-1 ring-border/30">
                <Box className="border-b border-border/40 bg-muted/30 px-5 py-4">
                  <Box className="flex items-center gap-2">
                    <Iconify icon="solar:user-bold" width={20} className="text-primary" />
                    <Typography variant="h6" className="font-semibold">
                      {t('subscriptionSectionUser')}
                    </Typography>
                  </Box>
                </Box>
                <Box className="space-y-4 p-5">
                  <FieldBox label={t('columns.name')}>
                    <Typography variant="body1" className="font-medium">
                      {item.user?.name ?? '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.email')}>
                    <Typography variant="body1" className="font-medium break-all">
                      {item.user?.email ?? '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.phone')}>
                    <Typography variant="body1" className="font-medium">
                      {item.user?.phone ?? '—'}
                    </Typography>
                  </FieldBox>
                </Box>
              </Box>
            </Box>

            <Box className="xl:col-span-1">
              <Box className="h-full rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm shadow-sm ring-1 ring-border/30">
                <Box className="border-b border-border/40 bg-muted/30 px-5 py-4">
                  <Box className="flex items-center gap-2">
                    <Iconify icon="solar:box-minimalistic-bold" width={20} className="text-primary" />
                    <Typography variant="h6" className="font-semibold">
                      {t('subscriptionSectionPackage')}
                    </Typography>
                  </Box>
                </Box>
                <Box className="grid gap-4 p-5 sm:grid-cols-2">
                  <FieldBox label={t('columns.name')} className="sm:col-span-2">
                    <Typography variant="body1" className="font-medium">
                      {name || '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.price')}>
                    <Typography variant="body1" className="font-medium">
                      {priceDisplay}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.durationDays')}>
                    <Typography variant="body1" className="font-medium">
                      {item.package?.duration_days ?? '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.monthlyOrders')}>
                    <Typography variant="body1" className="font-medium">
                      {item.package?.monthly_orders_limit ?? '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('subscriptionPackageFreeDelivery')}>
                    <Typography variant="body1" className="font-medium">
                      {item.package?.free_delivery_count ?? '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.discountPercent')}>
                    <Typography variant="body1" className="font-medium">
                      {item.package?.discount_percentage ?? '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('subscriptionPackagePointsBonus')}>
                    <Typography variant="body1" className="font-medium">
                      {item.package?.points_bonus ?? '—'}
                    </Typography>
                  </FieldBox>
                </Box>
              </Box>
            </Box>

            <Box className="xl:col-span-1">
              <Box className="h-full rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm shadow-sm ring-1 ring-border/30">
                <Box className="border-b border-border/40 bg-muted/30 px-5 py-4">
                  <Box className="flex items-center gap-2">
                    <Iconify icon="solar:history-bold" width={20} className="text-primary" />
                    <Typography variant="h6" className="font-semibold">
                      {t('subscriptionSectionSubscription')}
                    </Typography>
                  </Box>
                </Box>
                <Box className="grid gap-4 p-5 sm:grid-cols-2">
                  <FieldBox label={t('columns.status')}>
                    <Typography variant="body1" className="font-medium">
                      {statusLabel}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.active')}>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.is_active
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-500/15 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {item.is_active ? t('active') : t('inactive')}
                    </span>
                  </FieldBox>
                  <FieldBox label={t('columns.startDate')}>
                    <Typography variant="body1" className="font-medium">
                      {item.start_date ? new Date(item.start_date).toLocaleDateString() : '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.endDate')}>
                    <Typography variant="body1" className="font-medium">
                      {item.end_date != null && item.end_date !== ''
                        ? new Date(item.end_date).toLocaleDateString()
                        : '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.remainingOrders')}>
                    <Typography variant="body1" className="font-medium">
                      {remainingOrdersDisplay}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.remainingFreeDeliveries')}>
                    <Typography variant="body1" className="font-medium">
                      {item.remaining_free_deliveries === null || item.remaining_free_deliveries === undefined
                        ? '—'
                        : item.remaining_free_deliveries}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.daysRemaining')}>
                    <Typography variant="body1" className="font-medium">
                      {daysRemainingDisplay}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.created')} className="sm:col-span-2">
                    <Typography variant="body2" className="font-medium text-foreground/90">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                    </Typography>
                  </FieldBox>
                  <FieldBox label={t('columns.updatedAt')} className="sm:col-span-2">
                    <Typography variant="body2" className="font-medium text-foreground/90">
                      {item.updated_at ? new Date(item.updated_at).toLocaleString() : '—'}
                    </Typography>
                  </FieldBox>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
