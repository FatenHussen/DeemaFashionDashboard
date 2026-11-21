import type { TFunction } from 'i18next';

import { Link } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
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
  'mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50';

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

  return (
    <div className="grid gap-4 border-b border-border py-4 last:border-b-0 md:grid-cols-[4.5rem_minmax(0,1fr)_13rem] md:items-start">
      {imgSrc ? (
        <img src={imgSrc} alt="" className="h-16 w-16 rounded-lg object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Iconify icon="solar:gallery-minimalistic-bold" width={22} />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          <span className="me-2 tabular-nums text-muted-foreground">{index + 1}.</span>
          {item.product_name}
        </p>
        {item.shop_name ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('orders.itemShop')}: {item.shop_name}
          </p>
        ) : null}
        {productId != null ? (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('orders.itemProductId')}:{' '}
            <Link
              to={paths.dashboard.product.details(productId)}
              className="text-primary underline-offset-2 hover:underline"
            >
              #{productId}
            </Link>
          </p>
        ) : null}
        {item.sku ? (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('orders.itemSku')}: <span className="font-mono text-foreground">{item.sku}</span>
          </p>
        ) : null}
        {modelLabel ? (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('orders.itemModel')}: {modelLabel}
          </p>
        ) : null}
        {stock != null ? (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('orders.itemStock')}: <span className="tabular-nums text-foreground">{stock}</span>
          </p>
        ) : null}
        <p className="mt-1 text-sm text-muted-foreground">
          {t('orders.orderItemUnitQty', { unit: itemUnitLabel(item), qty: item.quantity })}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">
          {t('orders.itemLineTotalLabel')}: {itemLineTotalLabel(item)}
        </p>
        {hasDistinctFinalUnit(item) ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('orders.itemFinalUnitLabel')}: {itemFinalUnitLabel(item)}
          </p>
        ) : null}
        {discount > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('orders.itemDiscountLabel')}: −{discount}
          </p>
        ) : null}
        {taxAmount > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('orders.itemTax')}: {formatDecimal(taxAmount)}
            {taxMeta ? ` (${taxMeta})` : ''}
          </p>
        ) : null}
        {optionLabels.length > 0 ? (
          <p className="mt-1 text-sm text-foreground">{optionLabels.join(', ')}</p>
        ) : null}
        {item.extras && item.extras.length > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('orders.itemExtras')}:{' '}
            {item.extras
              .map((ex) => {
                const name = toDisplayString(ex.name ?? ex.label ?? '—');
                return ex.price != null ? `${name} (+${formatDecimal(ex.price)})` : name;
              })
              .join(', ')}
            {item.extras_total_formatted
              ? ` — ${normalizeFormattedMoneyText(item.extras_total_formatted)}`
              : ''}
          </p>
        ) : null}
        {item.delivery_time ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('orders.itemDeliveryWindow')}: {item.delivery_time}
          </p>
        ) : null}
        {item.note ? (
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {t('orders.itemCustomerNote')}: {item.note}
          </p>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{t('orders.itemStatusSelect')}</span>
          <span
            className={`inline-flex max-w-[8rem] truncate rounded-md px-2 py-0.5 text-xs font-medium ${statusTone[st] ?? 'bg-muted text-muted-foreground'}`}
          >
            {getStatusLabel(item.status)}
          </span>
        </div>
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
          <p className="mt-1 text-xs text-muted-foreground">{t('orders.itemStatusSaving')}</p>
        ) : null}
      </div>
    </div>
  );
}
