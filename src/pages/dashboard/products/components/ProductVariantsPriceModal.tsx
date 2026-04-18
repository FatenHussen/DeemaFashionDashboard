import type { AdminProductVariantListItem } from '@/pages/dashboard/products/types/product.types';

import { queryKeys } from '@/api';
import { toast } from 'react-toastify';
import { Input } from '@/shared/ui/input';
import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { _ProductApi } from '@/pages/dashboard/products/api/product.services';
import { useUpdateShopProductVariant } from '@/pages/dashboard/products/hooks/product-variant';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const PER_PAGE = 10;

function resolveVariantImageUrl(url: string | null | undefined): string | null {
  if (url == null || String(url).trim() === '') return null;
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return `${CONFIG.serverUrl}/${s.replace(/^\//, '')}`;
}

type Props = {
  open: boolean;
  productId: number | null;
  /** Row price from the list (used when variants payload has no `product.price` yet). */
  fallbackListPrice?: number;
  onClose: () => void;
  canEditShopPrices: boolean;
  onBasePriceUpdate?: (id: number, price: number) => Promise<void>;
};

/** Shop offer edits: `PUT /admin/shop-product-variants/:id` (see `_ShopProductVariantApi.update`). */
function ShopVariantRowEditor({
  shopVariant,
  canEdit,
  onSuccess,
  labels,
}: {
  shopVariant: AdminProductVariantListItem['shop_variants'][number];
  canEdit: boolean;
  onSuccess: () => void;
  labels: { save: string; price: string; cost: string; stock: string };
}) {
  const { t } = useTranslation('table');
  const { mutate, isPending } = useUpdateShopProductVariant();
  const [price, setPrice] = useState(String(shopVariant.price));
  const [costPrice, setCostPrice] = useState(
    shopVariant.cost_price != null ? String(shopVariant.cost_price) : ''
  );
  const [quantity, setQuantity] = useState(String(shopVariant.quantity));

  useEffect(() => {
    setPrice(String(shopVariant.price));
    setCostPrice(shopVariant.cost_price != null ? String(shopVariant.cost_price) : '');
    setQuantity(String(shopVariant.quantity));
  }, [shopVariant]);

  const dirty =
    price !== String(shopVariant.price) ||
    costPrice !==
      (shopVariant.cost_price != null ? String(shopVariant.cost_price) : '') ||
    quantity !== String(shopVariant.quantity);

  const handleSave = () => {
    const p = parseFloat(price);
    const q = parseInt(quantity, 10);
    const c = costPrice.trim() === '' ? undefined : parseFloat(costPrice);
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

    mutate(
      {
        id: shopVariant.id,
        data: {
          price: p,
          quantity: q,
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

  if (!canEdit) {
    return (
      <div className="grid grid-cols-1 gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm sm:grid-cols-4">
        <div className="font-medium text-foreground sm:col-span-1">{shopName}</div>
        <div>
          <span className="text-muted-foreground">{labels.price}: </span>
          {shopVariant.price}
        </div>
        <div>
          <span className="text-muted-foreground">{labels.cost}: </span>
          {shopVariant.cost_price ?? '—'}
        </div>
        <div>
          <span className="text-muted-foreground">{labels.stock}: </span>
          {shopVariant.quantity}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/10 px-3 py-2 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="min-w-[120px] flex-1 text-sm font-medium text-foreground">{shopName}</div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-xs text-muted-foreground">{labels.price}</span>
        <Input
          type="number"
          step="0.01"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-xs text-muted-foreground">{labels.cost}</span>
        <Input
          type="number"
          step="0.01"
          min={0}
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-xs text-muted-foreground">{labels.stock}</span>
        <Input
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="h-9"
        />
      </div>
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
  );
}

export function ProductVariantsPriceModal({
  open,
  productId,
  fallbackListPrice,
  onClose,
  canEditShopPrices,
  onBasePriceUpdate,
}: Props) {
  const { t } = useTranslation('table');
  const [page, setPage] = useState(1);
  const [basePrice, setBasePrice] = useState('');
  const [savingBase, setSavingBase] = useState(false);

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

  const pagination = data?.pagination;
  const items = data?.items ?? [];

  const referenceBasePrice = items[0]?.product?.price ?? fallbackListPrice;
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
                </div>
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
            <p className="py-8 text-center text-sm text-muted-foreground">{t('noItemsFound')}</p>
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
                    <div className="min-w-0 flex-1 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground leading-snug">
                        {attrLabel}
                      </span>
                      {variant.is_active === false && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {t('inactive')}
                        </span>
                      )}
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
