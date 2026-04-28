import type { ReactNode } from 'react';

import { useState } from 'react';
import { cn } from '@/utils/utils';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

import { formatSellerRegistrationCountry } from '../../utils/seller-registration-display';
import {
  useRejectSellerRegistration,
  useApproveSellerRegistration,
  useFetchSellerRegistrationById,
} from '../../hooks/seller-registration';

// ----------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30',
  approved: 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
};

const heroByStatus: Record<
  string,
  { gradient: string; ring: string; icon: string; glow: string }
> = {
  pending: {
    gradient:
      'from-amber-500/[0.2] via-orange-500/[0.08] to-background dark:from-amber-500/20 dark:via-orange-950/35 dark:to-background',
    ring: 'ring-amber-500/30',
    icon: 'solar:hourglass-bold',
    glow: 'bg-amber-400/35',
  },
  approved: {
    gradient:
      'from-emerald-500/[0.18] via-teal-500/[0.08] to-background dark:from-emerald-500/22 dark:via-teal-950/40 dark:to-background',
    ring: 'ring-emerald-500/25',
    icon: 'solar:check-circle-bold',
    glow: 'bg-emerald-400/30',
  },
  rejected: {
    gradient:
      'from-rose-500/[0.18] via-red-500/[0.08] to-background dark:from-rose-500/20 dark:via-red-950/35 dark:to-background',
    ring: 'ring-rose-500/25',
    icon: 'solar:close-circle-bold',
    glow: 'bg-rose-400/28',
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
        <div className="mt-0.5 text-sm font-medium leading-relaxed text-foreground">{value}</div>
      </div>
    </div>
  );
}

function locationLine(item: {
  governorate?: unknown;
  city?: unknown;
  country?: unknown;
}): string {
  const gov =
    typeof item.governorate === 'object' && item.governorate && 'name' in (item.governorate as object)
      ? String((item.governorate as { name?: string }).name ?? '')
      : typeof item.governorate === 'string'
        ? item.governorate
        : '';
  const city =
    typeof item.city === 'object' && item.city && 'name' in (item.city as object)
      ? String((item.city as { name?: string }).name ?? '')
      : typeof item.city === 'string'
        ? item.city
        : '';
  const country = formatSellerRegistrationCountry(item.country);
  return [country, gov, city].filter(Boolean).join(' · ');
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [commissionRate, setCommissionRate] = useState('');
  const [contractMonths, setContractMonths] = useState('');

  const { data: response, isLoading, error } = useFetchSellerRegistrationById(id || '');
  const approveMutation = useApproveSellerRegistration();
  const rejectMutation = useRejectSellerRegistration();

  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex min-h-[400px] w-full items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            {t('form.sellerRegLoadErrorTitle')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/seller-registrations')}>
            {t('form.backToSellerRegistrations')}
          </Button>
        </Box>
      </Box>
    );
  }

  const isPending = item.status === 'pending';

  const sellerRegStatusKey: Record<
    string,
    'form.sellerRegStatusPending' | 'form.sellerRegStatusApproved' | 'form.sellerRegStatusRejected'
  > = {
    pending: 'form.sellerRegStatusPending',
    approved: 'form.sellerRegStatusApproved',
    rejected: 'form.sellerRegStatusRejected',
  };
  const statusLabelKey = sellerRegStatusKey[item.status];

  const hero = heroByStatus[item.status] ?? heroByStatus.pending;

  const handleApprove = async () => {
    try {
      const payload: Record<string, number> = {};
      if (commissionRate) payload.commission_rate = parseFloat(commissionRate);
      if (contractMonths) payload.contract_duration_months = parseInt(contractMonths, 10);

      await approveMutation.mutateAsync({ id: item.id, payload });
      toast.success(t('form.sellerRegApprovedToast'));
      navigate('/seller-registrations');
    } catch {
      return;
    }
  };

  const handleReject = async () => {
    if (!window.confirm(t('form.sellerRegRejectConfirm'))) return;
    try {
      await rejectMutation.mutateAsync(item.id);
      toast.success(t('form.sellerRegRejectedToast'));
      navigate('/seller-registrations');
    } catch {
      return;
    }
  };

  const locLine = locationLine(item);

  return (
    <>
      <title>{t('form.sellerRegDetailsDocumentTitle', { appName: CONFIG.appName })}</title>

      <Box className="w-full max-w-[100vw] px-4 pb-12 pt-2 sm:px-6 lg:px-8 xl:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="text"
            onClick={() => navigate('/seller-registrations')}
            className="-ms-2 gap-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} />
            {t('form.backToSellerRegistrations')}
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/80 bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground">
              {t('form.idChip', { id: item.id })}
            </span>
          </div>
        </div>

        {/* Hero */}
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
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/10" />

          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-8">
              <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'absolute -inset-1 rounded-[2rem] opacity-60 blur-md',
                      item.status === 'approved'
                        ? 'bg-emerald-400/40'
                        : item.status === 'rejected'
                          ? 'bg-rose-400/40'
                          : 'bg-amber-400/40'
                    )}
                  />
                  <div className="relative flex h-[7.5rem] w-[7.5rem] items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/25 bg-background/40 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-black/30 sm:h-32 sm:w-32">
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.store_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Iconify icon="solar:shop-bold" className="text-primary" width={56} />
                    )}
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
                    <span className="text-muted-foreground">{t('form.sellerRegRegistrationDetails')}</span>
                  </div>
                  <Typography
                    variant="h3"
                    className="mb-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
                  >
                    {item.store_name}
                  </Typography>
                  <p className="mb-3 text-sm font-medium text-foreground/90 sm:text-base">
                    {item.seller_name}
                    <span className="text-muted-foreground"> — {item.email}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_COLORS[item.status] ?? STATUS_COLORS.pending
                      }`}
                    >
                      {statusLabelKey ? t(statusLabelKey) : item.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t('form.sellerRegRegisteredAt', {
                        date: new Date(item.registered_at).toLocaleString(),
                      })}
                    </span>
                  </div>
                  {locLine ? (
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      <Iconify
                        icon="solar:map-point-bold"
                        width={16}
                        className="me-1.5 inline-block align-text-bottom text-primary/80"
                      />
                      {locLine}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-4">
              <div className="rounded-2xl border border-white/20 bg-background/50 p-6 backdrop-blur-md dark:border-white/10 dark:bg-black/25">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t('columns.address')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/95">
                  {item.address?.trim() ? item.address : t('form.emptyEmDash')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <SectionCard title={t('form.sellerRegRegistrationDetails')} icon="solar:clipboard-list-bold">
              <div className="grid gap-3 sm:grid-cols-1">
                <InfoRow icon="solar:user-bold" label={t('form.sellerName')} value={item.seller_name} />
                <InfoRow icon="solar:letter-bold" label={t('columns.email')} value={item.email} />
                <InfoRow icon="solar:shop-bold" label={t('form.storeName')} value={item.store_name} />
                <InfoRow
                  icon="solar:streets-map-point-bold"
                  label={t('columns.address')}
                  value={item.address?.trim() ? item.address : t('form.emptyEmDash')}
                />
                <InfoRow
                  icon="solar:global-bold"
                  label={t('form.country')}
                  value={formatSellerRegistrationCountry(item.country) || t('form.emptyEmDash')}
                />
                <InfoRow
                  icon="solar:map-bold"
                  label={t('columns.governorate')}
                  value={
                    typeof item.governorate === 'object' && item.governorate
                      ? (item.governorate as { name?: string }).name
                      : item.governorate ?? t('form.emptyEmDash')
                  }
                />
                <InfoRow
                  icon="solar:buildings-2-bold"
                  label={t('columns.city')}
                  value={
                    typeof item.city === 'object' && item.city
                      ? (item.city as { name?: string }).name
                      : item.city ?? t('form.emptyEmDash')
                  }
                />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <SectionCard title={t('form.sellerRegCommercialRegister')} icon="solar:document-text-bold">
              <div className="grid gap-3">
                <InfoRow
                  icon="solar:hashtag-bold"
                  label={t('form.registerNumber')}
                  value={item.commercial_register_number ?? t('form.emptyEmDash')}
                />
                <InfoRow
                  icon="solar:calendar-bold"
                  label={t('form.registerDate')}
                  value={
                    item.commercial_register_date
                      ? new Date(item.commercial_register_date).toLocaleDateString()
                      : t('form.emptyEmDash')
                  }
                />
              </div>
            </SectionCard>

            <SectionCard title={t('form.sellerRegTimeline')} icon="solar:history-bold">
              <div className="relative space-y-0 pl-2">
                <div className="absolute start-3 top-2 bottom-2 w-px bg-gradient-to-b from-border via-border to-transparent" />
                {[
                  { k: 'registered', label: t('columns.registered'), date: item.registered_at, icon: 'solar:add-circle-bold' },
                  { k: 'created', label: t('columns.createdAt'), date: item.created_at, icon: 'solar:calendar-mark-bold' },
                  { k: 'updated', label: t('columns.updatedAt'), date: item.updated_at, icon: 'solar:refresh-bold' },
                ].map((row) => (
                  <div key={row.k} className="relative flex gap-4 pb-6 last:pb-0">
                    <span className="relative z-[1] mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground shadow">
                      <Iconify icon={row.icon} width={14} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {row.label}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {row.date ? new Date(row.date).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {isPending && (
          <Box className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-background to-violet-500/[0.04] p-6 shadow-lg sm:p-8 dark:from-primary/10 dark:via-background dark:to-violet-950/20">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Iconify icon="solar:shield-check-bold" width={26} />
                </span>
                <div>
                  <Typography variant="subtitle1" className="font-semibold text-foreground">
                    {t('form.sellerRegReviewSection')}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.sellerRegApproveHint', { email: item.email })}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('form.sellerRegCommissionRateOptional')}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {t('form.optionalTag')}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder={t('form.sellerRegCommissionPlaceholder')}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('form.sellerRegContractMonthsOptional')}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {t('form.optionalTag')}
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={contractMonths}
                  onChange={(e) => setContractMonths(e.target.value)}
                  placeholder={t('form.sellerRegContractMonthsPlaceholder')}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Iconify icon="solar:check-circle-bold" width={18} className="mr-2" />
                {approveMutation.isPending ? t('form.sellerRegApproving') : t('form.sellerRegApproveButton')}
              </Button>

              <Button variant="outlined" color="error" onClick={handleReject} disabled={rejectMutation.isPending}>
                <Iconify icon="solar:close-circle-bold" width={18} className="mr-2" />
                {rejectMutation.isPending ? t('form.sellerRegRejecting') : t('form.sellerRegRejectButton')}
              </Button>
            </div>
          </Box>
        )}
      </Box>
    </>
  );
}
