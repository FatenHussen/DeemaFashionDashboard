import type { TFunction } from 'i18next';

import { Iconify } from '@/shared/components/iconify';
import {
  formatDecimal,
  formatMoneyLine,
  normalizeFormattedMoneyText,
} from '@/utils/format-currency';
import {
  type OrderStatus,
  type OrderDetailItem,
  parseOrderStatus,
  ORDER_ITEM_STATUS_OPTIONS,
} from '@/pages/dashboard/orders/types/order.types';

import { toDisplayString } from 'src/utils/to-display-string';

import { CONFIG } from 'src/global-config';
import { Typography } from 'src/shared/ui';

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

function itemSubtotalLabel(item: OrderDetailItem): string {
  return formatMoneyLine(item.subtotal_formatted, item.subtotal);
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

export type OrderLineItemCardProps = {
  item: OrderDetailItem;
  /** Zero-based index in the order (shown as #1, #2, …). */
  index: number;
  t: TFunction<'table'>;
  statusTone: Record<OrderStatus, string>;
  getStatusLabel: (statusRaw: string) => string;
  onItemStatusChange: (itemId: number, status: OrderStatus) => void;
  itemStatusPending: boolean;
};

function PricingRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span
        className={`min-w-0 text-end text-sm tabular-nums ${emphasize ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}
      >
        {value}
      </span>
    </div>
  );
}

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
  const lineNum = index + 1;
  const itemStatusOptions: OrderStatus[] = parsedItemStatus
    ? ORDER_ITEM_STATUS_OPTIONS.includes(parsedItemStatus)
      ? ORDER_ITEM_STATUS_OPTIONS
      : [parsedItemStatus, ...ORDER_ITEM_STATUS_OPTIONS.filter((s) => s !== parsedItemStatus)]
    : ORDER_ITEM_STATUS_OPTIONS;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex flex-col gap-4 p-3 sm:flex-row sm:p-4">
        <div className="shrink-0">
          {imgSrc ? (
            <img src={imgSrc} alt="" className="h-20 w-20 rounded-md object-cover" />
          ) : (
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/40">
              <Iconify
                icon="solar:gallery-minimalistic-bold"
                width={22}
                className="text-muted-foreground"
              />
              <span className="mt-1 max-w-[4.5rem] text-center text-[10px] text-muted-foreground">
                {t('orders.itemNoImage')}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums">#{lineNum}</span>
                <span>
                  {t('orders.itemLineId')} {item.id}
                </span>
              </p>
              <Typography variant="subtitle1" className="mt-0.5 font-semibold leading-snug">
                {item.product_name}
              </Typography>
            </div>
            <p className="shrink-0 text-base font-semibold tabular-nums text-foreground">
              {itemLineTotalLabel(item)}
            </p>
          </div>

          {item.variant_attributes &&
            (Array.isArray(item.variant_attributes)
              ? item.variant_attributes.length > 0
              : Object.keys(item.variant_attributes).length > 0) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Array.isArray(item.variant_attributes)
                  ? item.variant_attributes.map((attr: any, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-foreground"
                      >
                        <span className="text-muted-foreground">
                          {toDisplayString(attr.attribute)}
                        </span>
                        {attr.type === 'color' ? (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="inline-block h-3 w-3 shrink-0 rounded-full border border-border"
                              style={{ backgroundColor: attr.value }}
                            />
                            {toDisplayString(attr.value)}
                          </span>
                        ) : (
                          <span>{toDisplayString(attr.value)}</span>
                        )}
                      </span>
                    ))
                  : Object.entries(item.variant_attributes).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-foreground"
                      >
                        <span className="text-muted-foreground">{key}</span>
                        <span>{toDisplayString(value)}</span>
                      </span>
                    ))}
              </div>
            )}

          <div className="mt-3 max-w-md">
            <PricingRow label={t('orders.itemUnitPriceLabel')} value={itemUnitLabel(item)} />
            {hasDistinctFinalUnit(item) ? (
              <PricingRow label={t('orders.itemFinalUnitLabel')} value={itemFinalUnitLabel(item)} />
            ) : null}
            <PricingRow label={t('orders.itemQtyLabel')} value={String(item.quantity)} />
            <PricingRow label={t('orders.itemLineSubtotal')} value={itemSubtotalLabel(item)} />
            {discount > 0 ? (
              <PricingRow label={t('orders.itemDiscountLabel')} value={`−${String(discount)}`} />
            ) : null}
            {item.extras && item.extras.length > 0 && item.extras_total_formatted ? (
              <PricingRow
                label={t('orders.itemExtras')}
                value={normalizeFormattedMoneyText(item.extras_total_formatted)}
              />
            ) : null}
          </div>

          {item.delivery_time ? (
            <Typography variant="body2" className="mt-3 text-muted-foreground">
              {t('orders.itemDeliveryWindow')}:{' '}
              <span className="font-medium text-foreground">{item.delivery_time}</span>
            </Typography>
          ) : null}

          {item.note ? (
            <Typography
              variant="body2"
              className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-words border-s-2 border-primary/50 ps-3 text-foreground"
            >
              <span className="text-muted-foreground">{t('orders.itemCustomerNote')}: </span>
              {item.note}
            </Typography>
          ) : null}

          {item.extras && item.extras.length > 0 ? (
            <div className="mt-3">
              <Typography variant="caption" className="text-muted-foreground">
                {t('orders.itemExtras')}
              </Typography>
              <ul className="mt-1 space-y-1">
                {item.extras.map((ex, i) => (
                  <li key={ex.id ?? i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      {toDisplayString(ex.name ?? ex.label ?? '—')}
                    </span>
                    {ex.price != null ? (
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        +{formatDecimal(ex.price)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border bg-muted/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex items-center gap-2">
          <Typography variant="caption" className="text-muted-foreground">
            {t('orders.itemStatusSelect')}
          </Typography>
          <span
            className={`inline-flex max-w-[12rem] truncate rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone[st] ?? 'bg-muted text-muted-foreground'}`}
            title={getStatusLabel(item.status)}
          >
            {getStatusLabel(item.status)}
          </span>
          {itemStatusPending ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Iconify icon="solar:refresh-bold" className="h-3.5 w-3.5 animate-spin" />
              {t('orders.itemStatusSaving')}
            </span>
          ) : null}
        </div>
        <select
          value={st}
          onChange={(e) => onItemStatusChange(item.id, e.target.value as OrderStatus)}
          className="h-9 w-full cursor-pointer rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-52"
          disabled={itemStatusPending || !parsedItemStatus}
          aria-label={t('orders.itemStatusSelect')}
        >
          {itemStatusOptions.map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
