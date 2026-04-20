import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { cn } from '@/utils/utils';
import { useFetchBrandById } from '@/pages/dashboard/products/hooks/brand';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
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
  const { data: brandResponse, isLoading, error } = useFetchBrandById(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !brandResponse?.data) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.brandLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.brandLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/products/brands')}>
            {t('form.backToBrands')}
          </Button>
        </Box>
      </Box>
    );
  }

  const brand = brandResponse.data;
  const img = brand.image;
  const imageUrl = img
    ? String(img).startsWith('http')
      ? img
      : `${CONFIG.serverUrl}/${img}`
    : null;
  const brandName = formatTranslated(brand.name as Parameters<typeof formatTranslated>[0]);

  const palette = HERO_PALETTES[Math.abs(Number(brand.id)) % HERO_PALETTES.length];

  const categoryLabel = brand.category
    ? formatTranslated(brand.category.name as Parameters<typeof formatTranslated>[0])
    : null;
  const governorateLabel = brand.governorate?.name ?? null;
  const cityLabel = brand.city
    ? formatTranslated(brand.city.name as Parameters<typeof formatTranslated>[0])
    : null;

  return (
    <>
      <title>{t('form.brandDetailsDocTitle', { app: CONFIG.appName })}</title>

      <Box className="relative min-h-screen w-full overflow-x-hidden bg-background">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/25" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.04] dark:opacity-[0.06]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </Box>

        <Box className="relative w-full max-w-[100vw] px-4 pb-16 pt-2 sm:px-6 lg:px-8 xl:px-10">
          <Box className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="text"
              onClick={() => navigate('/products/brands')}
              className="-ms-2 gap-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} />
              {t('form.backToBrands')}
            </Button>
            <Box className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/80 bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground">
                ID · {brand.id}
              </span>
              <Button
                variant="contained"
                onClick={() => navigate(`/products/brands/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                {t('form.editBrand')}
              </Button>
            </Box>
          </Box>

          {/* Hero — full width within padded container */}
          <Box
            className={cn(
              'relative mb-8 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br p-8 sm:p-10 lg:p-12',
              'shadow-[0_24px_80px_-24px_rgb(0_0_0/0.22)] dark:shadow-[0_24px_80px_-24px_rgb(0_0_0/0.45)]',
              palette.gradient
            )}
          >
            {imageUrl ? (
              <Box
                className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center opacity-[0.18] blur-3xl dark:opacity-[0.12]"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            ) : null}

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
                    <Iconify icon="solar:star-bold" width={14} />
                  </span>
                  <span className="text-muted-foreground">{t('form.brand')}</span>
                </Box>
                <Typography
                  variant="h3"
                  className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {brandName}
                </Typography>
                <Typography variant="body1" className="max-w-xl text-pretty text-foreground/85">
                  {t('form.brandDetailsSubtitle')}
                </Typography>

                <Box className="mt-8 grid gap-3 sm:grid-cols-3">
                  <Box className="rounded-2xl border border-white/20 bg-background/40 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-black/25">
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('columns.createdAt')}
                    </Typography>
                    <Typography variant="body2" className="mt-1 font-medium">
                      {new Date(brand.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box className="rounded-2xl border border-white/20 bg-background/40 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-black/25">
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('columns.updatedAt')}
                    </Typography>
                    <Typography variant="body2" className="mt-1 font-medium">
                      {new Date(brand.updated_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box className="rounded-2xl border border-white/20 bg-background/40 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-black/25">
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.brandDetailIdLabel')}
                    </Typography>
                    <Typography variant="body2" className="mt-1 font-mono font-semibold">
                      #{brand.id}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="flex justify-center lg:col-span-5 lg:justify-end">
                <Box className="relative w-full max-w-[min(100%,320px)]">
                  <Box className={cn('absolute -inset-3 rounded-[2rem] opacity-50 blur-xl', palette.glow)} />
                  <Box className="relative aspect-square w-full overflow-hidden rounded-[1.75rem] border border-white/30 bg-background/50 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-black/35">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      />
                    ) : (
                      <Box className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                        <Iconify
                          icon="solar:gallery-add-bold"
                          className="text-muted-foreground/45"
                          width={64}
                          height={64}
                        />
                        <Typography variant="body2" className="text-muted-foreground">
                          {t('form.brandNoImage')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Bento — full width grid */}
          <Box className="grid gap-6 lg:grid-cols-12">
            <Box className="space-y-4 lg:col-span-7">
              <SectionCard title={t('form.brandDetailSectionBasic')} icon="solar:info-circle-bold">
                <Box className="grid gap-3 sm:grid-cols-2">
                  <InfoRow icon="solar:hashtag-bold" label={t('form.brandDetailIdLabel')} value={`#${brand.id}`} />
                  <InfoRow icon="solar:flag-bold" label={t('form.brandDetailNameLabel')} value={brandName} />
                  <InfoRow
                    icon="solar:calendar-date-bold"
                    label={t('columns.createdAt')}
                    value={new Date(brand.created_at).toLocaleString()}
                  />
                  <InfoRow
                    icon="solar:calendar-date-bold"
                    label={t('columns.updatedAt')}
                    value={new Date(brand.updated_at).toLocaleString()}
                  />
                </Box>
              </SectionCard>
            </Box>

            <Box className="lg:col-span-5">
              <SectionCard title={t('form.brandImageSection')} icon="solar:gallery-add-bold">
                {imageUrl ? (
                  <Box className="relative overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                    <img
                      src={imageUrl}
                      alt={brandName}
                      className="aspect-[4/3] w-full object-contain p-4 sm:aspect-video"
                    />
                  </Box>
                ) : (
                  <Box className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-14">
                    <Iconify
                      icon="solar:gallery-add-bold"
                      className="mb-2 text-muted-foreground/40"
                      width={48}
                      height={48}
                    />
                    <Typography variant="body2" className="text-muted-foreground">
                      {t('form.brandNoImage')}
                    </Typography>
                  </Box>
                )}
              </SectionCard>

              {(categoryLabel || governorateLabel || cityLabel) && (
                <SectionCard
                  title={t('columns.location')}
                  icon="solar:map-point-bold"
                  className="mt-6"
                >
                  <Box className="space-y-3">
                    {categoryLabel ? (
                      <InfoRow
                        icon="solar:widget-4-bold"
                        label={t('columns.category')}
                        value={categoryLabel}
                      />
                    ) : null}
                    {governorateLabel ? (
                      <InfoRow
                        icon="solar:buildings-bold"
                        label={t('columns.governorate')}
                        value={governorateLabel}
                      />
                    ) : null}
                    {cityLabel ? (
                      <InfoRow icon="solar:city-bold" label={t('columns.city')} value={cityLabel} />
                    ) : null}
                  </Box>
                </SectionCard>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
