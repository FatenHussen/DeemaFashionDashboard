import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';

import { toast } from 'react-toastify';
import { Link } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import {
  formatDecimal,
  formatMoneyLine,
  normalizeFormattedMoneyText,
} from '@/utils/format-currency';
import {
  type OrderStatus,
  parseOrderStatus,
  type OrderDetailItem,
  ORDER_ITEM_STATUS_OPTIONS,
} from '@/pages/dashboard/orders/types/order.types';

import { paths } from 'src/routes/paths';
import { toDisplayString } from 'src/utils/to-display-string';

import { CONFIG } from 'src/global-config';

const EMPTY_META = '—';

// ----------------------------------------------------------------------

function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = CONFIG.serverUrl?.replace(/\/$/, '') ?? '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : path;
}

function itemUnitLabel(item: OrderDetailItem): string {
  return formatMoneyLine(item.unit_price_formatted, item.unit_price ?? item.price);
}

function itemFinalUnitLabel(item: OrderDetailItem): string {
  return formatMoneyLine(item.final_price_formatted, item.final_price);
}

function itemLineTotalLabel(item: OrderDetailItem): string {
  return formatMoneyLine(item.total_formatted, item.total ?? item.subtotal);
}

function hasDistinctFinalUnit(item: OrderDetailItem): boolean {
  const u = item.unit_price ?? item.price;
  const f = item.final_price;
  if (u == null || f == null) return false;
  return Number(u) !== Number(f);
}

function resolveTaxAmount(item: OrderDetailItem): number {
  const raw = item.tax_amount ?? item.tax ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function formatTaxMeta(item: OrderDetailItem, t: TFunction<'table'>): string | null {
  const taxType = item.tax_type === 'fixed' ? 'fixed' : item.tax_type === 'percent' ? 'percent' : null;
  if (!taxType) return null;
  if (taxType === 'fixed') {
    const value = item.tax_value ?? item.tax_amount ?? item.tax;
    if (value == null) return t('orders.itemTaxTypeFixed');
    return t('orders.itemTaxTypeFixedWithValue', { value: formatDecimal(Number(value)) });
  }
  const rate = item.tax_rate ?? item.tax_value;
  if (rate == null) return t('orders.itemTaxTypePercent');
  return t('orders.itemTaxTypePercentWithValue', { value: formatDecimal(Number(rate)) });
}

async function copyText(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    // Clipboard may be blocked by browser permissions.
  }
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-0.5 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
      <dt className="pt-px text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium text-foreground">{children}</dd>
    </div>
  );
}

function CopyableValue({
  value,
  copiedLabel,
  mono,
}: {
  value: string;
  copiedLabel: string;
  mono?: boolean;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1">
      <span className={`truncate ${mono ? 'font-mono text-[13px] tracking-tight' : ''}`}>{value}</span>
      <button
        type="button"
        onClick={() => void copyText(value, copiedLabel)}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={copiedLabel}
        title={copiedLabel}
      >
        <Iconify icon="solar:copy-bold" width={14} />
      </button>
    </span>
  );
}

export type OrderLineItemCardProps = {
  item: OrderDetailItem;
  index: number;
  t: TFunction<'table'>;
  statusTone: Record<OrderStatus, string>;
  getStatusLabel: (statusRaw: string) => string;
  onItemStatusChange: (itemId: number, status: OrderStatus) => void;
  itemStatusPending: boolean;
};

const selectClassName =
  'h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50';

export function OrderLineItemCard({
  item,
  index,
  t,
  statusTone,
  getStatusLabel,
  onItemStatusChange,
  itemStatusPending,
}: OrderLineItemCardProps) {
  const imgSrc = resolveMediaUrl(item.product_image ?? undefined);
  const discount = item.discount ?? 0;
  const parsedItemStatus = parseOrderStatus(item.status);
  const st = parsedItemStatus ?? 'pending';
  const itemStatusOptions: OrderStatus[] = parsedItemStatus
    ? ORDER_ITEM_STATUS_OPTIONS.includes(parsedItemStatus)
      ? ORDER_ITEM_STATUS_OPTIONS
      : [parsedItemStatus, ...ORDER_ITEM_STATUS_OPTIONS.filter((s) => s !== parsedItemStatus)]
    : ORDER_ITEM_STATUS_OPTIONS;

  const optionLabels = Array.isArray(item.variant_attributes)
    ? item.variant_attributes.map((attr) => {
        const name = toDisplayString(attr.attribute);
        const value = toDisplayString(attr.value);
        return name ? `${name}: ${value}` : value;
      })
    : item.variant_attributes
      ? Object.entries(item.variant_attributes).map(
          ([key, value]) => `${key}: ${toDisplayString(value)}`
        )
      : item.variant
        ? [toDisplayString(item.variant)].filter(Boolean)
        : [];

  const modelLabel = (item.model_number ?? item.model ?? '').toString().trim();
  const stockRaw = item.available_quantity ?? item.stock;
  const stock =
    stockRaw != null && String(stockRaw).trim() !== '' && Number.isFinite(Number(stockRaw))
      ? Number(stockRaw)
      : null;
  const taxAmount = resolveTaxAmount(item);
  const taxMeta = formatTaxMeta(item, t);
  const productId = item.product_id != null && Number(item.product_id) > 0 ? Number(item.product_id) : null;
  const shopLabel = formatTranslated(
    item.shop_name as Parameters<typeof formatTranslated>[0],
    ''
  ).trim();
  const skuLabel = (item.sku ?? '').toString().trim();
  const lineTotal = itemLineTotalLabel(item);
  const copiedLabel = t('orders.itemCopied');

  const hasCommerceMeta =
    hasDistinctFinalUnit(item) || discount > 0 || taxAmount > 0 || Boolean(item.extras?.length);

  const hasNotes = Boolean(item.delivery_time) || Boolean(item.note);

  return (
    <article className="border-b border-border py-5 last:border-b-0">
      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt=""
              className="h-14 w-14 rounded-xl object-cover ring-1 ring-border/70"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground ring-1 ring-border/70">
              <Iconify icon="solar:gallery-minimalistic-bold" width={20} />
            </div>
          )}
          <span className="absolute -start-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold tabular-nums text-background shadow-sm">
            {index + 1}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                {item.product_name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="tabular-nums text-foreground">{item.quantity}</span>
                <span className="mx-1.5 text-border">×</span>
                <span className="tabular-nums">{itemUnitLabel(item)}</span>
              </p>
            </div>

            <div className="ms-auto text-end">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('orders.itemLineTotalLabel')}
              </div>
              <div className="mt-0.5 text-base font-semibold tabular-nums tracking-tight text-foreground">
                {lineTotal}
              </div>
            </div>
          </div>

          <dl className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
            <MetaRow label={t('orders.itemShop')}>
              {shopLabel || EMPTY_META}
            </MetaRow>

            <MetaRow label={t('orders.itemProductId')}>
              {productId != null ? (
                <span className="inline-flex items-center gap-1">
                  <Link
                    to={paths.dashboard.product.details(productId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tabular-nums text-primary underline-offset-2 hover:underline"
                  >
                    {productId}
                  </Link>
                  <button
                    type="button"
                    onClick={() => void copyText(String(productId), copiedLabel)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={copiedLabel}
                    title={copiedLabel}
                  >
                    <Iconify icon="solar:copy-bold" width={14} />
                  </button>
                </span>
              ) : (
                EMPTY_META
              )}
            </MetaRow>

            <MetaRow label={t('orders.itemSku')}>
              {skuLabel ? (
                <CopyableValue value={skuLabel} copiedLabel={copiedLabel} mono />
              ) : (
                EMPTY_META
              )}
            </MetaRow>

            <MetaRow label={t('orders.itemSpecifications')}>
              {optionLabels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {optionLabels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                EMPTY_META
              )}
            </MetaRow>

            {modelLabel ? (
              <MetaRow label={t('orders.itemModel')}>{modelLabel}</MetaRow>
            ) : null}

            <MetaRow label={t('orders.itemStock')}>
              {stock != null ? <span className="tabular-nums">{stock}</span> : EMPTY_META}
            </MetaRow>
          </dl>

          {hasCommerceMeta ? (
            <dl className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
              {hasDistinctFinalUnit(item) ? (
                <MetaRow label={t('orders.itemFinalUnitLabel')}>{itemFinalUnitLabel(item)}</MetaRow>
              ) : null}

              {discount > 0 ? (
                <MetaRow label={t('orders.itemDiscountLabel')}>
                  <span className="tabular-nums text-rose-600 dark:text-rose-400">−{discount}</span>
                </MetaRow>
              ) : null}

              {taxAmount > 0 ? (
                <MetaRow label={t('orders.itemTax')}>
                  <span className="tabular-nums">
                    {formatDecimal(taxAmount)}
                    {taxMeta ? (
                      <span className="ms-1 font-normal text-muted-foreground">({taxMeta})</span>
                    ) : null}
                  </span>
                </MetaRow>
              ) : null}

              {item.extras && item.extras.length > 0 ? (
                <MetaRow label={t('orders.itemExtras')}>
                  <div className="space-y-1">
                    {item.extras.map((ex, i) => {
                      const name = toDisplayString(ex.name ?? ex.label ?? '—');
                      return (
                        <div key={ex.id ?? i} className="flex flex-wrap items-baseline gap-x-2">
                          <span>{name}</span>
                          {ex.price != null ? (
                            <span className="tabular-nums text-muted-foreground">
                              +{formatDecimal(ex.price)}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                    {item.extras_total_formatted ? (
                      <div className="text-xs text-muted-foreground">
                        {t('orders.itemExtrasSubtotal')}:{' '}
                        <span className="font-medium text-foreground">
                          {normalizeFormattedMoneyText(item.extras_total_formatted)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </MetaRow>
              ) : null}
            </dl>
          ) : null}

          {hasNotes ? (
            <dl className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
              {item.delivery_time ? (
                <MetaRow label={t('orders.itemDeliveryWindow')}>{item.delivery_time}</MetaRow>
              ) : null}
              {item.note ? (
                <MetaRow label={t('orders.itemCustomerNote')}>
                  <span className="whitespace-pre-wrap font-normal leading-relaxed text-foreground/90">
                    {item.note}
                  </span>
                </MetaRow>
              ) : null}
            </dl>
          ) : null}

          <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('orders.itemStatusSelect')}
              </span>
              <span
                className={`inline-flex max-w-[10rem] truncate rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone[st] ?? 'bg-muted text-muted-foreground'}`}
              >
                {getStatusLabel(item.status)}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2 sm:w-[14rem]">
              <select
                value={st}
                onChange={(e) => onItemStatusChange(item.id, e.target.value as OrderStatus)}
                className={selectClassName}
                disabled={itemStatusPending || !parsedItemStatus}
                aria-label={t('orders.itemStatusSelect')}
              >
                {itemStatusOptions.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(s)}
                  </option>
                ))}
              </select>
              {itemStatusPending ? (
                <Iconify
                  icon="solar:refresh-bold"
                  width={16}
                  className="shrink-0 animate-spin text-muted-foreground"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
