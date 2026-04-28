import type { UserBasketScheduleItem } from '../types/user-basket-schedule.types';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatCurrency } from '@/utils/format-currency';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

import { useFetchUserBasketScheduleById } from '../hooks/user-basket-schedule';

// ----------------------------------------------------------------------

function itemsPreviewText(v: UserBasketScheduleItem['items_preview']): string {
  if (v == null) return '';
  return Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v).trim();
}

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('table');
  const { data: response, isLoading, error } = useFetchUserBasketScheduleById(id || '');
  const row = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !row) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            {t('form.userBasketScheduleDetailsError')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate(paths.dashboard.userBasketSchedules)}>
            {t('form.userBasketScheduleBackToList')}
          </Button>
        </Box>
      </Box>
    );
  }

  const preview = itemsPreviewText(row.items_preview);
  const discountText =
    row.discount_type === 'percentage' ? `${row.discount_value}%` : (row.discount_value ?? '—');
  const active = Boolean(row.is_active);

  return (
    <>
      <title>{t('form.userBasketScheduleDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="relative mx-auto w-full max-w-4xl">
          <Button
            variant="text"
            onClick={() => navigate(paths.dashboard.userBasketSchedules)}
            className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2 rtl:rotate-180" />{' '}
            {t('form.userBasketScheduleBackToList')}
          </Button>

          <Box className="mb-6 flex flex-wrap items-start gap-4 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
            {row.image ? (
              <img
                src={row.image}
                alt=""
                className="h-20 w-20 shrink-0 rounded-xl border border-border/50 object-cover"
              />
            ) : (
              <Box className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Iconify icon="solar:calendar-bold" className="text-primary" width={36} height={36} />
              </Box>
            )}
            <Box className="min-w-0 flex-1">
              <Typography variant="h4" className="mb-1 font-bold text-foreground">
                {row.name || '—'}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                {t('form.idChip', { id: row.id })}
              </Typography>
            </Box>
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                active
                  ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-400'
              }`}
            >
              {active ? t('active') : t('inactive')}
            </span>
          </Box>

          <Box className="grid gap-6 md:grid-cols-2">
            <Box className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <Typography variant="subtitle2" className="mb-4 font-semibold text-foreground">
                {t('columns.user')}
              </Typography>
              <Typography variant="body1" className="font-medium">
                {row.user?.name || '—'}
              </Typography>
              {row.user?.email && (
                <Typography variant="body2" className="mt-1 text-muted-foreground">
                  {row.user.email}
                </Typography>
              )}
              {row.user?.phone && (
                <Typography variant="body2" className="mt-1 text-muted-foreground">
                  {row.user.phone}
                </Typography>
              )}
            </Box>

            <Box className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <Typography variant="subtitle2" className="mb-4 font-semibold text-foreground">
                {t('form.scheduleLabel')}
              </Typography>
              <Typography variant="body1" className="font-medium">
                {row.schedule?.name || '—'}
              </Typography>
              <Typography variant="body2" className="mt-1 text-muted-foreground">
                {t('columns.everyNDays', { count: row.schedule?.interval_days ?? 0 })}
              </Typography>
            </Box>

            <Box className="md:col-span-2 rounded-2xl border border-border/60 bg-card/60 p-5">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('columns.itemsPreview')}
              </Typography>
              <Typography variant="body2" className="whitespace-pre-wrap text-muted-foreground">
                {preview || '—'}
              </Typography>
            </Box>

            <Box className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.varieties')}
              </Typography>
              <Typography variant="h6" className="mt-1 font-bold tabular-nums">
                {row.num_varieties ?? '—'}
              </Typography>
            </Box>

            <Box className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.discount')}
              </Typography>
              <Typography variant="h6" className="mt-1 font-bold">
                {discountText}
              </Typography>
            </Box>

            <Box className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.originalPrice')}
              </Typography>
              <Typography variant="h6" className="mt-1 font-bold tabular-nums">
                {row.original_price != null ? formatCurrency(row.original_price) : '—'}
              </Typography>
            </Box>

            <Box className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.discountAmount')}
              </Typography>
              <Typography variant="h6" className="mt-1 font-bold tabular-nums text-orange-700">
                {row.discount_amount != null ? formatCurrency(row.discount_amount) : '—'}
              </Typography>
            </Box>

            <Box className="md:col-span-2 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.finalPrice')}
              </Typography>
              <Typography variant="h5" className="mt-1 font-bold text-primary tabular-nums">
                {row.final_price != null ? formatCurrency(row.final_price) : '—'}
              </Typography>
            </Box>

            <Box className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.startDate')}
              </Typography>
              <Typography variant="body1" className="mt-1 font-medium tabular-nums">
                {row.start_date || '—'}
              </Typography>
            </Box>

            <Box className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.nextRunDate')}
              </Typography>
              <Typography variant="body1" className="mt-1 font-medium tabular-nums">
                {row.next_run_date || '—'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
