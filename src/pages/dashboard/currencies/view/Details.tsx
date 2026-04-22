import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchCurrencyById } from '@/pages/dashboard/currencies/hooks/currency';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

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
  const { data: response, isLoading, error } = useFetchCurrencyById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            {t('form.currencyLoadErrorTitle')}
          </Typography>
          <Typography variant="body2" className="mb-4 text-muted-foreground">
            {error instanceof Error ? error.message : t('form.currencyLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/currencies')}>
            {t('form.backToCurrencies')}
          </Button>
        </Box>
      </Box>
    );
  }

  const nameObj = typeof item.name === 'object' && item.name !== null ? item.name : null;
  const nameEn = nameObj?.en ?? (typeof item.name === 'string' ? item.name : '—');
  const nameAr = nameObj?.ar ?? '—';
  const displayTitle =
    nameEn !== '—' ? nameEn : nameAr !== '—' ? nameAr : item.code;

  return (
    <>
      <title>{t('form.currencyDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative w-full min-h-screen overflow-hidden bg-background">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/25" />
        <Box className="pointer-events-none fixed top-0 right-0 h-[min(60vh,520px)] w-[min(90vw,640px)] -translate-y-1/4 translate-x-1/4 rounded-full bg-amber-500/[0.07] blur-[100px]" />
        <Box className="pointer-events-none fixed bottom-0 left-0 h-[min(50vh,420px)] w-[min(80vw,520px)] translate-y-1/4 -translate-x-1/4 rounded-full bg-emerald-500/[0.06] blur-[90px]" />

        <Box className="relative w-full px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Button
            variant="text"
            onClick={() => navigate('/currencies')}
            className="-ml-2 mb-6 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
            {t('form.backToCurrencies')}
          </Button>

          {/* Hero */}
          <Box className="relative mb-8 overflow-hidden rounded-3xl border border-amber-500/15 bg-gradient-to-br from-card/95 via-card/90 to-amber-500/[0.04] shadow-lg shadow-amber-500/[0.04] ring-1 ring-border/40">
            <Box
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--border) / 0.45) 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />
            <Box className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
            <Box className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

            <Box className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between md:p-8 lg:p-10">
              <Box className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                <Box className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-3xl font-bold text-amber-600 shadow-inner dark:text-amber-400">
                  {item.symbol}
                </Box>
                <Box className="min-w-0">
                  <Box className="mb-2 flex flex-wrap items-center gap-2">
                    <Typography variant="h4" className="font-bold tracking-tight text-foreground">
                      {displayTitle}
                    </Typography>
                    <code className="rounded-lg border border-border/60 bg-muted/80 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {item.code}
                    </code>
                    {item.is_default && (
                      <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                        {t('form.defaultCurrencyLabel')}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        item.is_active
                          ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {item.is_active ? t('active') : t('inactive')}
                    </span>
                  </Box>
                  <Typography variant="body2" className="text-muted-foreground">
                    {t('form.currencyInformationSection')} · ID #{item.id}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                <Button
                  variant="contained"
                  onClick={() => navigate(`/currencies/update/${id}`)}
                  className="gap-2 shadow-md"
                >
                  <Iconify icon="solar:pen-bold" width={18} />
                  {t('edit')}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Stats */}
          <Box className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                icon: 'solar:tag-bold',
                label: t('columns.code'),
                value: item.code,
                accent: 'from-violet-500/15 to-transparent border-violet-500/20',
              },
              {
                icon: 'solar:dollar-minimalistic-bold',
                label: t('form.currencySymbolLabel'),
                value: item.symbol,
                accent: 'from-amber-500/15 to-transparent border-amber-500/20',
              },
              {
                icon: 'solar:chart-2-bold',
                label: t('form.currencyExchangeRateLabel'),
                value: String(item.exchange_rate ?? '—'),
                accent: 'from-emerald-500/15 to-transparent border-emerald-500/20',
              },
              {
                icon: 'solar:star-bold',
                label: t('columns.default'),
                value: item.is_default ? t('yes') : t('no'),
                accent: 'from-sky-500/15 to-transparent border-sky-500/20',
              },
              {
                icon: 'solar:check-circle-bold',
                label: t('columns.status'),
                value: item.is_active ? t('active') : t('inactive'),
                accent: 'from-primary/15 to-transparent border-primary/25',
              },
            ].map((stat) => (
              <Box
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${stat.accent} p-4 shadow-sm transition-shadow hover:shadow-md`}
              >
                <Box className="mb-3 flex items-center justify-between gap-2">
                  <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/70 ring-1 ring-border/50">
                    <Iconify icon={stat.icon} width={20} className="text-foreground/80" />
                  </Box>
                </Box>
                <Typography variant="caption" className="block text-muted-foreground">
                  {stat.label}
                </Typography>
                <Typography variant="h6" className="mt-0.5 font-bold tracking-tight break-all">
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box className="grid gap-6 xl:grid-cols-2">
            <Box className="rounded-2xl border border-border/50 bg-card/70 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Box className="border-b border-border/40 bg-muted/30 px-5 py-4">
                <Box className="flex items-center gap-2">
                  <Iconify icon="solar:global-bold" width={20} className="text-primary" />
                  <Typography variant="h6" className="font-semibold">
                    {t('form.currencyNameEnLabel')} / {t('form.currencyNameArLabel')}
                  </Typography>
                </Box>
              </Box>
              <Box className="space-y-4 p-5">
                <FieldBox label={t('form.currencyNameEnLabel')}>
                  <Typography variant="body1" className="font-medium">
                    {nameEn}
                  </Typography>
                </FieldBox>
                <FieldBox label={t('form.currencyNameArLabel')}>
                  <Typography variant="body1" className="font-medium" dir="rtl">
                    {nameAr}
                  </Typography>
                </FieldBox>
              </Box>
            </Box>

            <Box className="rounded-2xl border border-border/50 bg-card/70 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Box className="border-b border-border/40 bg-muted/30 px-5 py-4">
                <Box className="flex items-center gap-2">
                  <Iconify icon="solar:clock-circle-bold" width={20} className="text-primary" />
                  <Typography variant="h6" className="font-semibold">
                    {t('columns.created')} / {t('columns.updatedAt')}
                  </Typography>
                </Box>
              </Box>
              <Box className="grid gap-4 p-5 sm:grid-cols-1">
                <FieldBox label={t('columns.created')}>
                  <Typography variant="body2" className="font-medium text-foreground/90">
                    {item.created_at}
                  </Typography>
                </FieldBox>
                <FieldBox label={t('columns.updatedAt')}>
                  <Typography variant="body2" className="font-medium text-foreground/90">
                    {item.updated_at}
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
