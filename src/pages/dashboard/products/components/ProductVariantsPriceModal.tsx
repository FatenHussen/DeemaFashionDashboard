import type { CurrencyData } from '@/pages/dashboard/currencies/types/currency.types';
import type { AdminProductVariantListItem } from '@/pages/dashboard/products/types/product.types';

import { queryKeys } from '@/api';
import { toast } from 'react-toastify';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { _ProductApi } from '@/pages/dashboard/products/api/product.services';
import { useFetchCurrencies } from '@/pages/dashboard/currencies/hooks/currency';
import { useUpdateShopProductVariant } from '@/pages/dashboard/products/hooks/product-variant';
import {
  parseDiscountValue,
  validateShopVariantDiscount,
  calculatePriceAfterDiscountSyp,
  normalizeShopVariantDiscountType,
  type ShopVariantDiscountType,
} from '@/pages/dashboard/products/utils/shop-variant-discount';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const PER_PAGE = 10;

function parseCurrencyRate(c: CurrencyData): number {
  const r = Number((c as { exchange_rate?: string | number }).exchange_rate);
  return r > 0 ? r : 1;
}

/** `exchange_rate` = units of local currency per 1 USD → USD = local / rate. */
function localAmountToUsd(local: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return local / r;
}

function usdToLocalAmount(usd: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return usd * r;
}

function resolveVariantImageUrl(url: string | null | undefined): string | null {
  if (url == null || String(url).trim() === '') return null;
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return `${CONFIG.serverUrl}/${s.replace(/^\//, '')}`;
}

function formatShopVariantDiscountValue(discount: number | null | undefined): string {
  return discount != null ? String(discount) : '';
}

const selectInputClass =
  'h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

type Props = {
  open: boolean;
  productId: number | null;
  /** Row price from the list (used when variants payload has no `product.price` yet). */
  fallbackListPrice?: number;
  onClose: () => void;
  canEditShopPrices: boolean;
  onBasePriceUpdate?: (id: number, price: number) => Promise<void>;
  /**
   * When `GET .../products/:id/variants` returns no rows, allow editing product-level stock
   * (same as the legacy inventory quantity update).
   */
  productQuantityFallback?: {
    quantity: number;
    onSave: (quantity: number) => Promise<void>;
    canEdit: boolean;
  };
};

/** Shop offer edits: `PUT /admin/shop-product-variants/:id` (see `_ShopProductVariantApi.update`). */
function ShopVariantRowEditor({
  shopVariant,
  canEdit,
  onSuccess,
  labels,
  dualPriceReady,
  sypRate,
  sypSymbol,
}: {
  shopVariant: AdminProductVariantListItem['shop_variants'][number];
  canEdit: boolean;
  onSuccess: () => void;
  labels: {
    save: string;
    price: string;
    cost: string;
    priceAfterDiscount: string;
    stock: string;
    discountType: string;
    discountPercentage: string;
    discountAmount: string;
    discountValue: string;
  };
  dualPriceReady: boolean;
  sypRate: number;
  sypSymbol?: string;
}) {
  const { t } = useTranslation('table');
  const { mutate, isPending } = useUpdateShopProductVariant();
  const [price, setPrice] = useState(String(shopVariant.price));
  const [costPrice, setCostPrice] = useState(
    shopVariant.cost_price != null ? String(shopVariant.cost_price) : ''
  );
  const [quantity, setQuantity] = useState(String(shopVariant.quantity));
  const [discountType, setDiscountType] = useState<ShopVariantDiscountType>(() =>
    normalizeShopVariantDiscountType(shopVariant.discount_type)
  );
  const [discountValue, setDiscountValue] = useState(() =>
    formatShopVariantDiscountValue(shopVariant.discount)
  );

  useEffect(() => {
    setPrice(String(shopVariant.price));
    setCostPrice(shopVariant.cost_price != null ? String(shopVariant.cost_price) : '');
    setQuantity(String(shopVariant.quantity));
    setDiscountType(normalizeShopVariantDiscountType(shopVariant.discount_type));
    setDiscountValue(formatShopVariantDiscountValue(shopVariant.discount));
  }, [shopVariant]);

  const initialDiscountType = normalizeShopVariantDiscountType(shopVariant.discount_type);
  const initialDiscountValue = formatShopVariantDiscountValue(shopVariant.discount);

  const dirty =
    price !== String(shopVariant.price) ||
    costPrice !==
      (shopVariant.cost_price != null ? String(shopVariant.cost_price) : '') ||
    quantity !== String(shopVariant.quantity) ||
    discountType !== initialDiscountType ||
    discountValue !== initialDiscountValue;

  const usdNum = parseFloat(price) || 0;
  const sypNum = dualPriceReady ? usdToLocalAmount(usdNum, sypRate) : usdNum;
  const discountValueNum = parseDiscountValue(discountValue);

  const calculatedPriceAfterDiscount = useMemo(
    () =>
      calculatePriceAfterDiscountSyp({
        sypPrice: sypNum,
        discountType,
        discountValue: Number.isNaN(discountValueNum) ? 0 : discountValueNum,
      }),
    [sypNum, discountType, discountValueNum]
  );

  const discountSuffix =
    discountType === 'percentage' ? '%' : sypSymbol?.trim() || 'SYP';

  const handleSave = () => {
    const p = parseFloat(price);
    const q = parseInt(quantity, 10);
    const c = costPrice.trim() === '' ? undefined : parseFloat(costPrice);
    const parsedDiscount = parseDiscountValue(discountValue);

    if (Number.isNaN(p) || p < 0) {
      toast.error(t('productVariantsModalInvalidPrice'));
      return;
    }
    if (Number.isNaN(q) || q < 0) {
      toast.error(t('productVariantsModalInvalidQuantity'));
      return;
    }
    if (c !== undefined && (Number.isNaN(c) || c < 0)) {
      toast.error(t('productVariantsModalInvalidCost'));
      return;
    }

    const discountValidation = validateShopVariantDiscount({
      discountType,
      discountValue: parsedDiscount,
      sypPrice: sypNum,
    });
    if (!discountValidation.valid) {
      toast.error(t(discountValidation.errorKey));
      return;
    }

    mutate(
      {
        id: shopVariant.id,
        data: {
          price: p,
          quantity: q,
          discount_type: discountType,
          discount: parsedDiscount,
          ...(c !== undefined ? { cost_price: c } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success(t('productVariantsShopUpdated'));
          onSuccess();
        },
        onError: (e: unknown) => {
          toast.error(e instanceof Error ? e.message : String(e));
        },
      }
    );
  };

  const shopName =
    typeof shopVariant.shop?.name === 'string'
      ? shopVariant.shop.name
      : formatTranslated(shopVariant.shop?.name as Parameters<typeof formatTranslated>[0]);

  const discountTypeLabel =
    initialDiscountType === 'fixed' ? labels.discountAmount : labels.discountPercentage;

  const fieldShell = 'flex min-w-0 flex-col gap-1';
  const labelClass = 'text-xs leading-snug text-muted-foreground';

  if (!canEdit) {
    const usdP = Number(shopVariant.price) || 0;
    const sypP = dualPriceReady ? usdToLocalAmount(usdP, sypRate) : null;
    const readOnlyDiscountValue = parseDiscountValue(initialDiscountValue);
    const readOnlyPriceAfterDiscount = calculatePriceAfterDiscountSyp({
      sypPrice: sypP ?? usdP,
      discountType: initialDiscountType,
      discountValue: Number.isNaN(readOnlyDiscountValue) ? 0 : readOnlyDiscountValue,
    });

    return (
      <div className="grid grid-cols-1 gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="font-medium text-foreground sm:col-span-2 xl:col-span-4">{shopName}</div>
        <div>
          <span className="text-muted-foreground">{t('form.productPriceUsdLabel')}: </span>
          {shopVariant.price}
          {sypP != null ? (
            <>
              <span className="text-muted-foreground"> · {t('form.productPriceSypLabel')}: </span>
              {sypP}
            </>
          ) : null}
        </div>
        <div>
          <span className="text-muted-foreground">{labels.discountType}: </span>
          {discountTypeLabel}
        </div>
        <div>
          <span className="text-muted-foreground">{labels.discountValue}: </span>
          {initialDiscountValue !== '' ? initialDiscountValue : '—'}
        </div>
        <div>
          <span className="text-muted-foreground">{labels.cost}: </span>
          {shopVariant.cost_price ?? '—'}
        </div>
        <div>
          <span className="text-muted-foreground">{labels.priceAfterDiscount}: </span>
          {readOnlyPriceAfterDiscount}
        </div>
        <div>
          <span className="text-muted-foreground">{labels.stock}: </span>
          {shopVariant.quantity}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border/60 bg-muted/10 px-3 py-3">
      <div className="text-sm font-medium text-foreground">{shopName}</div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {dualPriceReady ? (
          <>
            <div className={fieldShell}>
              <span className={labelClass}>{t('form.productPriceUsdLabel')}</span>
              <Input
                type="number"
                step="any"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-9 w-full min-w-0"
              />
            </div>
            <div className={fieldShell}>
              <span className={labelClass}>{t('form.productPriceSypLabel')}</span>
              <Input
                type="number"
                step="any"
                min={0}
                value={usdNum === 0 && sypNum === 0 ? '' : sypNum}
                onChange={(e) => {
                  const raw = e.target.value;
                  const v = raw === '' ? 0 : parseFloat(raw);
                  setPrice(String(localAmountToUsd(Number.isFinite(v) ? v : 0, sypRate)));
                }}
                className="h-9 w-full min-w-0"
              />
            </div>
          </>
        ) : (
          <div className={fieldShell}>
            <span className={labelClass}>{labels.price}</span>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-9 w-full min-w-0"
            />
          </div>
        )}
        <div className={fieldShell}>
          <span className={labelClass}>{labels.discountType}</span>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(normalizeShopVariantDiscountType(e.target.value))}
            className={selectInputClass}
          >
            <option value="percentage">{labels.discountPercentage}</option>
            <option value="fixed">{labels.discountAmount}</option>
          </select>
        </div>
        <div className={fieldShell}>
          <span className={labelClass}>{labels.discountValue}</span>
          <Input
            type="number"
            step="any"
            min={0}
            max={discountType === 'percentage' ? 100 : sypNum > 0 ? sypNum : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percentage' ? '0' : '0'}
            endAdornment={
              <span className="text-xs text-muted-foreground tabular-nums">{discountSuffix}</span>
            }
            className="h-9 w-full min-w-0"
          />
        </div>
        <div className={fieldShell}>
          <span className={labelClass}>{labels.cost}</span>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className="h-9 w-full min-w-0"
          />
        </div>
        <div className={fieldShell}>
          <span className={labelClass}>{labels.priceAfterDiscount}</span>
          <Input
            type="number"
            readOnly
            disabled
            value={calculatedPriceAfterDiscount}
            className="h-9 w-full min-w-0 bg-muted/40"
          />
        </div>
        <div className={fieldShell}>
          <span className={labelClass}>{labels.stock}</span>
          <Input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-9 w-full min-w-0"
          />
        </div>
      </div>
      <div className="flex justify-end border-t border-border/50 pt-3">
        <Button
          type="button"
          size="small"
          variant="contained"
          disabled={!dirty || isPending}
          onClick={handleSave}
          className="h-9 shrink-0"
        >
          {isPending ? <Iconify icon="svg-spinners:ring-resize" width={18} /> : labels.save}
        </Button>
      </div>
    </div>
  );
}

export function ProductVariantsPriceModal({
  open,
  productId,
  fallbackListPrice,
  onClose,
  canEditShopPrices,
  onBasePriceUpdate,
  productQuantityFallback,
}: Props) {
  const { t } = useTranslation('table');
  const [page, setPage] = useState(1);
  const [basePrice, setBasePrice] = useState('');
  const [savingBase, setSavingBase] = useState(false);
  const [fallbackQtyInput, setFallbackQtyInput] = useState('');
  const [savingFallbackQty, setSavingFallbackQty] = useState(false);

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

  const productDualPriceReady = Boolean(usdCurrency && sypCurrency);
  const sypRate = sypCurrency ? parseCurrencyRate(sypCurrency) : 1;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.product.variants(productId ?? 0, { page, per_page: PER_PAGE }),
    queryFn: () =>
      _ProductApi.getProductVariants(productId as number, { page, per_page: PER_PAGE }),
    enabled: open && productId != null,
  });

  useEffect(() => {
    if (open) setPage(1);
  }, [open, productId]);

  useEffect(() => {
    const p = data?.items?.[0]?.product?.price ?? fallbackListPrice;
    if (p != null && !Number.isNaN(Number(p))) {
      setBasePrice(String(p));
    } else {
      setBasePrice('');
    }
  }, [data?.items, fallbackListPrice]);

  useEffect(() => {
    if (open && productQuantityFallback != null) {
      setFallbackQtyInput(String(productQuantityFallback.quantity ?? 0));
    }
  }, [open, productId, productQuantityFallback?.quantity]);

  const pagination = data?.pagination;
  const items = data?.items ?? [];

  const handleSaveFallbackQuantity = async () => {
    if (!productQuantityFallback?.canEdit || productId == null) return;
    const n = Number(fallbackQtyInput);
    if (Number.isNaN(n) || n < 0 || !Number.isFinite(n)) {
      toast.error(t('productVariantsModalInvalidQuantity'));
      return;
    }
    const rounded = Math.floor(n);
    setSavingFallbackQty(true);
    try {
      await productQuantityFallback.onSave(rounded);
      refetch();
    } catch {
      /* toast from caller */
    } finally {
      setSavingFallbackQty(false);
    }
  };

  const fallbackQtyInitial = Math.floor(Number(productQuantityFallback?.quantity) || 0);
  const fallbackQtyParsed = Math.floor(Number(fallbackQtyInput) || 0);
  const fallbackQtySaveDisabled =
    savingFallbackQty ||
    Number.isNaN(fallbackQtyParsed) ||
    fallbackQtyParsed < 0 ||
    fallbackQtyParsed === fallbackQtyInitial;

  const referenceBasePrice = items[0]?.product?.price ?? fallbackListPrice;
  const baseUsdNum = parseFloat(basePrice) || 0;
  const baseSypNum = usdToLocalAmount(baseUsdNum, sypRate);

  const baseDirty =
    onBasePriceUpdate &&
    productId != null &&
    referenceBasePrice != null &&
    basePrice.trim() !== '' &&
    parseFloat(basePrice) !== Number(referenceBasePrice);

  const handleSaveBase = async () => {
    if (!onBasePriceUpdate || productId == null) return;
    const n = parseFloat(basePrice);
    if (Number.isNaN(n) || n < 0) {
      toast.error(t('productVariantsModalInvalidPrice'));
      return;
    }
    setSavingBase(true);
    try {
      await onBasePriceUpdate(productId, n);
      toast.success(t('priceUpdatedSuccess'));
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('priceUpdatedError'));
    } finally {
      setSavingBase(false);
    }
  };

  const labels = {
    save: t('save'),
    price: t('columns.price'),
    cost: t('productVariantsModalCost'),
    stock: t('columns.stock'),
    priceAfterDiscount: t('columns.priceAfterDiscount'),
    discountType: t('productVariantsDiscountModeLabel'),
    discountPercentage: t('productVariantsDiscountModePercentage'),
    discountAmount: t('productVariantsDiscountModeAmount'),
    discountValue: t('productVariantsDiscountValueLabel'),
  };

  const title =
    items[0]?.product?.name != null
      ? formatTranslated(
          items[0].product.name as Parameters<typeof formatTranslated>[0]
        )
      : productId != null
        ? t('productVariantsModalTitleWithId', { id: productId })
        : t('productVariantsModalTitle');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      className="max-h-[90vh] overflow-hidden flex flex-col"
      title={
        <span className="flex items-center gap-2">
          <Iconify icon="solar:layers-minimalistic-bold" width={22} className="text-primary" />
          {title}
        </span>
      }
      content={
        <div className="max-h-[min(70vh,720px)] overflow-y-auto space-y-4 pr-1">
          {onBasePriceUpdate && productId != null && referenceBasePrice != null && (
            <div className="rounded-lg border border-border/60 bg-muted/15 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('productVariantsModalBasePrice')}
              </p>
              <div className="flex flex-wrap items-end gap-2">
                {productDualPriceReady ? (
                  <>
                    <div className="flex min-w-[140px] flex-1 flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {t('form.productPriceUsdLabel')}
                      </span>
                      <Input
                        type="number"
                        step="any"
                        min={0}
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="flex min-w-[140px] flex-1 flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {t('form.productPriceSypLabel')}
                      </span>
                      <Input
                        type="number"
                        step="any"
                        min={0}
                        value={baseUsdNum === 0 && baseSypNum === 0 ? '' : baseSypNum}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const v = raw === '' ? 0 : parseFloat(raw);
                          setBasePrice(
                            String(localAmountToUsd(Number.isFinite(v) ? v : 0, sypRate))
                          );
                        }}
                        className="h-9"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex min-w-[140px] flex-1 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{t('columns.price')}</span>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="h-9"
                    />
                    <span className="text-xs text-destructive">{t('form.productPriceSypMissing')}</span>
                  </div>
                )}
                <Button
                  type="button"
                  size="small"
                  variant="contained"
                  disabled={!baseDirty || savingBase}
                  onClick={handleSaveBase}
                  className="h-9"
                >
                  {savingBase ? <Iconify icon="svg-spinners:ring-resize" width={18} /> : t('save')}
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Iconify icon="svg-spinners:ring-resize" width={24} />
              {t('loading')}
            </div>
          )}

          {isError && !isLoading && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-4 text-sm text-destructive">
              {t('productVariantsModalLoadError')}
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="space-y-4 py-2">
              {productQuantityFallback ? (
                <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">{t('form.quantity')}</p>
                  <p className="text-xs text-muted-foreground">{t('inventoryVariantsEmptyHint')}</p>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={fallbackQtyInput}
                    onChange={(e) => setFallbackQtyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSaveFallbackQuantity();
                    }}
                    disabled={!productQuantityFallback.canEdit || savingFallbackQty}
                    className="h-10 max-w-xs"
                  />
                  {productQuantityFallback.canEdit && (
                    <Button
                      type="button"
                      size="small"
                      variant="contained"
                      disabled={fallbackQtySaveDisabled}
                      onClick={() => void handleSaveFallbackQuantity()}
                      className="h-9"
                    >
                      {savingFallbackQty ? (
                        <Iconify icon="svg-spinners:ring-resize" width={18} />
                      ) : (
                        t('save')
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">{t('noItemsFound')}</p>
              )}
            </div>
          )}

          {!isLoading &&
            !isError &&
            items.map((variant: AdminProductVariantListItem) => {
              const attrParts = (variant.attributes ?? []).map((a) => {
                const cat = a.category_attribute?.name
                  ? `${formatTranslated(a.category_attribute.name as Parameters<typeof formatTranslated>[0])}: `
                  : '';
                return `${cat}${formatTranslated(a.name as Parameters<typeof formatTranslated>[0])}`;
              });
              const attrLabel = attrParts.filter(Boolean).join(' · ') || '—';
              const variantImg = resolveVariantImageUrl(variant.variant_image);
              const na = t('form.productDetailsNotAvailable');

              return (
                <div
                  key={variant.id}
                  className="rounded-xl border border-border/70 bg-background p-3 shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-start gap-3">
                    {variantImg ? (
                      <div className="shrink-0">
                        <img
                          src={variantImg}
                          alt={attrLabel}
                          className="h-[72px] w-[72px] rounded-lg border border-border/60 object-cover bg-muted"
                        />
                      </div>
                    ) : (
                      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/30">
                        <Iconify
                          icon="solar:gallery-minimalistic-bold"
                          width={28}
                          className="text-muted-foreground/70"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground leading-snug">
                          {attrLabel}
                        </span>
                        {variant.is_active === false && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {t('inactive')}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>
                          {t('form.productSku')}:{' '}
                          <span className="font-mono text-foreground">{variant.sku ?? na}</span>
                        </span>
                        <span>
                          {t('form.productModel')}:{' '}
                          <span className="font-mono text-foreground">{variant.model ?? na}</span>
                        </span>
                        <span>
                          {t('form.productBarcode')}:{' '}
                          <span className="font-mono text-foreground">{variant.barcode ?? na}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(variant.shop_variants ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('productVariantsModalNoShops')}</p>
                    ) : (
                      variant.shop_variants.map((sv) => (
                        <ShopVariantRowEditor
                          key={sv.id}
                          shopVariant={sv}
                          canEdit={canEditShopPrices}
                          onSuccess={() => refetch()}
                          labels={labels}
                          dualPriceReady={productDualPriceReady}
                          sypRate={sypRate}
                          sypSymbol={sypCurrency?.symbol}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}

          {!isLoading && !isError && pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                size="small"
                variant="outlined"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t('goToPreviousPage')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('pageOf', {
                  current: pagination.current_page,
                  total: pagination.last_page,
                })}
              </span>
              <Button
                type="button"
                size="small"
                variant="outlined"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('goToNextPage')}
              </Button>
            </div>
          )}
        </div>
      }
      actions={
        <Button type="button" variant="outlined" onClick={onClose}>
          {t('cancel')}
        </Button>
      }
    />
  );
}
