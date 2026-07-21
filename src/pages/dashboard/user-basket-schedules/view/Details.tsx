import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';
import type {
  UserBasketScheduleItem,
  UserBasketScheduleLineItem,
  UserBasketScheduleCurrencyAmount,
} from '../types/user-basket-schedule.types';

import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { fDate, fDateTime } from '@/utils/format-time';
import { normalizeIndicNumeralsToLatin } from '@/utils/numeral-locale';
import { formatCurrency, formatMoneyLine, formatApiCurrencyAmountForLanguage } from '@/utils/format-currency';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

import { useFetchUserBasketScheduleById } from '../hooks/user-basket-schedule';

// ----------------------------------------------------------------------

function itemsPreviewText(v: UserBasketScheduleItem['items_preview']): string {
  if (v == null) return '';
  const s = Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v).trim();
  return normalizeIndicNumeralsToLatin(s);
}

function basketDiscountLabel(discountType: string, discountValue: string | number | undefined): string {
  if (discountValue === undefined || discountValue === '') return '—';
  const raw = discountType === 'percentage' ? `${discountValue}%` : String(discountValue);
  return normalizeIndicNumeralsToLatin(raw);
}

function variantLabelText(variant: UserBasketScheduleLineItem['variant']): string {
  const names = variant?.name?.filter(Boolean) ?? [];
  if (names.length) return names.join(' · ');
  return '—';
}

function displaySmartDate(raw: string | null | undefined, withTime: boolean): string {
  if (!raw?.trim()) return '—';
  if (!dayjs(raw).isValid()) return normalizeIndicNumeralsToLatin(raw.trim());
  return withTime ? fDateTime(raw) : fDate(raw);
}

function SectionShell({
  title,
  icon,
  children,
  className,
  id,
}: {
  title: string;
  icon: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const titleId = id ? `${id}-title` : undefined;
  return (
    <Box
      className={`overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.04] ${className ?? ''}`}
      {...(id ? { component: 'section' as const, 'aria-labelledby': titleId } : {})}
    >
      <Box className="flex items-center gap-3 border-b border-border/50 bg-gradient-to-s from-muted/40 to-transparent px-4 py-3.5 sm:px-5">
        <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Iconify icon={icon} width={22} height={22} />
        </Box>
        <Typography id={titleId} variant="subtitle1" className="font-semibold tracking-tight text-foreground">
          {title}
        </Typography>
      </Box>
      <Box className="p-4 sm:p-5">{children}</Box>
    </Box>
  );
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Box className="flex min-w-0 items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-background">
      <Iconify icon={icon} width={18} className="shrink-0 text-primary" />
      <Box className="min-w-0">
        <Typography variant="caption" className="block leading-tight text-muted-foreground">
          {label}
        </Typography>
        <Typography variant="body2" className="truncate font-semibold tabular-nums text-foreground">
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function CollapsibleCurrencies({
  label,
  toggleLabel,
  currencies,
}: {
  label: string;
  toggleLabel: string;
  currencies?: Record<string, UserBasketScheduleCurrencyAmount>;
}) {
  const entries = currencies ? Object.entries(currencies) : [];
  if (!entries.length) return null;
  return (
    <details className="group mt-2 rounded-xl border border-border/50 bg-muted/15 open:border-primary/25 open:bg-primary/[0.04]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-semibold text-primary [&::-webkit-details-marker]:hidden">
        <Iconify
          icon="solar:alt-arrow-down-bold"
          width={16}
          className="shrink-0 transition-transform duration-200 group-open:rotate-180"
        />
        <span>{toggleLabel}</span>
      </summary>
      <Box className="border-t border-border/40 px-3 py-2.5">
        <Typography variant="caption" className="mb-1.5 block text-muted-foreground">
          {label}
        </Typography>
        <Box className="flex flex-wrap gap-1.5">
          {entries.map(([code, row]) => (
            <span
              key={code}
              className="inline-flex items-center rounded-lg border border-border/60 bg-background/90 px-2.5 py-1 text-xs font-medium tabular-nums text-foreground shadow-sm"
            >
              {formatApiCurrencyAmountForLanguage({
                amount: row.amount,
                currency: row.currency || code,
                symbol: row.symbol,
              })}
            </span>
          ))}
        </Box>
      </Box>
    </details>
  );
}

function MetaChip({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 px-2.5 py-1 text-xs text-muted-foreground">
      <Iconify icon={icon} width={14} className="shrink-0 opacity-80" />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

function PricingJourney({
  row,
  discountText,
  t,
}: {
  row: UserBasketScheduleItem;
  discountText: string;
  t: TFunction<'table'>;
}) {
  const original = row.original_price != null ? formatCurrency(row.original_price) : '—';
  const discAmt = row.discount_amount != null ? formatCurrency(row.discount_amount) : '—';
  const final = row.final_price != null ? formatCurrency(row.final_price) : '—';

  const Arrow = () => (
    <Box
      className="flex shrink-0 items-center justify-center text-muted-foreground/35 md:min-h-[4.5rem] md:px-1"
      aria-hidden
    >
      <Iconify icon="solar:arrow-down-bold" width={22} className="md:hidden" />
      <Iconify icon="solar:arrow-right-bold" width={28} className="hidden md:block rtl:rotate-180" />
    </Box>
  );

  const Step = ({
    kicker,
    value,
    sub,
    emphasize,
  }: {
    kicker: string;
    value: ReactNode;
    sub?: ReactNode;
    emphasize?: boolean;
  }) => (
    <Box
      className={`flex min-w-0 flex-1 flex-col justify-center rounded-2xl border p-4 sm:p-5 ${
        emphasize
          ? 'border-primary/30 bg-gradient-to-br from-primary/14 via-primary/8 to-transparent shadow-inner'
          : 'border-border/60 bg-muted/10'
      }`}
    >
      <Typography variant="caption" className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
        {kicker}
      </Typography>
      <Typography
        variant={emphasize ? 'h5' : 'h6'}
        className={`font-bold tabular-nums ${emphasize ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </Typography>
      {sub ? (
        <Typography variant="caption" className="mt-1.5 text-muted-foreground">
          {sub}
        </Typography>
      ) : null}
    </Box>
  );

  return (
    <Box className="flex flex-col gap-0 md:flex-row md:items-stretch md:gap-0">
      <Step kicker={t('columns.originalPrice')} value={original} />
      <Arrow />
      <Step
        kicker={t('columns.discount')}
        value={discountText}
        sub={
          <span className="font-semibold text-orange-700 dark:text-orange-400">
            {t('columns.discountAmount')}: {discAmt}
          </span>
        }
      />
      <Arrow />
      <Step kicker={t('columns.finalPrice')} value={final} emphasize />
    </Box>
  );
}

function QuickAside({
  row,
  itemsCount,
  t,
  onCopyId,
}: {
  row: UserBasketScheduleItem;
  itemsCount: number;
  t: TFunction<'table'>;
  onCopyId: () => void;
}) {
  return (
    <Box className="rounded-2xl border border-border/60 bg-card p-5 shadow-md ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <Typography variant="overline" className="mb-3 block font-bold tracking-wider text-primary">
        {t('orders.orderOverview')}
      </Typography>
      <Box className="space-y-4">
        <Box>
          <Typography variant="caption" className="text-muted-foreground">
            {t('columns.user')}
          </Typography>
          <Typography variant="body1" className="mt-0.5 font-semibold leading-snug">
            {row.user?.name || '—'}
          </Typography>
          {row.user?.email ? (
            <Typography variant="caption" className="mt-1 block truncate text-muted-foreground">
              {row.user.email}
            </Typography>
          ) : null}
        </Box>
        <Box className="h-px bg-border/60" />
        <Box className="grid gap-3">
          <Box>
            <Typography variant="caption" className="text-muted-foreground">
              {t('form.scheduleLabel')}
            </Typography>
            <Typography variant="body2" className="mt-0.5 font-medium">
              {row.schedule?.name || '—'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" className="text-muted-foreground">
              {t('columns.nextRunDate')}
            </Typography>
            <Typography variant="body2" className="mt-0.5 font-semibold tabular-nums">
              {displaySmartDate(row.next_run_date, false)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" className="text-muted-foreground">
              {t('columns.items')}
            </Typography>
            <Typography variant="body2" className="mt-0.5 font-semibold tabular-nums">
              {itemsCount}
            </Typography>
          </Box>
        </Box>
        <Box className="rounded-xl border border-primary/25 bg-primary/[0.06] p-4">
          <Typography variant="caption" className="text-muted-foreground">
            {t('columns.finalPrice')}
          </Typography>
          <Typography variant="h5" className="mt-1 font-bold tabular-nums text-primary">
            {row.final_price != null ? formatCurrency(row.final_price) : '—'}
          </Typography>
        </Box>
       
      </Box>
    </Box>
  );
}

function LineItemCard({
  item,
  t,
  index,
  language,
}: {
  item: UserBasketScheduleLineItem;
  t: TFunction<'table'>;
  index: number;
  language: string;
}) {
  const variantNames = variantLabelText(item.variant);
  const lineAfter = item.quantity * item.price_after_discount;
  const lineTotalDisplay = formatApiCurrencyAmountForLanguage(
    {
      amount: lineAfter,
      currency: item.currency,
      symbol: item.currency_symbol,
    },
    language
  );

  const availKey = item.is_available
    ? 'form.userBasketScheduleAvailAvailable'
    : 'form.userBasketScheduleAvailUnavailable';

  return (
    <Box className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <Box
        className="absolute start-0 top-0 h-full w-1 bg-gradient-to-b from-primary/80 to-primary/20 opacity-90"
        aria-hidden
      />
      <Box className="flex items-center justify-between gap-2 border-b border-border/40 bg-muted/15 ps-4 pe-4 py-2.5 sm:ps-5 sm:pe-5">
        <Typography variant="caption" className="font-semibold uppercase tracking-wide text-muted-foreground">
          {t('tableNames.product')} · #{index + 1}
        </Typography>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
            item.is_available
              ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400'
              : 'border-rose-500/35 bg-rose-500/10 text-rose-800 dark:text-rose-400'
          }`}
        >
          {t(availKey)}
        </span>
      </Box>

      <Box className="p-4 ps-5 sm:p-5 sm:ps-6">
        <Box className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <Box className="flex min-w-0 flex-1 gap-4">
            {item.product?.image ? (
              <img
                src={item.product.image}
                alt=""
                className="h-20 w-20 shrink-0 rounded-2xl border border-border/50 object-cover shadow-sm sm:h-24 sm:w-24"
              />
            ) : (
              <Box className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 sm:h-24 sm:w-24">
                <Iconify icon="solar:box-bold" width={32} className="text-muted-foreground" />
              </Box>
            )}
            <Box className="min-w-0 flex-1 space-y-1">
              <Typography variant="subtitle1" className="font-bold leading-snug text-foreground">
                {item.product?.name || '—'}
              </Typography>
              {variantNames !== '—' ? (
                <Typography variant="body2" className="text-primary/90">
                  {variantNames}
                </Typography>
              ) : null}
              {item.product?.brand?.name ? (
                <Box className="flex items-center gap-2 pt-0.5">
                  {item.product.brand.image ? (
                    <img
                      src={item.product.brand.image}
                      alt=""
                      className="h-7 w-7 rounded-full border border-border/50 object-cover"
                    />
                  ) : null}
                  <Typography variant="caption" className="text-muted-foreground">
                    <span className="font-medium text-foreground/80">{t('form.brand')}:</span>{' '}
                    {item.product.brand.name}
                  </Typography>
                </Box>
              ) : null}
              <Box className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                <Typography variant="caption" className="text-muted-foreground">
                  <span className="font-medium text-foreground/70">{t('columns.sku')}</span> ·{' '}
                  {item.variant?.sku || '—'}
                </Typography>
                {item.variant?.model ? (
                  <Typography variant="caption" className="text-muted-foreground">
                    <span className="font-medium text-foreground/70">{t('form.model')}</span> ·{' '}
                    {item.variant.model}
                  </Typography>
                ) : null}
                {item.variant?.barcode ? (
                  <Typography variant="caption" className="text-muted-foreground">
                    <span className="font-medium text-foreground/70">{t('form.barcode')}</span> ·{' '}
                    {item.variant.barcode}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Box>

          <Box className="grid w-full shrink-0 gap-3 sm:grid-cols-2 lg:w-[min(100%,28rem)] lg:grid-cols-2">
            <Box className="rounded-xl border border-border/50 bg-muted/10 p-3.5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('form.quantity')}
              </Typography>
              <Typography variant="h6" className="mt-1 font-bold tabular-nums">
                {item.quantity}
              </Typography>
            </Box>
            <Box className="rounded-xl border border-border/50 bg-muted/10 p-3.5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.originalPrice')}
              </Typography>
              <Typography variant="body1" className="mt-1 font-semibold tabular-nums">
                {formatMoneyLine(item.original_price_formatted, item.original_price)}
              </Typography>
              <CollapsibleCurrencies
                label={t('form.userBasketScheduleDetailConvertedAmounts')}
                toggleLabel={t('form.userBasketScheduleToggleCurrencies')}
                currencies={item.original_price_currencies}
              />
            </Box>
            <Box className="rounded-xl border border-border/50 bg-muted/10 p-3.5">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.discountAmount')}
              </Typography>
              <Typography
                variant="body1"
                className="mt-1 font-semibold tabular-nums text-orange-700 dark:text-orange-400"
              >
                {formatMoneyLine(item.discount_amount_formatted, item.discount_amount)}
              </Typography>
              <CollapsibleCurrencies
                label={t('form.userBasketScheduleDetailConvertedAmounts')}
                toggleLabel={t('form.userBasketScheduleToggleCurrencies')}
                currencies={item.discount_amount_currencies}
              />
            </Box>
            <Box className="rounded-xl border border-primary/20 bg-primary/[0.07] p-3.5 sm:col-span-2 lg:col-span-2">
              <Typography variant="caption" className="text-muted-foreground">
                {t('columns.priceAfterDiscount')}
              </Typography>
              <Typography variant="h6" className="mt-1 font-bold tabular-nums text-primary">
                {formatMoneyLine(item.price_after_discount_formatted, item.price_after_discount)}
              </Typography>
              <Typography variant="caption" className="mt-2 block text-muted-foreground">
                {t('form.userBasketScheduleDetailLineTotal')}:{' '}
                <span className="font-bold text-foreground">{lineTotalDisplay}</span>
              </Typography>
              <CollapsibleCurrencies
                label={t('form.userBasketScheduleDetailConvertedAmounts')}
                toggleLabel={t('form.userBasketScheduleToggleCurrencies')}
                currencies={item.price_after_discount_currencies}
              />
            </Box>
          </Box>
        </Box>

        <Box className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
          <MetaChip icon="solar:info-circle-bold">
            {t('form.userBasketScheduleDetailAvailability')}:{' '}
            {item.availability_status === 'unknown' || !item.availability_status
              ? t('form.userBasketScheduleAvailUnknown')
              : item.availability_status}
          </MetaChip>
          {item.available_quantity != null ? (
            <MetaChip icon="solar:box-minimalistic-bold">
              {t('columns.stock')}: {item.available_quantity}
            </MetaChip>
          ) : null}
          <MetaChip icon="solar:delivery-bold">
            {item.product?.is_instant_delivery === 1
              ? t('form.userBasketScheduleDetailInstantYes')
              : t('form.userBasketScheduleDetailInstantNo')}
          </MetaChip>
          <MetaChip icon="solar:tag-bold">
            {t('form.userBasketScheduleDetailShopVariant', { id: item.shop_product_variant_id })}
            {item.resolved_shop_product_variant_id != null
              ? ` · ${t('form.userBasketScheduleDetailResolvedVariant', { id: item.resolved_shop_product_variant_id })}`
              : ''}
          </MetaChip>
        </Box>
      </Box>
    </Box>
  );
}

function DetailField({
  label,
  value,
  mono,
  hint,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  hint?: string;
}) {
  return (
    <Box>
      <Typography variant="caption" className="mb-0.5 block font-medium text-muted-foreground">
        {label}
      </Typography>
      <Typography
        variant="body1"
        component="div"
        className={`font-medium text-foreground ${mono ? 'tabular-nums' : ''}`}
      >
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" className="mt-0.5 block text-muted-foreground/80">
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('table');
  const { data: response, isLoading, error } = useFetchUserBasketScheduleById(id || '');
  const row = response?.data;
  const [userPhotoBroken, setUserPhotoBroken] = useState(false);

  const copyScheduleId = useCallback(async () => {
    if (!row?.id) return;
    try {
      await navigator.clipboard.writeText(String(row.id));
      toast.success(t('form.userBasketScheduleIdCopied'));
    } catch {
      toast.error(t('deleteError'));
    }
  }, [row?.id, t]);

  if (isLoading) return <LoadingScreen />;

  if (error || !row) {
    return (
      <Box className="flex min-h-[420px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg">
          <Box className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Iconify icon="solar:danger-circle-bold" width={32} />
          </Box>
          <Typography variant="h6" className="mb-2 text-destructive">
            {t('form.userBasketScheduleDetailsError')}
          </Typography>
          <Button variant="contained" onClick={() => navigate(paths.dashboard.userBasketSchedules)} className="w-full sm:w-auto">
            {t('form.userBasketScheduleBackToList')}
          </Button>
        </Box>
      </Box>
    );
  }

  const preview = itemsPreviewText(row.items_preview);
  const discountText = basketDiscountLabel(row.discount_type, row.discount_value);
  const active = Boolean(row.is_active);
  const items = row.items ?? [];
  const userImg = row.user?.image?.trim();
  const scheduleDiscountText =
    row.schedule?.discount_type && row.schedule.discount_value != null && row.schedule.discount_value !== ''
      ? basketDiscountLabel(String(row.schedule.discount_type), row.schedule.discount_value)
      : null;

  const intervalDays = row.schedule?.interval_days ?? 0;
  const intervalLabel =
    intervalDays === 1
      ? t('form.userBasketScheduleIntervalDaily')
      : t('columns.everyNDays', { count: intervalDays });

  return (
    <>
      <title>{t('form.userBasketScheduleDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box
        component="main"
        className="relative min-h-screen bg-gradient-to-b from-muted/35 via-background to-background pb-14 pt-2 sm:pb-20 sm:pt-4"
      >
        <Box className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <Button
            variant="text"
            size="small"
            onClick={() => navigate(paths.dashboard.userBasketSchedules)}
            className="-ms-1 mb-5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="me-2 rtl:rotate-180" />
            {t('form.userBasketScheduleBackToList')}
          </Button>

          <Box className="xl:grid xl:grid-cols-12 xl:items-start xl:gap-8">
            <Box className="min-w-0 space-y-5 xl:col-span-8">
              {/* Hero */}
              <Box className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-md ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
                <Box className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
                  {row.image ? (
                    <img
                      src={row.image}
                      alt=""
                      className="mx-auto h-24 w-24 shrink-0 rounded-2xl border border-border/50 object-cover shadow-sm sm:mx-0 sm:h-28 sm:w-28"
                    />
                  ) : (
                    <Box className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 sm:mx-0 sm:h-28 sm:w-28">
                      <Iconify icon="solar:calendar-bold" className="text-primary" width={40} height={40} />
                    </Box>
                  )}
                  <Box className="min-w-0 flex-1 text-center sm:text-start">
                    <Box className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          active
                            ? 'border-emerald-500/35 bg-emerald-500/12 text-emerald-800 dark:text-emerald-400'
                            : 'border-rose-500/35 bg-rose-500/12 text-rose-800 dark:text-rose-400'
                        }`}
                      >
                        {active ? t('active') : t('inactive')}
                      </span>
                      {items.length > 0 ? (
                        <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {items.length} {t('columns.items')}
                        </span>
                      ) : null}
                    </Box>
                    <Typography variant="h4" className="mb-2 font-bold tracking-tight text-foreground">
                      {row.name || '—'}
                    </Typography>
                   
                    {row.schedule?.name ? (
                      <Typography variant="body2" className="mt-2 text-muted-foreground">
                        <span className="font-medium text-foreground/85">{t('form.scheduleLabel')}:</span>{' '}
                        {row.schedule.name}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
                <Box className="grid gap-2 border-t border-border/50 bg-muted/20 p-4 sm:grid-cols-3 sm:gap-3 sm:p-5">
                  <StatChip
                    icon="solar:layers-bold"
                    label={t('columns.varieties')}
                    value={String(row.num_varieties ?? '—')}
                  />
                  <StatChip
                    icon="solar:calendar-mark-bold"
                    label={t('columns.nextRunDate')}
                    value={displaySmartDate(row.next_run_date, false)}
                  />
                  <StatChip
                    icon="solar:wallet-money-bold"
                    label={t('columns.finalPrice')}
                    value={row.final_price != null ? formatCurrency(row.final_price) : '—'}
                  />
                </Box>
              </Box>

              <Box className="grid gap-5 lg:grid-cols-2">
                <SectionShell id="ubs-user" title={t('columns.user')} icon="solar:user-circle-bold">
                  <Box className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {userImg && !userPhotoBroken ? (
                      <img
                        src={userImg}
                        alt=""
                        className="mx-auto h-20 w-20 shrink-0 rounded-2xl border border-border/50 object-cover shadow-sm sm:mx-0"
                        onError={() => setUserPhotoBroken(true)}
                      />
                    ) : (
                      <Box className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/35 sm:mx-0">
                        <Iconify icon="solar:user-bold" width={36} className="text-muted-foreground" />
                      </Box>
                    )}
                    <Box className="min-w-0 flex-1 space-y-3 text-center sm:text-start">
                      <DetailField label={t('columns.name')} value={row.user?.name || '—'} />
                      <DetailField label="ID" value={row.user?.id ?? '—'} mono />
                      {row.user?.email ? (
                        <DetailField
                          label={t('columns.email')}
                          value={
                            <a
                              href={`mailto:${row.user.email}`}
                              className="text-primary underline-offset-2 hover:underline"
                            >
                              {row.user.email}
                            </a>
                          }
                        />
                      ) : null}
                      {row.user?.phone ? (
                        <DetailField
                          label={t('columns.phone')}
                          value={
                            <a
                              href={`tel:${row.user.phone.replace(/\s/g, '')}`}
                              className="text-primary underline-offset-2 hover:underline"
                              dir="ltr"
                            >
                              {row.user.phone}
                            </a>
                          }
                        />
                      ) : null}
                    </Box>
                  </Box>
                </SectionShell>

                <SectionShell id="ubs-schedule" title={t('form.userBasketScheduleDetailRecurrence')} icon="solar:history-bold">
                  <Box className="space-y-4">
                    <DetailField label={t('form.scheduleLabel')} value={row.schedule?.name || '—'} />
                    <DetailField label={t('form.intervalDays')} value={intervalLabel} />
                    {scheduleDiscountText ? (
                      <DetailField
                        label={t('columns.discount')}
                        value={<span className="font-bold text-foreground">{scheduleDiscountText}</span>}
                      />
                    ) : null}
                    {row.schedule?.is_active != null ? (
                      <DetailField
                        label={t('columns.status')}
                        value={
                          <span
                            className={
                              row.schedule.is_active
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }
                          >
                            {row.schedule.is_active ? t('active') : t('inactive')}
                          </span>
                        }
                      />
                    ) : null}
                  </Box>
                </SectionShell>
              </Box>

              <SectionShell id="ubs-pricing" title={t('orders.pricing')} icon="solar:tag-price-bold">
                <PricingJourney row={row} discountText={discountText} t={t} />
                <Box className="mt-6 grid gap-5 border-t border-border/50 pt-6 sm:grid-cols-2">
                  <DetailField
                    label={t('columns.varieties')}
                    value={String(row.num_varieties ?? '—')}
                    mono
                  />
                  <DetailField label={t('columns.discount')} value={discountText} />
                </Box>
              </SectionShell>

              <SectionShell id="ubs-meta" title={t('form.userBasketScheduleDetailMeta')} icon="solar:clock-circle-bold">
                <Box className="grid gap-6 sm:grid-cols-2">
                  <DetailField
                    label={t('columns.startDate')}
                    value={displaySmartDate(row.start_date, false)}
                    mono
                    hint={row.start_date && dayjs(row.start_date).isValid() ? row.start_date : undefined}
                  />
                  <DetailField
                    label={t('columns.nextRunDate')}
                    value={displaySmartDate(row.next_run_date, false)}
                    mono
                    hint={row.next_run_date && dayjs(row.next_run_date).isValid() ? row.next_run_date : undefined}
                  />
                  <DetailField
                    label={t('columns.createdAt')}
                    value={displaySmartDate(row.created_at, true)}
                    mono
                    hint={row.created_at && dayjs(row.created_at).isValid() ? row.created_at : undefined}
                  />
                  <DetailField
                    label={t('columns.updatedAt')}
                    value={displaySmartDate(row.updated_at, true)}
                    mono
                    hint={row.updated_at && dayjs(row.updated_at).isValid() ? row.updated_at : undefined}
                  />
                </Box>
              </SectionShell>

              {items.length > 0 ? (
                <Box id="ubs-items" className="pt-2">
                  <Box className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <Box className="flex items-center gap-2">
                      <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                        <Iconify icon="solar:cart-large-2-bold" width={20} />
                      </Box>
                      <div>
                        <Typography variant="h6" className="font-bold text-foreground">
                          {t('form.userBasketScheduleDetailLineItems')}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {items.length} {t('columns.items')}
                        </Typography>
                      </div>
                    </Box>
                  </Box>
                  <Box className="flex flex-col gap-4">
                    {items.map((line, idx) => (
                      <LineItemCard
                        key={line.id}
                        item={line}
                        t={t}
                        index={idx}
                        language={i18n.language}
                      />
                    ))}
                  </Box>
                </Box>
              ) : preview ? (
                <Box className="pt-2">
                  <SectionShell title={t('columns.itemsPreview')} icon="solar:notes-bold">
                    <Typography variant="body2" className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {preview}
                    </Typography>
                  </SectionShell>
                </Box>
              ) : (
                <Box className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-14 text-center">
                  <Iconify icon="solar:cart-cross-bold" width={52} className="mb-3 text-muted-foreground/55" />
                  <Typography variant="subtitle1" className="mb-1 font-semibold text-foreground">
                    {t('columns.items')}
                  </Typography>
                  <Typography variant="body2" className="max-w-sm text-muted-foreground">
                    {t('noData')}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box className="mt-6 hidden min-w-0 xl:sticky xl:top-20 xl:mt-0 xl:block xl:col-span-4 xl:self-start">
              <QuickAside row={row} itemsCount={items.length} t={t} onCopyId={() => void copyScheduleId()} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
