import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';
import type { CurrencyData } from '@/pages/dashboard/currencies/types/currency.types';
import type { ProductDetailData } from '@/pages/dashboard/products/types/product.types';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { compressImages } from '@/utils/compress-image';
import { useRef, useMemo, useState, useEffect } from 'react';
import { formatTranslated } from '@/utils/format-translated';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { useFetchProductById } from '@/pages/dashboard/products/hooks/product';
import { useFetchCurrencies } from '@/pages/dashboard/currencies/hooks/currency';
import { useVariantDeleteFlow } from '@/pages/dashboard/products/hooks/use-variant-delete-flow';
import { VariantDeleteImpactDialog } from '@/pages/dashboard/products/components/VariantDeleteImpactDialog';
import { formatDecimal, normalizeFormattedMoneyText, formatApiCurrencyAmountForLanguage } from '@/utils/format-currency';
import {
  useUpdateProductVariant,
  useUpdateShopProductVariant,
} from '@/pages/dashboard/products/hooks/product-variant';

import { paths } from 'src/routes/paths';

import { toDisplayString } from 'src/utils/to-display-string';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

function productCountryOriginDisplay(product: Record<string, unknown>): ReactNode {
  const oc = product.origin_country as { name?: unknown } | null | undefined;
  if (oc && typeof oc === 'object' && oc.name != null) {
    return typeof oc.name === 'string' ? oc.name : formatTranslated(oc.name as any);
  }
  const c = product.country as Record<string, unknown> | null | undefined;
  if (c && typeof c === 'object') {
    if ('name' in c && c.name != null) {
      return formatTranslated(c.name as any);
    }
    const en = c.en as string | undefined;
    const ar = c.ar as string | undefined;
    if (en || ar) {
      return [en, ar].filter(Boolean).join(' / ') || '—';
    }
  }
  return '—';
}

function productCountrySaleDisplay(product: Record<string, unknown>): ReactNode {
  const c = product.sale_country as { name?: unknown } | null | undefined;
  if (c && typeof c === 'object' && c.name != null) {
    return typeof c.name === 'string' ? c.name : formatTranslated(c.name as any);
  }
  return '—';
}

function seoKeywordsLines(kw: ProductDetailData['seo_keywords']): { en?: string; ar?: string } {
  if (!kw || typeof kw !== 'object') {
    return {};
  }
  const rec = kw as Record<string, unknown>;
  const part = (v: unknown): string | undefined => {
    if (v == null) return undefined;
    if (Array.isArray(v)) {
      const s = v.map((x) => String(x).trim()).filter(Boolean).join(', ');
      return s || undefined;
    }
    if (typeof v === 'string') {
      const s = v.trim();
      return s || undefined;
    }
    return undefined;
  };
  return {
    en: part(rec.en),
    ar: part(rec.ar),
  };
}

function boughtWithItemLabel(
  item: number | { id: number; name?: string | { en?: string; ar?: string } },
  t: TFunction<'table'>
): ReactNode {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    if (item.name != null) {
      return typeof item.name === 'string' ? item.name : formatTranslated(item.name as any);
    }
    return t('form.productDetailsProductId', { id: item.id });
  }
  return t('form.productDetailsProductId', { id: item });
}

/** Renders TipTap / rich-text HTML stored in full_description. */
function ProductRichDescriptionHtml({
  html,
  dir,
}: {
  html: string | null | undefined;
  dir?: 'ltr' | 'rtl';
}) {
  const trimmed = typeof html === 'string' ? html.trim() : '';
  if (!trimmed) {
    return (
      <Typography variant="body1" className="text-muted-foreground">
        —
      </Typography>
    );
  }
  return (
    <Box
      dir={dir}
      className="product-rich-html text-foreground text-sm leading-relaxed max-w-none [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:ps-5 [&_ol]:my-2 [&_ol]:ps-5 [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}

function DetailRow({ label, value, emptyLabel }: { label: string; value: ReactNode; emptyLabel: string }) {
  return (
    <Box className="space-y-1">
      <Typography variant="body2" className="text-muted-foreground font-medium">
        {label}
      </Typography>
      <Typography variant="body1" component="div" className="text-foreground">
        {value ?? emptyLabel}
      </Typography>
    </Box>
  );
}

/** Renders `*_currencies` maps, then `*_formatted`, then legacy amount + label. */
function productMoneyDisplay(args: {
  currencies?: Record<
    string,
    { amount?: number; currency?: string; symbol?: string; formatted?: string } | null
  > | null | undefined;
  singleFormatted?: string | null | undefined;
  amount?: number | null | undefined;
  legacyAmountPrefix: string;
}): ReactNode {
  const { currencies, singleFormatted, amount, legacyAmountPrefix } = args;
  const entries = currencies ? Object.entries(currencies).filter(([, v]) => v && typeof v === 'object') : [];
  if (entries.length > 0) {
    entries.sort(([a], [b]) => a.localeCompare(b));
    return (
      <Box className="flex flex-col gap-0.5">
        {entries.map(([code, row]) => (
          <Typography key={code} variant="body1" className="tabular-nums">
            {row != null &&
            typeof row.amount === 'number' &&
            Number.isFinite(row.amount) &&
            (row.currency != null || code)
              ? formatApiCurrencyAmountForLanguage({
                  amount: row.amount,
                  currency: (row.currency ?? code) as string,
                  symbol: row.symbol,
                })
              : normalizeFormattedMoneyText(row?.formatted ?? '—')}
          </Typography>
        ))}
      </Box>
    );
  }
  if (singleFormatted) return normalizeFormattedMoneyText(singleFormatted);
  if (amount != null && !Number.isNaN(Number(amount))) {
    return `${legacyAmountPrefix} ${formatDecimal(amount)}`;
  }
  return '—';
}

function approvalChipClass(statusRaw: string | null | undefined): string {
  const s = String(statusRaw ?? '').toLowerCase();
  if (s.includes('reject')) {
    return 'border-rose-500/35 bg-rose-500/10 text-rose-800 dark:text-rose-300';
  }
  if (s.includes('pending') || s.includes('draft') || s.includes('review')) {
    return 'border-amber-500/35 bg-amber-500/12 text-amber-950 dark:text-amber-300';
  }
  if (s.includes('approv')) {
    return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300';
  }
  return 'border-border/60 bg-muted/45 text-muted-foreground';
}

function formatDiscountTypeLabel(dt: string | null | undefined, tr: TFunction<'table'>): string {
  const v = String(dt ?? '').toLowerCase().trim();
  if (v === 'percentage') return tr('form.discountTypePercentage');
  if (v === 'fixed') return tr('form.discountTypeFixed');
  if (v === 'none' || v === '') return tr('form.discountTypeNone');
  return String(dt ?? '—');
}

function badgeAdminLabel(
  badge: { id: number; name?: unknown },
  tr: TFunction<'table'>
): string {
  const n = badge.name;
  if (n != null && typeof n === 'object' && !Array.isArray(n)) {
    const s = formatTranslated(n as { en?: string; ar?: string })?.trim();
    if (s) return s;
  }
  if (typeof n === 'string' && n.trim()) return n.trim();
  return tr('form.productDetailsBadgeNumber', { id: badge.id });
}

function boolFromApi(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  return Boolean(v);
}

// ----------------------------------------------------------------------
// Product Variant Edit Modal

interface EditVariantModalProps {
  open: boolean;
  variant: any;
  /** When product category is restaurant, variant model/barcode are not used. */
  isRestaurant?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function EditVariantModal({
  open,
  variant,
  isRestaurant = false,
  onClose,
  onSuccess,
}: EditVariantModalProps) {
  const { t } = useTranslation('table');
  const { mutate: updateVariant, isPending } = useUpdateProductVariant();
  const { data: currenciesResponse } = useFetchCurrencies(1, 100);

  const activeCurrencies = useMemo(() => {
    const raw = currenciesResponse?.data?.items ?? [];
    return raw.filter((c) => {
      const active = c.is_active as boolean | number | undefined;
      return active === true || active === 1;
    });
  }, [currenciesResponse]);

  const usdCurrency = useMemo(
    () =>
      activeCurrencies.find((c) => String(c.code).toUpperCase() === 'USD') ??
      activeCurrencies.find((c) => c.is_default) ??
      activeCurrencies[0],
    [activeCurrencies]
  );

  const sypCurrency = useMemo(
    () => activeCurrencies.find((c) => String(c.code).toUpperCase() === 'SYP'),
    [activeCurrencies]
  );

  const dualPriceReady = Boolean(usdCurrency && sypCurrency);
  const sypRate = sypCurrency ? parseShopVariantCurrencyRate(sypCurrency) : 1;

  const [isTrend, setIsTrend] = useState<number>(variant?.is_trend ?? 0);
  const [isActive, setIsActive] = useState<number>(variant?.is_active ?? 1);
  const [sku, setSku] = useState<string>(variant?.sku ?? '');
  const [model, setModel] = useState<string>(variant?.model ?? '');
  const [barcode, setBarcode] = useState<string>(variant?.barcode ?? '');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [nameAr, setNameAr] = useState<string>('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && variant) {
      setIsTrend(variant.is_trend ?? 0);
      setIsActive(variant.is_active ?? 1);
      setSku(variant.sku != null ? String(variant.sku) : '');
      setModel(variant.model != null ? String(variant.model) : '');
      setBarcode(variant.barcode != null ? String(variant.barcode) : '');
      setPrice(variant.price != null ? String(variant.price) : '');
      setQuantity(variant.quantity != null ? String(variant.quantity) : '');
      const rawName = variant.name as unknown;
      if (rawName && typeof rawName === 'object') {
        const obj = rawName as { en?: unknown; ar?: unknown };
        setNameEn(obj.en != null ? String(obj.en) : '');
        setNameAr(obj.ar != null ? String(obj.ar) : '');
      } else if (typeof rawName === 'string') {
        setNameEn(rawName);
        setNameAr(rawName);
      } else {
        setNameEn('');
        setNameAr('');
      }
      setNewImages([]);
    }
  }, [open, variant]);

  const existingImages: { id: number; url: string }[] = variant?.images ?? [];
  const [keptImageIds, setKeptImageIds] = useState<number[]>([]);

  useEffect(() => {
    if (open && variant) {
      setKeptImageIds((variant.images ?? []).map((img: any) => img.id));
    }
  }, [open, variant]);

  const handleSubmit = async () => {
    if (!variant?.id) return;
    const attrIds: number[] = (variant.attributes ?? []).map((a: any) => a.value_id ?? a.id).filter(Boolean);
    const images =
      newImages.length > 0 ? await compressImages(newImages) : undefined;
    updateVariant(
      {
        id: variant.id,
        data: {
          is_trend: isTrend,
          is_active: isActive,
          attributes_values_ids: attrIds,
          existing_images_ids: keptImageIds,
          images,
          sku,
          ...(isRestaurant ? { model: '', barcode: '' } : { model, barcode }),
          name: { en: nameEn, ar: nameAr },
          price: price !== '' ? Number(price) : undefined,
          quantity: quantity !== '' ? Math.max(0, Math.floor(Number(quantity))) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('form.variantSaveSuccess'));
          onSuccess();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={t('form.productDetailsEditVariantTitle', { id: variant?.id ?? '' })}
      content={
        <Box className="space-y-4">
          {/* is_trend */}
          <Box>
            <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
              {t('form.productDetailsVariantIsTrendLabel')}
            </Typography>
            <Box className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsTrend(1)}
                className={`px-4 py-1.5 rounded-md border text-sm font-medium transition-colors ${isTrend === 1 ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/60'}`}
              >
                {t('yes')}
              </button>
              <button
                type="button"
                onClick={() => setIsTrend(0)}
                className={`px-4 py-1.5 rounded-md border text-sm font-medium transition-colors ${isTrend === 0 ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/60'}`}
              >
                {t('no')}
              </button>
            </Box>
          </Box>

          {/* is_active */}
          <Box>
            <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
              {t('form.productDetailsVariantIsActiveLabel')}
            </Typography>
            <Box className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsActive(1)}
                className={`px-4 py-1.5 rounded-md border text-sm font-medium transition-colors ${isActive === 1 ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/60'}`}
              >
                {t('yes')}
              </button>
              <button
                type="button"
                onClick={() => setIsActive(0)}
                className={`px-4 py-1.5 rounded-md border text-sm font-medium transition-colors ${isActive === 0 ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/60'}`}
              >
                {t('no')}
              </button>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
              {t('form.nameEn')}
            </Typography>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </Box>
          <Box>
            <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
              {t('form.nameAr')}
            </Typography>
            <input
              type="text"
              dir="rtl"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </Box>
          <Box>
            <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
              {t('form.productSku')}
            </Typography>
            <div className="flex gap-2">
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                title={t('form.generateSku')}
                onClick={() => setSku('SKU-' + Math.random().toString(36).substring(2, 10).toUpperCase())}
                className="flex items-center justify-center rounded-md border border-border bg-muted px-2 hover:bg-muted/80 transition-colors"
              >
                <Iconify icon="solar:shuffle-bold" width={18} />
              </button>
            </div>
          </Box>
          {!isRestaurant && (
            <>
              <Box>
                <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
                  {t('form.productModel')}
                </Typography>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </Box>
              <Box>
                <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
                  {t('form.productBarcode')}
                </Typography>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </Box>
            </>
          )}
          {dualPriceReady ? (
            <>
              <Box>
                <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
                  {t('form.variantPriceUsdLabel')}
                  {usdCurrency?.symbol ? (
                    <span className="ms-1 opacity-80">({usdCurrency.symbol})</span>
                  ) : null}
                </Typography>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </Box>
              <Box>
                <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
                  {t('form.variantPriceSypLabel')}
                  {sypCurrency?.symbol ? (
                    <span className="ms-1 opacity-80">({sypCurrency.symbol})</span>
                  ) : null}
                </Typography>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={(() => {
                    const u = parseFloat(price) || 0;
                    const syp = shopVariantUsdToLocal(u, sypRate);
                    return u === 0 && syp === 0 ? '' : syp;
                  })()}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const v = raw === '' ? 0 : parseFloat(raw);
                    setPrice(
                      String(shopVariantLocalToUsd(Number.isFinite(v) ? v : 0, sypRate))
                    );
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </Box>
            </>
          ) : (
            <Box>
              <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
                {t('form.variantPriceLabel')}
              </Typography>
              <input
                type="number"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </Box>
          )}
          <Box>
            <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
              {t('form.variantQuantityLabel')}
            </Typography>
            <input
              type="number"
              step="1"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Typography variant="caption" className="text-muted-foreground mt-1 block">
              {t('form.variantPriceQuantityHint')}
            </Typography>
          </Box>

          {/* existing images */}
          {existingImages.length > 0 && (
            <Box>
              <Typography variant="body2" className="text-muted-foreground mb-2 font-medium">
                {t('form.productDetailsVariantExistingImagesLabel')}
              </Typography>
              <Box className="flex flex-wrap gap-2">
                {existingImages.map((img) => {
                  const kept = keptImageIds.includes(img.id);
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() =>
                        setKeptImageIds((prev) =>
                          kept ? prev.filter((x) => x !== img.id) : [...prev, img.id]
                        )
                      }
                      className={`relative rounded-lg border-2 transition-all overflow-hidden ${kept ? 'border-primary' : 'border-border opacity-40'}`}
                    >
                      <img src={img.url} alt="" className="w-14 h-14 object-cover" />
                      {!kept && (
                        <Box className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Iconify icon="solar:trash-bin-minimalistic-bold" className="text-white" width={18} />
                        </Box>
                      )}
                    </button>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* new images */}
          <Box>
            <Typography variant="body2" className="text-muted-foreground mb-2 font-medium">
              {t('form.productDetailsVariantUploadNewLabel')}
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) setNewImages(Array.from(e.target.files));
              }}
            />
            <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>
              <Iconify icon="solar:upload-bold" width={16} className="mr-1" />
              {newImages.length > 0
                ? t('form.productDetailsVariantFilesSelected', { count: newImages.length })
                : t('form.chooseFiles')}
            </Button>
          </Box>
        </Box>
      }
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={isPending}>
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
            {isPending ? t('form.savingVariant') : t('save')}
          </Button>
        </>
      }
    />
  );
}

// ----------------------------------------------------------------------
// Shop product variant edit — currency helpers (same convention as product price: API stores USD)

function parseShopVariantCurrencyRate(c: CurrencyData): number {
  const r = Number((c as { exchange_rate?: string | number }).exchange_rate);
  return r > 0 ? r : 1;
}

function shopVariantLocalToUsd(local: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return local / r;
}

function shopVariantUsdToLocal(usd: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return usd * r;
}

// ----------------------------------------------------------------------
// Shop Product Variant Edit Modal

interface EditShopVariantModalProps {
  open: boolean;
  shopVariant: any;
  onClose: () => void;
  onSuccess: () => void;
}

function EditShopVariantModal({ open, shopVariant, onClose, onSuccess }: EditShopVariantModalProps) {
  const { t } = useTranslation('table');
  const { mutate: updateShopVariant, isPending } = useUpdateShopProductVariant();

  const [costPrice, setCostPrice] = useState<string>('');

  useEffect(() => {
    if (open && shopVariant) {
      setCostPrice(shopVariant.cost_price != null ? String(shopVariant.cost_price) : '');
    }
  }, [open, shopVariant]);

  const handleSubmit = () => {
    if (!shopVariant?.id) return;
    updateShopVariant(
      {
        id: shopVariant.id,
        data: {
          cost_price: costPrice !== '' ? Number(costPrice) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('form.shopVariantSaveSuccess'));
          onSuccess();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={t('form.productDetailsEditShopVariantTitle', { id: shopVariant?.id ?? '' })}
      content={
        <Box className="space-y-3">
          <Box>
            <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
              {t('form.branchCostPriceLabel')}
            </Typography>
            <input
              type="number"
              step="0.01"
              min={0}
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Typography variant="caption" className="text-muted-foreground mt-1 block">
              {t('form.branchCostPriceHint')}
            </Typography>
          </Box>
        </Box>
      }
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={isPending}>
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
            {isPending ? t('form.savingVariant') : t('save')}
          </Button>
        </>
      }
    />
  );
}

// ----------------------------------------------------------------------

export default function DetailsPage() {
  const { t, i18n } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: productResponse, isLoading, error, refetch } = useFetchProductById(id || '');

  const [editVariant, setEditVariant] = useState<any>(null);
  const [editShopVariant, setEditShopVariant] = useState<any>(null);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Both deletes preview their impact first, so the user sees what is removed (basket /
  // recipe rows) and what is kept (order history) before committing.
  const variantDeleteFlow = useVariantDeleteFlow({
    target: 'product_variant',
    onDeleted: () => {
      toast.success(t('form.variantDeleteSuccess'));
      refetch();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('form.variantDeleteFailed'))),
  });

  const shopVariantDeleteFlow = useVariantDeleteFlow({
    target: 'shop_product_variant',
    onDeleted: () => {
      toast.success(t('form.productDetailsShopVariantDeleteSuccess'));
      refetch();
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, t('form.productDetailsShopVariantDeleteFailed'))),
  });

  useEffect(() => {
    setHeroImageIndex(0);
  }, [id]);

  const na = t('form.productDetailsNotAvailable');

  useEffect(() => {
    const suffix = id ? ` #${id}` : '';
    document.title = `${t('form.productDetailsMetaTitle')}${suffix} | ${CONFIG.appName}`;
  }, [t, i18n.language, id]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !productResponse) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.productDetailsErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.productDetailsErrorMessage')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate(paths.dashboard.products)}>
            {t('form.productDetailsBack')}
          </Button>
        </Box>
      </Box>
    );
  }

  const product = productResponse as any;
  const isRestaurant = Boolean(product?.is_restaurant ?? product?.category?.is_restaurant);
  const yes = t('form.productDetailsYes');
  const no = t('form.productDetailsNo');

  const gallery: Array<{ id?: number; url: string }> = Array.isArray(product.images) ? product.images : [];
  const heroSrc =
    gallery[heroImageIndex]?.url ?? (typeof product.thumbnail === 'string' ? product.thumbnail : undefined);
  const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;

  const seoKw = seoKeywordsLines(product.seo_keywords);
  const seoImageAlt =
    [product.seo_title?.en, product.seo_title?.ar].filter(Boolean).join(' — ') ||
    t('form.productDetailsSeoImage');

  const sectionShell =
    'rounded-2xl border border-border/40 bg-card/60 shadow-lg shadow-black/[0.04] ring-1 ring-border/30 backdrop-blur-sm';

  return (
    <Box className="relative min-h-screen w-full overflow-x-hidden bg-background">
      <Box className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,hsl(var(--primary)/0.14),transparent_55%)]" />
      <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      <Box className="pointer-events-none fixed inset-0 opacity-[0.035] dark:opacity-[0.06]">
        <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </Box>
      <Box className="pointer-events-none fixed -right-24 -top-28 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[120px]" />
      <Box className="pointer-events-none fixed -bottom-32 -left-20 h-96 w-96 rounded-full bg-violet-500/15 blur-[100px] dark:bg-violet-400/10" />

      <Box className="relative w-full px-4 pb-14 pt-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Hero */}
        <Box
          className={`relative mb-8 overflow-hidden p-6 shadow-2xl shadow-black/[0.07] md:p-8 lg:p-10 ${sectionShell}`}
        >
          <Box className="pointer-events-none absolute -right-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
          <Button
            variant="text"
            onClick={() => navigate(paths.dashboard.products)}
            className="-ml-2 mb-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2 rtl:rotate-180" />
            {t('form.productDetailsBack')}
          </Button>

          <Box className="relative flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-12">
            <Box className="flex w-full shrink-0 flex-col gap-4 lg:max-w-[min(100%,440px)]">
              <Box className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 shadow-inner ring-2 ring-primary/20">
                {heroSrc ? (
                  <img
                    src={heroSrc}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />
                ) : (
                  <Box className="flex h-full w-full items-center justify-center">
                    <Iconify icon="solar:gallery-bold" className="text-muted-foreground/40" width={80} height={80} />
                  </Box>
                )}
                <Box className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent px-4 py-6 pt-16">
                  <Typography variant="caption" className="font-mono text-muted-foreground">
                    ID · {product.id}
                  </Typography>
                </Box>
              </Box>
              {gallery.length > 1 ? (
                <Box className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                  {gallery.map((img: any, i: number) => (
                    <button
                      key={img.id ?? i}
                      type="button"
                      onClick={() => setHeroImageIndex(i)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        i === heroImageIndex
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-border/60 opacity-80 hover:border-primary/50 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </Box>
              ) : null}
            </Box>

            <Box className="flex min-w-0 flex-1 flex-col justify-between gap-6">
              <Box>
                <Box className="mb-3 flex flex-wrap items-center gap-2">
                  <Box className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {formatTranslated(product.category?.name) ?? product.category_id}
                  </Box>
                  {(product.approval_status_label ?? product.approval_status) ? (
                    <Box
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${approvalChipClass(product.approval_status ?? product.approval_status_label)}`}
                    >
                      {product.approval_status_label ?? product.approval_status}
                    </Box>
                  ) : null}
                  <Box
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      product.is_visible !== false && product.is_visible !== 0
                        ? 'border-sky-500/35 bg-sky-500/10 text-sky-900 dark:text-sky-300'
                        : 'border-border/60 bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    {product.is_visible !== false && product.is_visible !== 0
                      ? t('form.productDetailsVisible')
                      : t('form.productDetailsHidden')}
                  </Box>
                  <Box
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      boolFromApi(product.is_active ?? true)
                        ? 'border-violet-500/35 bg-violet-500/10 text-violet-900 dark:text-violet-300'
                        : 'border-border/60 bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    {boolFromApi(product.is_active ?? true)
                      ? t('form.productDetailsListingActive')
                      : t('form.productDetailsListingInactive')}
                  </Box>
                </Box>
                <Typography variant="h3" className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {formatTranslated(product.name)}
                </Typography>
                <Typography variant="body2" className="max-w-2xl text-muted-foreground">
                  {t('form.productDetailsIdLabel')} · {product.id}
                  {product.product_number ? (
                    <>
                      {' · '}
                      {t('form.productDetailsProductNumber')}: {product.product_number}
                    </>
                  ) : null}
                  {product.vendor ? (
                    <>
                      {' · '}
                      {formatTranslated(product.vendor.name as any)}
                    </>
                  ) : null}
                </Typography>
                {product.rating_count != null && Number(product.rating_count) > 0 ? (
                  <Typography variant="caption" className="mt-2 block text-muted-foreground">
                    {t('form.productDetailsRatingLine', {
                      rating: Number(product.rating ?? 0).toFixed(1),
                      count: product.rating_count,
                    })}
                  </Typography>
                ) : null}
                {product.rejection_reason ? (
                  <Box className="mt-4 rounded-xl border border-rose-500/35 bg-rose-500/[0.08] px-4 py-3">
                    <Typography variant="caption" className="font-semibold text-rose-800 dark:text-rose-300">
                      {t('form.productDetailsRejectionReason')}
                    </Typography>
                    <Typography variant="body2" className="mt-1 text-foreground">
                      {product.rejection_reason}
                    </Typography>
                  </Box>
                ) : null}
              </Box>

              <Box className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Box className="rounded-xl border border-border/50 bg-background/50 p-3 text-center sm:text-start">
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.productDetailsCatalogQty')}
                  </Typography>
                  <Typography variant="h6" className="font-semibold tabular-nums">
                    {product.quantity ?? '—'}
                  </Typography>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-background/50 p-3 text-center sm:text-start">
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.productDetailsStock')}
                  </Typography>
                  <Typography variant="h6" className="font-semibold tabular-nums">
                    {product.stock != null ? product.stock : '—'}
                  </Typography>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-background/50 p-3 text-center sm:text-start">
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.productDetailsVariants')}
                  </Typography>
                  <Typography variant="h6" className="font-semibold tabular-nums">
                    {variantCount}
                  </Typography>
                </Box>
                {product.max_purchase_quantity != null ? (
                  <Box className="rounded-xl border border-border/50 bg-background/50 p-3 text-center sm:text-start">
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.productDetailsMaxPurchase')}
                    </Typography>
                    <Typography variant="h6" className="font-semibold tabular-nums">
                      {product.max_purchase_quantity}
                    </Typography>
                  </Box>
                ) : null}
                <Box className="rounded-xl border border-border/50 bg-background/50 p-3 text-center sm:text-start">
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.instantDelivery')}
                  </Typography>
                  <Typography variant="h6" className="font-semibold">
                    {product.is_instant_delivery ? yes : no}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex flex-wrap gap-3">
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => id && navigate(paths.dashboard.product.update(id))}
                  className="gap-2 shadow-lg shadow-primary/25"
                >
                  <Iconify icon="solar:pen-bold" width={18} />
                  {t('form.productDetailsEdit')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="flex flex-col gap-6 xl:grid xl:grid-cols-12 xl:items-start xl:gap-8">
          <Box className="order-2 space-y-6 xl:order-1 xl:col-span-8">
            {/* Admin essentials — identifiers & logistics */}
            <Box className={`p-6 md:p-8 ${sectionShell}`}>
              <Typography variant="h6" className="mb-4 flex items-center gap-2 font-semibold">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Iconify icon="solar:clipboard-list-bold" width={22} />
                </span>
                {t('form.productDetailsSectionEssentials')}
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailRow label={t('form.nameEn')} value={product.name?.en} emptyLabel={na} />
                <DetailRow label={t('form.nameAr')} value={product.name?.ar} emptyLabel={na} />
                {product.product_number ? (
                  <DetailRow
                    label={t('form.productDetailsProductNumber')}
                    value={product.product_number}
                    emptyLabel={na}
                  />
                ) : null}
                <DetailRow
                  label={t('columns.category')}
                  value={formatTranslated(product.category?.name) ?? product.category_id}
                  emptyLabel={na}
                />
                {!isRestaurant && (
                  <DetailRow
                    label={t('form.brand')}
                    value={product.brand?.name ?? '—'}
                    emptyLabel={na}
                  />
                )}
                <DetailRow
                  label={t('form.productVendor')}
                  value={product.vendor ? formatTranslated(product.vendor.name as any) : '—'}
                  emptyLabel={na}
                />
                {!isRestaurant && (
                  <>
                    <Box className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DetailRow
                        label={t('form.countryOriginSelect')}
                        value={productCountryOriginDisplay(product)}
                        emptyLabel={na}
                      />
                      <DetailRow
                        label={t('form.countrySaleSelect')}
                        value={productCountrySaleDisplay(product)}
                        emptyLabel={na}
                      />
                    </Box>
                    <DetailRow label={t('columns.sku')} value={product.sku} emptyLabel={na} />
                    <DetailRow label={t('form.model')} value={product.model} emptyLabel={na} />
                    <DetailRow label={t('form.barcode')} value={product.barcode} emptyLabel={na} />
                  </>
                )}
                <DetailRow
                  label={t('form.timeToPrepare')}
                  value={product.time_prepare}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsDeliveryTime')}
                  value={product.delivery_time}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsExpiryDate')}
                  value={
                    product.expiry_date
                      ? String(product.expiry_date).slice(0, 10)
                      : undefined
                  }
                  emptyLabel={na}
                />
              </Box>
            </Box>

            {/* Description */}
            <Box className={`p-6 md:p-8 ${sectionShell}`}>
              <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                <Iconify icon="solar:document-text-bold" width={20} />
                {t('form.productDetailsSectionDescription')}
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-muted-foreground font-medium mb-1">
                    {t('form.productDetailsDescriptionShortEn')}
                  </Typography>
                  <Typography variant="body1">{product.description?.en || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" className="text-muted-foreground font-medium mb-1">
                    {t('form.productDetailsDescriptionShortAr')}
                  </Typography>
                  <Typography variant="body1">{product.description?.ar || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" className="text-muted-foreground font-medium mb-1">
                    {t('form.productFullDescEn')}
                  </Typography>
                  <ProductRichDescriptionHtml html={product.full_description?.en} dir="ltr" />
                </Box>
                <Box>
                  <Typography variant="body2" className="text-muted-foreground font-medium mb-1">
                    {t('form.productFullDescAr')}
                  </Typography>
                  <ProductRichDescriptionHtml html={product.full_description?.ar} dir="rtl" />
                </Box>
              </Box>
            </Box>

            {/* SEO */}
            {(product.seo_title ||
              product.seo_description ||
              product.seo_keywords ||
              product.seo_image) && (
              <Box className={`p-6 md:p-8 ${sectionShell}`}>
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:globe-bold" width={20} />
                  {t('form.seoTitle')}
                </Typography>
                <Box className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <Box className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow
                      label={t('form.productDetailsSeoTitleEn')}
                      value={product.seo_title?.en}
                      emptyLabel={na}
                    />
                    <DetailRow
                      label={t('form.productDetailsSeoTitleAr')}
                      value={product.seo_title?.ar}
                      emptyLabel={na}
                    />
                    <DetailRow
                      label={t('form.productDetailsSeoDescEn')}
                      value={product.seo_description?.en}
                      emptyLabel={na}
                    />
                    <DetailRow
                      label={t('form.productDetailsSeoDescAr')}
                      value={product.seo_description?.ar}
                      emptyLabel={na}
                    />
                    <DetailRow
                      label={t('form.productDetailsSeoKeywordsEn')}
                      value={seoKw.en}
                      emptyLabel={na}
                    />
                    <DetailRow
                      label={t('form.productDetailsSeoKeywordsAr')}
                      value={seoKw.ar}
                      emptyLabel={na}
                    />
                  </Box>
                  {product.seo_image ? (
                    <Box className="w-full shrink-0 lg:max-w-md">
                      <Typography variant="body2" className="text-muted-foreground font-medium mb-2">
                        {t('form.productDetailsSeoImage')}
                      </Typography>
                      <a
                        href={product.seo_image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-lg border border-border/60 bg-muted/20"
                      >
                        <img
                          src={product.seo_image}
                          alt={seoImageAlt}
                          className="mx-auto max-h-72 w-full object-contain"
                        />
                      </a>
                      <Typography variant="caption" className="mt-2 block">
                        <a
                          href={product.seo_image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {t('form.productDetailsSeoImageOpenFull')}
                        </a>
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              </Box>
            )}

            {/* Icons */}
            {product.icons?.length > 0 && (
              <Box className={`p-6 md:p-8 ${sectionShell}`}>
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:star-bold" width={20} />
                  {t('form.productDetailsIcons')}
                </Typography>
                <Box className="flex flex-wrap gap-3">
                  {product.icons.map((ic: any) => (
                    <Box key={ic.id} className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2">
                      {ic.icon ? (
                        <img src={ic.icon} alt="" className="w-8 h-8 object-contain" />
                      ) : null}
                      <Typography variant="body2">{ic.name ?? ic.id}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Badges (product merchandising) */}
            {product.badges?.length > 0 && (
              <Box className={`p-6 md:p-8 ${sectionShell}`}>
                <Typography variant="h6" className="mb-4 flex items-center gap-2 font-semibold">
                  <Iconify icon="solar:medal-ribbon-star-bold" width={20} />
                  {t('form.productDetailsBadges')}
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {product.badges.map((bd: any) => (
                    <Box
                      key={bd.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-muted/25 px-3 py-2"
                    >
                      {bd.icon ? (
                        <img src={bd.icon} alt="" className="h-7 w-7 rounded-md object-cover" />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Iconify icon="solar:medal-ribbon-bold" width={16} />
                        </span>
                      )}
                      <Typography variant="body2" className="font-medium">
                        {badgeAdminLabel(bd, t)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Variants */}
            {product.variants?.length > 0 && (
              <Box className={`p-6 md:p-8 ${sectionShell}`}>
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:widget-bold" width={20} />
                  {t('form.productDetailsVariants')} ({product.variants.length})
                </Typography>
                <Box className="space-y-4">
                  {product.variants.map((variant: any, i: number) => (
                    <Box key={variant.id ?? i} className="space-y-3 rounded-xl border border-border/40 bg-card/30 p-4">
                      {/* Variant header with actions */}
                      <Box className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <Box className="min-w-0 flex-1 space-y-1">
                          <Typography variant="subtitle1" className="font-semibold leading-snug text-foreground">
                            {variant.name
                              ? formatTranslated(variant.name)
                              : t('form.productDetailsVariantHeader', {
                                  n: i + 1,
                                  id: variant.id,
                                })}
                          </Typography>
                          <Typography variant="caption" className="font-mono text-muted-foreground">
                            ID #{variant.id}
                          </Typography>
                          <Box className="flex flex-wrap gap-1.5 pt-1">
                            {boolFromApi(variant.is_trend) ? (
                              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                                {t('form.productDetailsVariantIsTrendLabel')}
                              </span>
                            ) : null}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                boolFromApi(variant.is_active ?? true)
                                  ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-300'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {boolFromApi(variant.is_active ?? true)
                                ? t('form.productDetailsVariantIsActiveLabel')
                                : t('inactive')}
                            </span>
                          </Box>
                        </Box>
                        <Box className="flex shrink-0 items-center gap-1">
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setEditVariant(variant)}
                            className="text-primary hover:bg-primary/10 min-w-0 px-2"
                          >
                            <Iconify icon="solar:pen-bold" width={16} />
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            disabled={variantDeleteFlow.isDeleting}
                            onClick={() => variantDeleteFlow.requestDelete(variant.id, undefined)}
                            className="text-destructive hover:bg-destructive/10 min-w-0 px-2"
                          >
                            <Iconify icon="solar:trash-bin-minimalistic-bold" width={16} />
                          </Button>
                        </Box>
                      </Box>

                      <Box className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          {t('form.productSku')}:{' '}
                          <span className="font-mono text-foreground">{variant.sku ?? na}</span>
                        </span>
                        {!isRestaurant && (
                          <>
                            <span>
                              {t('form.productModel')}:{' '}
                              <span className="font-mono text-foreground">{variant.model ?? na}</span>
                            </span>
                            <span>
                              {t('form.productBarcode')}:{' '}
                              <span className="font-mono text-foreground">{variant.barcode ?? na}</span>
                            </span>
                          </>
                        )}
                      </Box>

                      {/* Attributes */}
                      {variant.attributes?.length > 0 && (
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground mb-2 block">
                            {t('form.productDetailsAttributes')}
                          </Typography>
                          <Box className="flex flex-wrap gap-2">
                            {variant.attributes.map((attr: any, ai: number) => {
                              const attrValue = toDisplayString(attr.value);
                              const isColor = attr.type === 'color';
                              return (
                                <Box
                                  key={ai}
                                  className="flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-1 text-xs"
                                >
                                  <span className="font-medium">{toDisplayString(attr.attribute)}:</span>
                                  {isColor ? (
                                    <span className="flex items-center gap-1">
                                      <span
                                        className="inline-block w-3 h-3 rounded-full border border-border/50"
                                        style={{ backgroundColor: attrValue }}
                                      />
                                      {attrValue}
                                    </span>
                                  ) : (
                                    <span>{attrValue}</span>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      )}

                      {variant.images?.length > 0 && (
                        <Box>
                          <Typography variant="caption" className="mb-2 block text-muted-foreground">
                            {t('form.productDetailsVariantImages')}
                          </Typography>
                          <Box className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                            {variant.images.map((img: { id: number; url: string }) => (
                              <a
                                key={img.id}
                                href={img.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/30 ring-offset-2 hover:ring-2 hover:ring-primary/30"
                              >
                                <img src={img.url} alt="" className="h-full w-full object-cover" />
                              </a>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Variant price/stock — shared across every shop */}
                      <Box>
                        <Typography variant="caption" className="mb-2 block text-muted-foreground">
                          {t('form.productDetailsVariantPriceStockTitle')}
                        </Typography>
                        <Box className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                          <Box className="rounded-lg bg-background/60 px-2 py-1.5">
                            <Typography variant="caption" className="text-muted-foreground">
                              {t('form.priceLabel')}
                            </Typography>
                            <Typography variant="body2" component="div" className="font-medium tabular-nums">
                              {productMoneyDisplay({
                                currencies: variant.price_currencies,
                                amount: variant.price,
                                legacyAmountPrefix: t('currencySyrianPound'),
                              })}
                            </Typography>
                          </Box>
                          <Box className="rounded-lg bg-background/60 px-2 py-1.5">
                            <Typography variant="caption" className="text-muted-foreground">
                              {t('columns.discount')}
                            </Typography>
                            <Typography variant="body2" component="div" className="tabular-nums">
                              {productMoneyDisplay({
                                currencies: variant.discount_currencies,
                                amount: variant.discount,
                                legacyAmountPrefix: t('currencySyrianPound'),
                              })}
                            </Typography>
                          </Box>
                          <Box className="rounded-lg bg-background/60 px-2 py-1.5">
                            <Typography variant="caption" className="text-muted-foreground">
                              {t('columns.priceAfterDiscount')}
                            </Typography>
                            <Typography variant="body2" component="div" className="font-medium tabular-nums">
                              {productMoneyDisplay({
                                currencies: variant.price_after_discount_currencies,
                                amount: variant.price_after_discount,
                                legacyAmountPrefix: t('currencySyrianPound'),
                              })}
                            </Typography>
                          </Box>
                          <Box className="rounded-lg bg-background/60 px-2 py-1.5">
                            <Typography variant="caption" className="text-muted-foreground">
                              {t('form.variantQuantityLabel')}
                            </Typography>
                            <Typography variant="body2" className="font-semibold tabular-nums">
                              {variant.quantity ?? na}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Shop availability */}
                      {variant.shops?.length > 0 && (
                        <Box>
                          <Typography variant="caption" className="mb-2 block text-muted-foreground">
                            {t('form.productDetailsShopPricing')}
                          </Typography>
                          <Box className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {variant.shops.map((shop: any, si: number) => (
                              <Box
                                key={shop.id ?? si}
                                className="rounded-xl border border-border/45 bg-muted/15 p-3 shadow-sm"
                              >
                                <Box className="flex flex-wrap items-start justify-between gap-2">
                                  <Box className="min-w-0">
                                    <Typography variant="body2" className="font-semibold text-foreground">
                                      {shop.shop_name}
                                    </Typography>
                                    {shop.is_restaurant ? (
                                      <Typography variant="caption" className="text-muted-foreground">
                                        {t('form.isRestaurant')}
                                      </Typography>
                                    ) : null}
                                  </Box>
                                  <Box className="flex shrink-0 gap-0.5">
                                    <Button
                                      size="small"
                                      variant="text"
                                      onClick={() => setEditShopVariant(shop)}
                                      className="h-8 min-w-0 px-1.5 text-primary hover:bg-primary/10"
                                    >
                                      <Iconify icon="solar:pen-bold" width={14} />
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="text"
                                      disabled={shopVariantDeleteFlow.isDeleting}
                                      onClick={() =>
                                        shopVariantDeleteFlow.requestDelete(shop.id, undefined)
                                      }
                                      className="h-8 min-w-0 px-1.5 text-destructive hover:bg-destructive/10"
                                    >
                                      <Iconify icon="solar:trash-bin-minimalistic-bold" width={14} />
                                    </Button>
                                  </Box>
                                </Box>
                                <Box className="mt-3 rounded-lg bg-background/60 px-2 py-1.5 text-xs">
                                  <Typography variant="caption" className="text-muted-foreground">
                                    {t('form.branchCostPriceLabel')}
                                  </Typography>
                                  <Typography variant="body2" component="div" className="tabular-nums">
                                    {productMoneyDisplay({
                                      currencies: shop.cost_price_currencies,
                                      amount: shop.cost_price,
                                      legacyAmountPrefix: t('currencySyrianPound'),
                                    })}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Edit Variant Modal */}
            {editVariant && (
              <EditVariantModal
                open={!!editVariant}
                variant={editVariant}
                isRestaurant={isRestaurant}
                onClose={() => setEditVariant(null)}
                onSuccess={() => refetch()}
              />
            )}

            {/* Delete Variant Confirm — lists what the delete touches before committing */}
            <VariantDeleteImpactDialog {...variantDeleteFlow.dialogProps} />

            {/* Edit Shop Variant Modal */}
            {editShopVariant && (
              <EditShopVariantModal
                open={!!editShopVariant}
                shopVariant={editShopVariant}
                onClose={() => setEditShopVariant(null)}
                onSuccess={() => refetch()}
              />
            )}

            {/* Delete Shop Variant Confirm — same impact preview as the variant delete */}
            <VariantDeleteImpactDialog {...shopVariantDeleteFlow.dialogProps} />

            {/* Category Details */}
            {product.category_details?.length > 0 && (
              <Box className={`p-6 md:p-8 ${sectionShell}`}>
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:list-bold" width={20} />
                  {t('form.productDetailsCategoryDetailsSection')}
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.category_details.map((cd: any) => (
                    <Box key={cd.id} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                      <Typography variant="caption" className="text-muted-foreground font-medium block mb-1">
                        {cd.name}
                      </Typography>
                      <Box className="flex gap-4 text-sm">
                        <span>
                          <span className="text-muted-foreground">{t('form.productDetailsLangEn')}: </span>
                          {cd.value?.en}
                        </span>
                        <span>
                          <span className="text-muted-foreground">{t('form.productDetailsLangAr')}: </span>
                          {cd.value?.ar}
                        </span>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Extra Details */}
            {product.extra_details?.length > 0 && (
              <Box className={`p-6 md:p-8 ${sectionShell}`}>
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:notes-bold" width={20} />
                  {t('form.productDetailsExtraDetailsSection')}
                </Typography>
                <Box className="space-y-3">
                  {product.extra_details.map((ed: any) => (
                    <Box key={ed.id} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                      {ed.category?.name ? (
                        <Typography variant="caption" className="mb-2 block font-semibold text-primary">
                          {ed.category.name}
                        </Typography>
                      ) : null}
                      <Box className="grid grid-cols-2 gap-2 text-sm">
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.productDetailsKeyEn')}
                          </Typography>
                          <Typography variant="body2">{ed.key?.en}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.productDetailsKeyAr')}
                          </Typography>
                          <Typography variant="body2">{ed.key?.ar}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.productDetailsValueEn')}
                          </Typography>
                          <Typography variant="body2">{ed.value?.en}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.productDetailsValueAr')}
                          </Typography>
                          <Typography variant="body2">{ed.value?.ar}</Typography>
                        </Box>
                        {ed.price != null || ed.price_currencies ? (
                          <Box className="col-span-2">
                            <Typography variant="caption" className="text-muted-foreground">
                              {t('form.productDetailsExtraPrice')}
                            </Typography>
                            <Typography variant="body2" component="div">
                              {productMoneyDisplay({
                                currencies: ed.price_currencies,
                                amount: ed.price,
                                legacyAmountPrefix: t('currencySyrianPound'),
                              })}
                            </Typography>
                          </Box>
                        ) : null}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Bought With */}
            {product.bought_with?.length > 0 && (
              <Box className={`p-6 md:p-8 ${sectionShell}`}>
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:cart-bold" width={20} />
                  {t('form.productDetailsBoughtWithSection')}
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {product.bought_with.map((item: number | { id: number; name?: string }) => {
                    const boughtWithId =
                      typeof item === 'object' && item !== null && 'id' in item ? item.id : Number(item);
                    return (
                      <Box
                        key={boughtWithId}
                        className="rounded-md border border-border/50 bg-muted/30 px-3 py-1 text-sm"
                      >
                        {boughtWithItemLabel(item, t)}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          {/* Pricing & stock — prominent column on large screens */}
          <Box className="order-1 xl:order-2 xl:col-span-4 xl:sticky xl:top-6 xl:self-start">
            <Box
              className={`border-primary/25 bg-gradient-to-br from-primary/[0.07] via-card/90 to-muted/20 p-6 shadow-xl shadow-primary/5 md:p-8 ${sectionShell}`}
            >
              <Typography variant="h6" className="mb-6 flex items-center gap-3 font-semibold">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-inner">
                  <Iconify icon="solar:tag-price-bold" width={24} />
                </span>
                {t('form.productDetailsSectionPricing')}
              </Typography>
              <Box className="space-y-5">
                <DetailRow
                  label={t('columns.price')}
                  value={productMoneyDisplay({
                    currencies: product.price_currencies,
                    singleFormatted: product.price_formatted,
                    amount: product.price,
                    legacyAmountPrefix: t('currencySyrianPound'),
                  })}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('columns.priceAfterDiscount')}
                  value={productMoneyDisplay({
                    currencies: product.price_after_discount_currencies,
                    singleFormatted: product.price_after_discount_formatted,
                    amount: product.price_after_discount,
                    legacyAmountPrefix: t('currencySyrianPound'),
                  })}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsCostPrice')}
                  value={productMoneyDisplay({
                    currencies: product.cost_price_currencies,
                    singleFormatted: product.cost_price_formatted,
                    amount: product.cost_price,
                    legacyAmountPrefix: t('currencySyrianPound'),
                  })}
                  emptyLabel={na}
                />
                <Box className="h-px bg-border/60" />
                <DetailRow label={t('form.productDetailsCatalogQty')} value={product.quantity} emptyLabel={na} />
                <DetailRow
                  label={t('form.productDetailsStock')}
                  value={product.stock != null ? String(product.stock) : undefined}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsMaxPurchase')}
                  value={
                    product.max_purchase_quantity != null
                      ? String(product.max_purchase_quantity)
                      : undefined
                  }
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsDiscount')}
                  value={
                    product.discount != null
                      ? `${product.discount}${
                          String(product.discount_type ?? '').toLowerCase() === 'percentage'
                            ? '%'
                            : ''
                        }`
                      : '—'
                  }
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsDiscountType')}
                  value={formatDiscountTypeLabel(product.discount_type, t)}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsUnit')}
                  value={(() => {
                    const u = product as ProductDetailData & {
                      unit?: string | null | { id?: number; name?: { en?: string; ar?: string } };
                    };
                    const raw = u.unit;
                    if (raw && typeof raw === 'object' && raw.name) {
                      return formatTranslated(raw.name as { en?: string; ar?: string });
                    }
                    if (typeof raw === 'string' && raw.trim()) return raw;
                    return '—';
                  })()}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsWarrantyMonths')}
                  value={product.warranty_period ?? '—'}
                  emptyLabel={na}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
