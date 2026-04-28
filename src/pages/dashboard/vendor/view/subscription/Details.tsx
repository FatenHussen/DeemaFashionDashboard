import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';
import type { VendorSubscriptionDetails } from '@/pages/dashboard/vendor/types/vendor-subscription.types';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchVendorSubscriptionById } from '@/pages/dashboard/vendor/hooks/vendor-subscription';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const STATUS_BORDERS: Record<string, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  expired: 'border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400',
  cancelled: 'border-neutral-500/30 bg-neutral-500/15 text-neutral-700 dark:text-neutral-400',
  pending: 'border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-600',
  expired: 'bg-red-500/20 text-red-600',
  cancelled: 'bg-neutral-500/20 text-neutral-600',
  pending: 'bg-yellow-500/20 text-yellow-600',
};

const vendorOrShopDisplay = (item: VendorSubscriptionDetails): string =>
  item.shop?.name ?? item.vendor?.name ?? item.vendor_name ?? '—';

function vendorSubscriptionStatusLabel(status: string, t: TFunction<'table'>): string {
  const s = String(status).toLowerCase();
  if (s === 'active') return t('active');
  if (s === 'expired') return t('expired');
  if (s === 'cancelled') return t('statusCancelled');
  if (s === 'pending') return t('columns.pending');
  return status;
}

type FieldBoxProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

function FieldBox({ label, children, className }: FieldBoxProps) {
  return (
    <Box className={className}>
      <Typography variant="caption" className="mb-1 block text-muted-foreground">
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
  const { data: response, isLoading, error } = useFetchVendorSubscriptionById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <>
        <title>{t('vendorSubscriptionDocumentTitle', { app: CONFIG.appName })}</title>
        <Box className="flex min-h-[400px] items-center justify-center p-6">
          <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
            <Typography variant="h6" className="mb-2 text-destructive">
              {t('vendorSubscriptionDetailsError')}
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/vendor-subscriptions')}>
              {t('vendorSubscriptionBackToList')}
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  const statusText = vendorSubscriptionStatusLabel(item.status, t);
  const statusKey = String(item.status).toLowerCase();
  const pkgName = formatTranslated(item.package?.name) || '—';
  const commissionDisplay =
    item.package?.commission_rate != null ? `${item.package.commission_rate}%` : '—';

  return (
    <>
      <title>{t('vendorSubscriptionDocumentTitle', { app: CONFIG.appName })}</title>
      <Box className="relative w-full min-h-screen overflow-hidden bg-background">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/25" />
        <Box className="pointer-events-none fixed top-0 right-0 h-[min(60vh,520px)] w-[min(90vw,640px)] -translate-y-1/4 translate-x-1/4 rounded-full bg-primary/[0.07] blur-[100px]" />
        <Box className="pointer-events-none fixed bottom-0 left-0 h-[min(50vh,420px)] w-[min(80vw,520px)] translate-y-1/4 -translate-x-1/4 rounded-full bg-violet-500/[0.06] blur-[90px]" />

        <Box className="relative w-full px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Button
            variant="text"
            onClick={() => navigate('/vendor-subscriptions')}
            className="-mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="me-2" />
            {t('vendorSubscriptionBackToList')}
          </Button>

          {/* Hero */}
          <Box className="relative mb-8 mt-4 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-card/95 via-card/90 to-primary/[0.04] shadow-lg shadow-primary/[0.04] ring-1 ring-border/40">
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
                  <Iconify icon="solar:card-bold" className="text-primary" width={40} height={40} />
                </Box>
                <Box className="min-w-0">
                  <Box className="mb-2 flex flex-wrap items-center gap-2">
                    <Typography variant="h4" className="font-bold tracking-tight text-foreground">
                      {vendorOrShopDisplay(item)}
                    </Typography>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_BORDERS[statusKey] ?? STATUS_BORDERS.pending
                      }`}
                    >
                      {statusText}
                    </span>
                  </Box>
                  <Typography variant="body1" className="font-medium text-foreground/90">{pkgName}</Typography>
                  <Typography variant="body2" className="mt-1 text-muted-foreground">
                    {t('vendorSubscriptionCardSubscription')} · #{item.id}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                <Box className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 backdrop-blur-sm">
                  <Iconify icon="solar:calendar-bold" width={18} className="text-primary" />
                  <Box>
                    <Typography variant="caption" className="block leading-none text-muted-foreground">
                      {t('vendorSubscriptionStartsAt')}
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {item.starts_at}
                    </Typography>
                  </Box>
                </Box>
                <Box className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 backdrop-blur-sm">
                  <Iconify icon="solar:calendar-mark-bold" width={18} className="text-primary" />
                  <Box>
                    <Typography variant="caption" className="block leading-none text-muted-foreground">
                      {t('vendorSubscriptionEndsAt')}
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {item.ends_at}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Stats */}
          <Box className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                icon: 'solar:flag-bold',
                label: t('columns.status'),
                value: statusText,
                accent: 'from-violet-500/15 to-transparent border-violet-500/20',
              },
              {
                icon: 'solar:refresh-bold',
                label: t('columns.autoRenew'),
                value: item.auto_renew ? t('yes') : t('no'),
                accent: 'from-sky-500/15 to-transparent border-sky-500/20',
              },
              {
                icon: 'solar:calendar-bold',
                label: t('vendorSubscriptionStartsAt'),
                value: item.starts_at,
                accent: 'from-amber-500/15 to-transparent border-amber-500/20',
              },
              {
                icon: 'solar:calendar-mark-bold',
                label: t('vendorSubscriptionEndsAt'),
                value: item.ends_at,
                accent: 'from-emerald-500/15 to-transparent border-emerald-500/20',
              },
              {
                icon: 'solar:percent-bold',
                label: t('columns.commissionPercent'),
                value: commissionDisplay,
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
                <Typography variant="caption" className="block text-muted-foreground">
                  {stat.label}
                </Typography>
                <Typography variant="h6" className="mt-0.5 font-bold tracking-tight">
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Bento */}
          <Box className="grid gap-6 xl:grid-cols-2">
            <Box className="rounded-2xl border border-border/50 bg-card/70 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Box className="border-b border-border/40 bg-muted/30 px-5 py-4">
                <Box className="flex items-center gap-2">
                  <Iconify icon="solar:document-text-bold" width={20} className="text-primary" />
                  <Typography variant="h6" className="font-semibold">
                    {t('vendorSubscriptionCardSubscription')}
                  </Typography>
                </Box>
              </Box>
              <Box className="grid gap-4 p-5 sm:grid-cols-2">
                <FieldBox label={t('columns.shop')}>
                  <Typography variant="body1" className="font-medium">
                    {vendorOrShopDisplay(item)}
                  </Typography>
                </FieldBox>
                <FieldBox label={t('columns.package')}>
                  <Typography variant="body1" className="font-medium">
                    {pkgName}
                  </Typography>
                </FieldBox>
                <FieldBox label={t('vendorSubscriptionStartsAt')}>
                  <Typography variant="body1" className="font-medium">
                    {item.starts_at}
                  </Typography>
                </FieldBox>
                <FieldBox label={t('vendorSubscriptionEndsAt')}>
                  <Typography variant="body1" className="font-medium">
                    {item.ends_at}
                  </Typography>
                </FieldBox>
                <FieldBox label={t('columns.autoRenew')}>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.auto_renew
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.auto_renew ? t('yes') : t('no')}
                  </span>
                </FieldBox>
                <FieldBox label={t('columns.status')}>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[item.status] ?? STATUS_COLORS.pending}`}
                  >
                    {statusText}
                  </span>
                </FieldBox>
                {item.notified_at && (
                  <FieldBox label={t('vendorSubscriptionNotifiedAt')} className="sm:col-span-2">
                    <Typography variant="body1" className="font-medium">
                      {item.notified_at}
                    </Typography>
                  </FieldBox>
                )}
                {item.notes && (
                  <FieldBox label={t('vendorSubscriptionNotes')} className="sm:col-span-2">
                    <Typography variant="body1" className="font-medium">
                      {item.notes}
                    </Typography>
                  </FieldBox>
                )}
              </Box>
            </Box>

            <Box className="rounded-2xl border border-border/50 bg-card/70 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Box className="border-b border-border/40 bg-muted/30 px-5 py-4">
                <Box className="flex items-center gap-2">
                  <Iconify icon="solar:box-minimalistic-bold" width={20} className="text-primary" />
                  <Typography variant="h6" className="font-semibold">
                    {t('vendorSubscriptionCardPackage')}
                  </Typography>
                </Box>
              </Box>
              <Box className="grid gap-4 p-5 sm:grid-cols-2">
                <FieldBox label={t('columns.name')} className="sm:col-span-2">
                  <Typography variant="body1" className="font-medium">
                    {pkgName}
                  </Typography>
                </FieldBox>
                <FieldBox label={t('columns.maxProducts')}>
                  <Typography variant="body1" className="font-medium">
                    {item.package?.max_products ?? '—'}
                  </Typography>
                </FieldBox>
                <FieldBox label={t('columns.commissionPercent')}>
                  <Typography variant="body1" className="font-medium">
                    {commissionDisplay}
                  </Typography>
                </FieldBox>
                <FieldBox label={t('columns.created')} className="sm:col-span-2">
                  <Typography variant="body2" className="font-medium text-foreground/90">
                    {item.created_at}
                  </Typography>
                </FieldBox>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
