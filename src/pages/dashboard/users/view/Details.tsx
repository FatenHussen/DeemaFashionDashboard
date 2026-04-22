import type { ReactNode } from 'react';
import type { UserAddress, UserAffiliate } from '@/pages/dashboard/users/types/user.types';

import { useState } from 'react';
import { cn } from '@/utils/utils';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchUserById, useDemoteAffiliate } from '@/pages/dashboard/users/hooks/user';

import { CONFIG } from 'src/global-config';
import { Box, Dialog, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const HERO_PALETTES = [
  {
    gradient:
      'from-violet-500/[0.22] via-fuchsia-500/[0.1] to-background dark:from-violet-500/28 dark:via-fuchsia-950/38 dark:to-background',
    glow: 'bg-violet-400/35',
    orb: 'bg-fuchsia-500/20',
  },
  {
    gradient:
      'from-sky-500/[0.2] via-cyan-500/[0.1] to-background dark:from-sky-500/26 dark:via-cyan-950/35 dark:to-background',
    glow: 'bg-sky-400/30',
    orb: 'bg-cyan-500/18',
  },
  {
    gradient:
      'from-amber-500/[0.2] via-orange-500/[0.1] to-background dark:from-amber-500/26 dark:via-orange-950/38 dark:to-background',
    glow: 'bg-amber-400/32',
    orb: 'bg-orange-500/18',
  },
  {
    gradient:
      'from-emerald-500/[0.2] via-teal-500/[0.1] to-background dark:from-emerald-500/26 dark:via-teal-950/35 dark:to-background',
    glow: 'bg-emerald-400/28',
    orb: 'bg-teal-500/18',
  },
] as const;

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
        'overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-lg shadow-black/[0.04] backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-black/[0.06] dark:shadow-black/20',
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
        <div className="mt-0.5 text-sm font-medium text-foreground break-words">{value}</div>
      </div>
    </div>
  );
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function UserAffiliateSection({ aff }: { aff: UserAffiliate }) {
  const { t } = useTranslation('table');

  return (
    <SectionCard title={t('form.userDetailsAffiliate')} icon="solar:users-group-rounded-bold">
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Box className="space-y-2">
          <Typography variant="body2" className="text-muted-foreground font-medium">
            {t('form.affiliateIsAffiliate')}
          </Typography>
          <Typography variant="body1" className="text-foreground">
            {aff.is_affiliate ? t('yes') : t('no')}
          </Typography>
        </Box>
        <Box className="space-y-2">
          <Typography variant="body2" className="text-muted-foreground font-medium">
            {t('form.affiliateApproved')}
          </Typography>
          <Typography variant="body1" className="text-foreground">
            {aff.affiliate_approved ? t('yes') : t('no')}
          </Typography>
        </Box>
        {aff.affiliate_commission_type &&
          ['percentage_order', 'fixed_per_order', 'percentage_selected_products'].includes(
            String(aff.affiliate_commission_type)
          ) && (
            <Box className="space-y-2">
              <Typography variant="body2" className="text-muted-foreground font-medium">
                {t('form.affiliateCommissionType')}
              </Typography>
              <Typography variant="body1" className="text-foreground">
                {t(`form.affiliateCommissionType_${String(aff.affiliate_commission_type)}`)}
              </Typography>
            </Box>
          )}
        {aff.affiliate_id != null && aff.affiliate_id !== '' && (
          <Box className="space-y-2">
            <Typography variant="body2" className="text-muted-foreground font-medium">
              {t('form.affiliateIdLabel')}
            </Typography>
            <Typography variant="body1" className="text-foreground">
              {String(aff.affiliate_id)}
            </Typography>
          </Box>
        )}
        {aff.affiliate_rate != null && aff.affiliate_rate !== '' && (
          <Box className="space-y-2">
            <Typography variant="body2" className="text-muted-foreground font-medium">
              {t('form.affiliateRateLabel')}
            </Typography>
            <Typography variant="body1" className="text-foreground">
              {String(aff.affiliate_rate)}
              {(aff.affiliate_commission_type === 'percentage_order' ||
                aff.affiliate_commission_type === 'percentage_selected_products' ||
                !aff.affiliate_commission_type) &&
                '%'}
            </Typography>
          </Box>
        )}
        {aff.affiliate_fixed_commission != null && aff.affiliate_fixed_commission !== '' && (
          <Box className="space-y-2">
            <Typography variant="body2" className="text-muted-foreground font-medium">
              {t('form.affiliateFixedCommission')}
            </Typography>
            <Typography variant="body1" className="text-foreground">
              {String(aff.affiliate_fixed_commission)}
            </Typography>
          </Box>
        )}
        {aff.affiliate_product_ids && aff.affiliate_product_ids.length > 0 && (
          <Box className="space-y-2 md:col-span-2">
            <Typography variant="body2" className="text-muted-foreground font-medium">
              {t('form.affiliateProductIds')}
            </Typography>
            <Typography variant="body1" className="text-foreground font-mono text-sm">
              {aff.affiliate_product_ids.join(', ')}
            </Typography>
          </Box>
        )}
        {(aff.affiliate_visit_commission_enabled ||
          aff.affiliate_visit_commission_threshold != null ||
          aff.affiliate_visit_commission_amount != null) && (
          <>
            <Box className="space-y-2">
              <Typography variant="body2" className="text-muted-foreground font-medium">
                {t('form.affiliateVisitCommissionTitle')}
              </Typography>
              <Typography variant="body1" className="text-foreground">
                {aff.affiliate_visit_commission_enabled ? t('yes') : t('no')}
              </Typography>
            </Box>
            {aff.affiliate_visit_commission_enabled && (
              <>
                {aff.affiliate_visit_commission_threshold != null &&
                  String(aff.affiliate_visit_commission_threshold) !== '' && (
                    <Box className="space-y-2">
                      <Typography variant="body2" className="text-muted-foreground font-medium">
                        {t('form.affiliateVisitCommissionThreshold')}
                      </Typography>
                      <Typography variant="body1" className="text-foreground">
                        {String(aff.affiliate_visit_commission_threshold)}
                      </Typography>
                    </Box>
                  )}
                {aff.affiliate_visit_commission_amount != null &&
                  String(aff.affiliate_visit_commission_amount) !== '' && (
                    <Box className="space-y-2">
                      <Typography variant="body2" className="text-muted-foreground font-medium">
                        {t('form.affiliateVisitCommissionAmount')}
                      </Typography>
                      <Typography variant="body1" className="text-foreground">
                        {String(aff.affiliate_visit_commission_amount)}
                      </Typography>
                    </Box>
                  )}
              </>
            )}
          </>
        )}
      </Box>
    </SectionCard>
  );
}

function shouldShowAffiliateSection(aff: UserAffiliate | undefined): aff is UserAffiliate {
  if (!aff) return false;
  return !!(
    aff.is_affiliate ||
    aff.affiliate_approved ||
    aff.affiliate_id ||
    aff.affiliate_rate ||
    aff.affiliate_commission_type ||
    aff.affiliate_fixed_commission ||
    (aff.affiliate_product_ids && aff.affiliate_product_ids.length > 0) ||
    aff.affiliate_visit_commission_enabled ||
    aff.affiliate_visit_commission_threshold != null ||
    aff.affiliate_visit_commission_amount != null
  );
}

// ----------------------------------------------------------------------

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canUpdateUser = can('user.update');
  const [affiliateDemoteModalOpen, setAffiliateDemoteModalOpen] = useState(false);
  const demoteAffiliateMutation = useDemoteAffiliate();
  const { data: userResponse, isLoading, error } = useFetchUserById(id || '');

  const handleDemoteConfirm = async () => {
    if (!id) return;
    try {
      await demoteAffiliateMutation.mutateAsync(id);
      setAffiliateDemoteModalOpen(false);
      toast.success(t('form.affiliateDemoteSuccess'));
    } catch {
      return;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !userResponse?.data) {
    return (
      <Box className="flex min-h-[400px] w-full max-w-[100vw] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:danger-bold" className="h-5 w-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.userLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="mb-4 text-muted-foreground">
            {error instanceof Error ? error.message : t('form.userLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/users')}>
            {t('form.backToUsers')}
          </Button>
        </Box>
      </Box>
    );
  }

  const user = userResponse.data;
  const aff = user.affiliate;
  const stats = user.markter_statistics;
  const addresses = user.addresses ?? [];

  const palette = HERO_PALETTES[Math.abs(Number(user.id)) % HERO_PALETTES.length];

  const quickStats =
    stats != null
      ? [
          stats.total_orders != null
            ? { label: t('form.statTotalOrders'), value: String(stats.total_orders) }
            : null,
          stats.earned_commission != null
            ? { label: t('form.statEarnedCommission'), value: String(stats.earned_commission) }
            : null,
          stats.available_balance != null
            ? { label: t('form.statAvailableBalance'), value: String(stats.available_balance) }
            : null,
        ].filter((x): x is { label: string; value: string } => x != null)
      : [];

  const hasMarketerStats =
    stats != null &&
    [
      stats.total_orders,
      stats.delivered_orders,
      stats.total_sales,
      stats.earned_commission,
      stats.pending_earnings,
      stats.withdrawn,
      stats.available_balance,
    ].some((v) => v != null);

  return (
    <>
      <title>{t('form.userDetailsDocumentTitle', { appName: CONFIG.appName })}</title>

      <Box className="relative min-h-screen w-full overflow-x-hidden bg-background">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/25" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.04] dark:opacity-[0.06]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
        </Box>

        <Box className="relative w-full max-w-[100vw] px-4 pb-16 pt-2 sm:px-6 lg:px-8 xl:px-10">
          <Box className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="text"
              onClick={() => navigate('/users')}
              className="-ms-2 gap-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} />
              {t('form.backToUsers')}
            </Button>
            <Box className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/80 bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground">
                {t('form.userIdChip', { id: user.id })}
              </span>
              {canUpdateUser && aff?.is_affiliate && !aff.affiliate_approved && (
                <Button
                  variant="contained"
                  onClick={() =>
                    navigate(`/users/update/${id}`, {
                      state: { openAffiliatePromote: true, user },
                    })
                  }
                  className="gap-2"
                >
                  <Iconify icon="solar:rocket-bold" width={18} />
                  {t('form.userDetailsPromoteAffiliate')}
                </Button>
              )}
              {canUpdateUser && aff?.is_affiliate && aff.affiliate_approved && (
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={demoteAffiliateMutation.isPending}
                  onClick={() => setAffiliateDemoteModalOpen(true)}
                  className="gap-2"
                >
                  <Iconify icon="solar:user-minus-bold" width={18} />
                  {t('form.affiliateDemote')}
                </Button>
              )}
              <Button variant="contained" onClick={() => navigate(`/users/update/${id}`)} className="gap-2">
                <Iconify icon="solar:pen-bold" width={18} />
                {t('form.editUserButton')}
              </Button>
            </Box>
          </Box>

          {/* Hero — full width */}
          <Box
            className={cn(
              'relative mb-8 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br p-8 sm:p-10 lg:p-12',
              'shadow-[0_24px_80px_-24px_rgb(0_0_0/0.22)] dark:shadow-[0_24px_80px_-24px_rgb(0_0_0/0.45)]',
              palette.gradient
            )}
          >
            <Box
              className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: '24px 24px',
                color: 'rgb(var(--muted-foreground) / 0.22)',
              }}
            />
            <Box
              className={cn(
                'pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl',
                palette.glow
              )}
            />
            <Box
              className={cn(
                'pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full blur-3xl',
                palette.orb
              )}
            />

            <Box className="relative grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
              <Box className="lg:col-span-7">
                <Box className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-background/45 px-3 py-1.5 text-xs font-medium backdrop-blur-md dark:border-white/10 dark:bg-black/25">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-transparent dark:ring-offset-background">
                    <Iconify icon="solar:user-bold" width={14} />
                  </span>
                  <span className="text-muted-foreground">{t('tableNames.user')}</span>
                </Box>
                <Typography
                  variant="h3"
                  className="mb-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {user.name || t('form.userFallbackTitle', { id: user.id })}
                </Typography>
                <Typography variant="body1" className="max-w-xl text-pretty text-foreground/85">
                  {user.email}
                  {user.phone ? ` · ${user.phone}` : ''}
                </Typography>

                {quickStats.length > 0 && (
                  <Box className="mt-8 grid gap-3 sm:grid-cols-3">
                    {quickStats.map((qs) => (
                      <Box
                        key={qs.label}
                        className="rounded-2xl border border-white/20 bg-background/40 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-black/25"
                      >
                        <Typography variant="caption" className="text-muted-foreground">
                          {qs.label}
                        </Typography>
                        <Typography variant="body2" className="mt-1 font-semibold">
                          {qs.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Box className="flex justify-center lg:col-span-5 lg:justify-end">
                <Box className="relative w-full max-w-[min(100%,280px)]">
                  <Box className={cn('absolute -inset-3 rounded-[2rem] opacity-50 blur-xl', palette.glow)} />
                  <Box className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/30 bg-gradient-to-br from-primary/20 to-primary/5 shadow-2xl backdrop-blur-md dark:border-white/10">
                    <span className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">
                      {getInitials(user.name)}
                    </span>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Bento — full width grid */}
          <Box className="grid gap-6 lg:grid-cols-12">
            <Box className="space-y-6 lg:col-span-7">
              <SectionCard title={t('form.userDetailsBasicInfo')} icon="solar:info-circle-bold">
                <Box className="grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    icon="solar:hashtag-bold"
                    label={t('form.userDetailsUserId')}
                    value={String(user.id)}
                  />
                  <InfoRow icon="solar:user-bold" label={t('columns.name')} value={user.name || '-'} />
                  <InfoRow icon="solar:letter-bold" label={t('columns.email')} value={user.email} />
                  <InfoRow icon="solar:phone-bold" label={t('columns.phone')} value={user.phone || '-'} />
                </Box>
              </SectionCard>

              {shouldShowAffiliateSection(aff) && <UserAffiliateSection aff={aff} />}
            </Box>

            <Box className="space-y-6 lg:col-span-5">
              {hasMarketerStats && stats && (
                <SectionCard title={t('form.marketerStatistics')} icon="solar:chart-2-bold">
                  <Box className="grid grid-cols-2 gap-3 sm:gap-4">
                    {stats.total_orders != null && (
                      <Box className="rounded-xl border border-border/50 bg-muted/40 p-4 transition-colors hover:bg-muted/55">
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.statTotalOrders')}
                        </Typography>
                        <Typography variant="h6" className="mt-1 font-semibold">
                          {stats.total_orders}
                        </Typography>
                      </Box>
                    )}
                    {stats.delivered_orders != null && (
                      <Box className="rounded-xl border border-border/50 bg-muted/40 p-4 transition-colors hover:bg-muted/55">
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.statDeliveredOrders')}
                        </Typography>
                        <Typography variant="h6" className="mt-1 font-semibold">
                          {stats.delivered_orders}
                        </Typography>
                      </Box>
                    )}
                    {stats.total_sales != null && (
                      <Box className="rounded-xl border border-border/50 bg-muted/40 p-4 transition-colors hover:bg-muted/55">
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.statTotalSales')}
                        </Typography>
                        <Typography variant="h6" className="mt-1 font-semibold">
                          {stats.total_sales}
                        </Typography>
                      </Box>
                    )}
                    {stats.earned_commission != null && (
                      <Box className="rounded-xl border border-border/50 bg-muted/40 p-4 transition-colors hover:bg-muted/55">
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.statEarnedCommission')}
                        </Typography>
                        <Typography variant="h6" className="mt-1 font-semibold">
                          {stats.earned_commission}
                        </Typography>
                      </Box>
                    )}
                    {stats.pending_earnings != null && (
                      <Box className="rounded-xl border border-border/50 bg-muted/40 p-4 transition-colors hover:bg-muted/55">
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.statPendingEarnings')}
                        </Typography>
                        <Typography variant="h6" className="mt-1 font-semibold">
                          {stats.pending_earnings}
                        </Typography>
                      </Box>
                    )}
                    {stats.withdrawn != null && (
                      <Box className="rounded-xl border border-border/50 bg-muted/40 p-4 transition-colors hover:bg-muted/55">
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.statWithdrawn')}
                        </Typography>
                        <Typography variant="h6" className="mt-1 font-semibold">
                          {stats.withdrawn}
                        </Typography>
                      </Box>
                    )}
                    {stats.available_balance != null && (
                      <Box className="rounded-xl border border-border/50 bg-muted/40 p-4 transition-colors hover:bg-muted/55">
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.statAvailableBalance')}
                        </Typography>
                        <Typography variant="h6" className="mt-1 font-semibold">
                          {stats.available_balance}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </SectionCard>
              )}
            </Box>

            {addresses.length > 0 && (
              <Box className="lg:col-span-12">
                <SectionCard title={t('form.userDetailsAddresses')} icon="solar:map-point-bold">
                  <Box className="mb-4 flex items-center gap-2">
                    <Typography variant="body2" className="text-muted-foreground">
                      {addresses.length === 1
                        ? t('form.userDetailsAddressCountOne', { count: addresses.length })
                        : t('form.userDetailsAddressCount', { count: addresses.length })}
                    </Typography>
                  </Box>
                  <Box className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {addresses.map((addr: UserAddress) => (
                      <Box
                        key={addr.id}
                        className="rounded-2xl border border-border/50 bg-muted/20 p-5 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <Box className="mb-3 flex items-start justify-between gap-2">
                          <Typography variant="subtitle2" className="font-semibold text-foreground">
                            {addr.label || t('form.addressNumberFallback', { id: addr.id })}
                          </Typography>
                          {addr.is_default && (
                            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                              {t('form.addressDefaultBadge')}
                            </span>
                          )}
                        </Box>
                        <Box className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          {addr.street_name && (
                            <Box className="flex items-center gap-2">
                              <Iconify
                                icon="solar:map-point-bold"
                                className="shrink-0 text-primary"
                                width={16}
                              />
                              <span className="text-muted-foreground">{addr.street_name}</span>
                            </Box>
                          )}
                          {addr.building_number && (
                            <Box>
                              <Typography variant="caption" className="text-muted-foreground">
                                {t('form.addressBuildingLabel')}
                              </Typography>
                              <Typography variant="body2">{addr.building_number}</Typography>
                            </Box>
                          )}
                          {addr.floor_apartment && (
                            <Box>
                              <Typography variant="caption" className="text-muted-foreground">
                                {t('form.addressFloorApartmentLabel')}
                              </Typography>
                              <Typography variant="body2">{addr.floor_apartment}</Typography>
                            </Box>
                          )}
                          {addr.nearest_landmark && (
                            <Box>
                              <Typography variant="caption" className="text-muted-foreground">
                                {t('form.addressLandmarkLabel')}
                              </Typography>
                              <Typography variant="body2">{addr.nearest_landmark}</Typography>
                            </Box>
                          )}
                          {addr.contact_phone && (
                            <Box className="flex items-center gap-2">
                              <Iconify icon="solar:phone-bold" className="shrink-0 text-primary" width={16} />
                              <Typography variant="body2">{addr.contact_phone}</Typography>
                            </Box>
                          )}
                          {addr.lat != null && addr.lng != null && (
                            <Box>
                              <Typography variant="caption" className="text-muted-foreground">
                                {t('form.addressCoordinatesLabel')}
                              </Typography>
                              <Typography variant="body2">
                                {addr.lat}, {addr.lng}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        {addr.area && (
                          <Box className="mt-4 space-y-1 border-t border-border/50 pt-4 text-sm text-muted-foreground">
                            <Box className="flex items-center gap-2">
                              <Iconify icon="solar:map-point-bold" className="text-primary" width={16} />
                              <span>{t('form.addressAreaLine', { name: formatTranslated(addr.area.name) })}</span>
                            </Box>
                            {addr.area.city && (
                              <Box className="flex items-center gap-2">
                                <Iconify icon="solar:city-bold" className="text-primary" width={16} />
                                <span>
                                  {t('form.addressCityLine', { name: formatTranslated(addr.area.city.name) })}
                                </span>
                              </Box>
                            )}
                            {addr.area.city?.governorate && (
                              <Box className="flex items-center gap-2">
                                <Iconify icon="solar:global-bold" className="text-primary" width={16} />
                                <span>
                                  {t('form.addressGovernorateLine', {
                                    name: formatTranslated(addr.area.city.governorate.name),
                                  })}
                                </span>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </SectionCard>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={affiliateDemoteModalOpen}
        onClose={() =>
          !demoteAffiliateMutation.isPending && setAffiliateDemoteModalOpen(false)
        }
        maxWidth="sm"
        disableBackdropClick={demoteAffiliateMutation.isPending}
        title={t('form.affiliateDemote')}
        content={t('form.affiliateDemoteConfirm')}
        actions={
          <>
            <Button
              type="button"
              variant="outlined"
              disabled={demoteAffiliateMutation.isPending}
              onClick={() => setAffiliateDemoteModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              color="error"
              variant="contained"
              disabled={demoteAffiliateMutation.isPending}
              onClick={handleDemoteConfirm}
            >
              {demoteAffiliateMutation.isPending ? t('updating') : t('yes')}
            </Button>
          </>
        }
      />
    </>
  );
}
