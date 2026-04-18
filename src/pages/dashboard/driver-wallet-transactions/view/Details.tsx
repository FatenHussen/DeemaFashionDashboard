import type { ReactNode } from 'react';

import { cn } from '@/utils/utils';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { Link, useParams, useNavigate } from 'react-router';
import { DriverCreativeAvatar } from '@/pages/dashboard/driver-wallet-transactions/components/driver-creative-avatar';
import { useFetchDriverWalletTransactionById } from '@/pages/dashboard/driver-wallet-transactions/hooks/driver-wallet-transaction';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const heroByType: Record<
  string,
  { gradient: string; ring: string; icon: string; glow: string }
> = {
  paid_by_user: {
    gradient:
      'from-sky-500/[0.18] via-blue-500/[0.08] to-background dark:from-sky-500/25 dark:via-blue-950/40 dark:to-background',
    ring: 'ring-sky-500/25',
    icon: 'solar:wallet-money-bold',
    glow: 'bg-sky-400/30',
  },
  paid_by_system: {
    gradient:
      'from-violet-500/[0.18] via-purple-500/[0.08] to-background dark:from-violet-500/20 dark:via-purple-950/35 dark:to-background',
    ring: 'ring-violet-500/25',
    icon: 'solar:shield-check-bold',
    glow: 'bg-violet-400/25',
  },
};

type SectionCardProps = {
  title: string;
  icon: string;
  children: ReactNode;
  className?: string;
};

function SectionCard({ title, icon, children, className }: SectionCardProps) {
  return (
    <Box
      className={cn(
        'overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-lg shadow-black/[0.04] backdrop-blur-sm dark:shadow-black/20',
        'transition-shadow duration-300 hover:shadow-xl hover:shadow-black/[0.06]',
        className
      )}
    >
      <Box className="flex items-center gap-3 border-b border-border/50 bg-muted/20 px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
          <Iconify icon={icon} width={22} />
        </span>
        <Typography variant="subtitle1" className="font-semibold tracking-tight">
          {title}
        </Typography>
      </Box>
      <Box className="p-5 sm:p-6">{children}</Box>
    </Box>
  );
}

type InfoRowProps = { icon: string; label: string; value: ReactNode };
function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex gap-4 rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 transition-colors hover:bg-muted/20">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/80 text-muted-foreground shadow-sm">
        <Iconify icon={icon} width={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading } = useFetchDriverWalletTransactionById(id || '');
  const item = response?.data;

  const hero = heroByType[item?.type ?? ''] ?? {
    gradient:
      'from-primary/15 via-violet-500/10 to-background dark:from-primary/25 dark:via-violet-950/30 dark:to-background',
    ring: 'ring-primary/20',
    icon: 'solar:wallet-bold',
    glow: 'bg-primary/25',
  };

  if (isLoading) return <LoadingScreen />;
  if (!item) {
    return (
      <Box className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 px-6">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 bg-muted/30">
          <Iconify icon="solar:document-text-bold" width={40} className="text-muted-foreground" />
        </span>
        <Typography variant="h6" className="text-destructive">
          {t('form.driverWalletTxNotFound')}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(paths.dashboard.driverWalletTransactions)}>
          {t('form.backToDriverWalletTransactions')}
        </Button>
      </Box>
    );
  }

  const orderHref =
    item.order_id != null ? `${paths.dashboard.orders}/details/${item.order_id}` : null;
  const typeLabel = t(`form.driverWalletTxType_${item.type}`, { defaultValue: item.type });

  return (
    <>
      <title>{t('form.driverWalletTxDetailsDocumentTitle', { appName: CONFIG.appName })}</title>

      <Box className="w-full max-w-[100vw] px-4 pb-12 pt-2 sm:px-6 lg:px-8 xl:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="text"
            onClick={() => navigate(paths.dashboard.driverWalletTransactions)}
            className="-ms-2 gap-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} />
            {t('form.backToDriverWalletTransactions')}
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/80 bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground">
              ID · {item.id}
            </span>
          </div>
        </div>

        <div
          className={cn(
            'relative mb-8 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br p-8 sm:p-10 lg:p-12',
            'shadow-[0_24px_80px_-24px_rgb(0_0_0/0.25)] dark:shadow-[0_24px_80px_-24px_rgb(0_0_0/0.5)]',
            hero.gradient
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '24px 24px',
              color: 'rgb(var(--muted-foreground) / 0.25)',
            }}
          />
          <div
            className={cn(
              'pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl',
              hero.glow
            )}
          />
          <div
            className={cn(
              'pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/10'
            )}
          />

          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-7">
              <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'absolute -inset-1 rounded-[2rem] opacity-60 blur-md',
                      item.type === 'paid_by_user' ? 'bg-sky-400/40' : 'bg-violet-400/35'
                    )}
                  />
                  <div className="relative rounded-[1.75rem] border border-white/25 bg-background/30 p-1 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-black/30">
                    <DriverCreativeAvatar
                      name={item.driver?.name}
                      imageUrl={item.driver?.image_url}
                      size="hero"
                      rounded="2xl"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-background/40 px-3 py-1 text-xs font-medium backdrop-blur-md dark:border-white/10 dark:bg-black/20">
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-transparent',
                        hero.ring
                      )}
                    >
                      <Iconify icon={hero.icon} width={14} className="text-foreground" />
                    </span>
                    <span className="text-muted-foreground">{t('form.driverWalletTxLedgerEntry')}</span>
                  </div>
                  <Typography
                    variant="h3"
                    className="mb-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
                  >
                    {t('form.driverWalletTransactionTitle', { id: item.id })}
                  </Typography>
                  <p className="mb-3 text-sm font-medium text-foreground/90 sm:text-base">
                    {item.driver?.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                        item.type === 'paid_by_user'
                          ? 'bg-sky-500/15 text-sky-900 dark:text-sky-300'
                          : 'bg-violet-500/15 text-violet-900 dark:text-violet-200'
                      )}
                    >
                      {typeLabel}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {t('form.driverWalletTxDriverIdShort')} {item.driver_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="rounded-2xl border border-white/20 bg-background/50 p-6 backdrop-blur-md dark:border-white/10 dark:bg-black/25">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t('columns.amount')}
                </p>
                <p className="mt-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tabular-nums tracking-tight text-transparent sm:text-5xl">
                  {item.amount?.toLocaleString()}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{t('form.driverWalletTxAmountHint')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <SectionCard title={t('columns.driver')} icon="solar:delivery-bold">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <DriverCreativeAvatar
                  name={item.driver?.name}
                  imageUrl={item.driver?.image_url}
                  size="lg"
                  rounded="2xl"
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-lg font-semibold leading-tight">{item.driver?.name}</p>
                    <p className="mt-1 font-mono text-sm text-muted-foreground">#{item.driver_id}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-1">
                    <InfoRow
                      icon="solar:letter-bold"
                      label={t('form.email')}
                      value={item.driver?.email ?? t('form.emptyEmDash')}
                    />
                    <InfoRow
                      icon="solar:phone-bold"
                      label={t('form.phone')}
                      value={item.driver?.phone ?? t('form.emptyEmDash')}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title={t('form.driverWalletTxEarningsBreakdown')} icon="solar:calculator-bold">
              <div className="grid gap-3 sm:grid-cols-1">
                <InfoRow
                  icon="solar:delivery-bold"
                  label={t('form.driverWalletTxDeliveryFee')}
                  value={item.delivery_fee?.toLocaleString()}
                />
                <InfoRow
                  icon="solar:percent-bold"
                  label={t('form.driverWalletTxRatePercent')}
                  value={`${item.rate_percent}%`}
                />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <SectionCard title={t('columns.order')} icon="solar:bag-5-bold">
              {orderHref ? (
                <Link
                  to={orderHref}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:border-primary/40 hover:bg-primary/10"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {t('form.driverWalletTxOrderLink')}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold">#{item.order_id}</p>
                    {item.order?.status && (
                      <p className="mt-2 inline-flex rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium text-foreground">
                        {item.order.status}
                      </p>
                    )}
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background shadow-sm transition-transform group-hover:translate-x-0.5">
                    <Iconify icon="solar:arrow-right-up-bold" width={22} className="text-primary" />
                  </span>
                </Link>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-8 text-center">
                  <Iconify
                    icon="solar:cart-cross-bold"
                    width={36}
                    className="mx-auto mb-2 text-muted-foreground/60"
                  />
                  <p className="text-sm text-muted-foreground">{t('form.driverWalletTxNoOrder')}</p>
                </div>
              )}
            </SectionCard>

            <SectionCard title={t('form.driverWalletTxTimeline')} icon="solar:calendar-bold">
              <div className="relative space-y-0 pl-2">
                <div className="absolute start-3 top-2 bottom-2 w-px bg-gradient-to-b from-border via-border to-transparent" />
                <div className="relative flex gap-4 pb-6">
                  <span className="relative z-[1] mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground shadow">
                    <Iconify icon="solar:add-circle-bold" width={14} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {t('columns.createdAt')}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{item.created_at}</p>
                  </div>
                </div>
                {item.updated_at && (
                  <div className="relative flex gap-4">
                    <span className="relative z-[1] mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-foreground shadow">
                      <Iconify icon="solar:refresh-bold" width={14} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {t('form.driverWalletTxUpdatedAt')}
                      </p>
                      <p className="mt-0.5 text-sm font-medium">{item.updated_at}</p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </Box>
    </>
  );
}
