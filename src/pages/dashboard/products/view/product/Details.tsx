import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchProductById } from '@/pages/dashboard/products/hooks/product';
import {
  useUpdateProductVariant,
  useDeleteProductVariant,
  useUpdateShopProductVariant,
  useDeleteShopProductVariant,
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
      <Typography variant="body1" className="text-foreground">
        {value ?? emptyLabel}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Product Variant Edit Modal

interface EditVariantModalProps {
  open: boolean;
  variant: any;
  onClose: () => void;
  onSuccess: () => void;
}

function EditVariantModal({ open, variant, onClose, onSuccess }: EditVariantModalProps) {
  const { t } = useTranslation('table');
  const { mutate: updateVariant, isPending } = useUpdateProductVariant();

  const [isTrend, setIsTrend] = useState<number>(variant?.is_trend ?? 0);
  const [isActive, setIsActive] = useState<number>(variant?.is_active ?? 1);
  const [newImages, setNewImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && variant) {
      setIsTrend(variant.is_trend ?? 0);
      setIsActive(variant.is_active ?? 1);
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

  const handleSubmit = () => {
    if (!variant?.id) return;
    const attrIds: number[] = (variant.attributes ?? []).map((a: any) => a.value_id ?? a.id).filter(Boolean);
    updateVariant(
      {
        id: variant.id,
        data: {
          is_trend: isTrend,
          is_active: isActive,
          attributes_values_ids: attrIds,
          existing_images_ids: keptImageIds,
          images: newImages.length > 0 ? newImages : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('form.variantSaveSuccess'));
          onSuccess();
          onClose();
        },
        onError: () => {
          toast.error(t('form.variantSaveFailed'));
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

  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [shopId, setShopId] = useState<string>('');
  const [productVariantId, setProductVariantId] = useState<string>('');

  useEffect(() => {
    if (open && shopVariant) {
      setPrice(shopVariant.price != null ? String(shopVariant.price) : '');
      setQuantity(shopVariant.quantity != null ? String(shopVariant.quantity) : '');
      setShopId(shopVariant.shop_id != null ? String(shopVariant.shop_id) : '');
      setProductVariantId(shopVariant.product_variant_id != null ? String(shopVariant.product_variant_id) : '');
    }
  }, [open, shopVariant]);

  const handleSubmit = () => {
    if (!shopVariant?.id) return;
    updateShopVariant(
      {
        id: shopVariant.id,
        data: {
          price: price !== '' ? Number(price) : undefined,
          quantity: quantity !== '' ? Number(quantity) : undefined,
          shop_id: shopId !== '' ? Number(shopId) : undefined,
          product_variant_id: productVariantId !== '' ? Number(productVariantId) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('form.shopVariantSaveSuccess'));
          onSuccess();
          onClose();
        },
        onError: () => {
          toast.error(t('form.shopVariantSaveFailed'));
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
          {[
            { label: t('form.priceLabel'), value: price, setter: setPrice },
            { label: t('form.quantity'), value: quantity, setter: setQuantity },
            { label: t('form.productDetailsShopFieldShopId'), value: shopId, setter: setShopId },
            {
              label: t('form.productDetailsShopFieldProductVariantId'),
              value: productVariantId,
              setter: setProductVariantId,
            },
          ].map(({ label, value, setter }) => (
            <Box key={label}>
              <Typography variant="body2" className="text-muted-foreground mb-1 font-medium">
                {label}
              </Typography>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </Box>
          ))}
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

  const { mutate: deleteVariant } = useDeleteProductVariant();
  const { mutate: deleteShopVariant } = useDeleteShopProductVariant();

  const [editVariant, setEditVariant] = useState<any>(null);
  const [deleteVariantId, setDeleteVariantId] = useState<number | null>(null);
  const [editShopVariant, setEditShopVariant] = useState<any>(null);
  const [deleteShopVariantId, setDeleteShopVariantId] = useState<number | null>(null);

  const handleDeleteVariant = () => {
    if (!deleteVariantId) return;
    deleteVariant(deleteVariantId, {
      onSuccess: () => {
        toast.success(t('form.variantDeleteSuccess'));
        setDeleteVariantId(null);
        refetch();
      },
      onError: () => toast.error(t('form.variantDeleteFailed')),
    });
  };

  const handleDeleteShopVariant = () => {
    if (!deleteShopVariantId) return;
    deleteShopVariant(deleteShopVariantId, {
      onSuccess: () => {
        toast.success(t('form.productDetailsShopVariantDeleteSuccess'));
        setDeleteShopVariantId(null);
        refetch();
      },
      onError: () => toast.error(t('form.productDetailsShopVariantDeleteFailed')),
    });
  };

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
  const isRestaurant = Boolean(product?.category?.is_restaurant);
  const yes = t('form.productDetailsYes');
  const no = t('form.productDetailsNo');

  return (
    <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-5xl mx-auto">
          {/* Header */}
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate(paths.dashboard.products)}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2 rtl:rotate-180" />
              {t('form.productDetailsBack')}
            </Button>

            <Box className="flex items-start gap-4 mb-2">
              {/* Images gallery */}
              {product.images?.length > 0 ? (
                <Box className="flex gap-2 flex-wrap">
                  {product.images.map((img: any, i: number) => (
                    <img
                      key={img.id ?? i}
                      src={img.url}
                      alt={`${formatTranslated(product.name)} ${i + 1}`}
                      className="w-16 h-16 rounded-xl object-cover border border-border/60"
                    />
                  ))}
                </Box>
              ) : (
                <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Iconify icon="solar:box-bold" className="text-primary" width={32} height={32} />
                </Box>
              )}

              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {formatTranslated(product.name)}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.productDetailsIdLabel')}: {product.id}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => id && navigate(paths.dashboard.product.update(id))}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                {t('form.productDetailsEdit')}
              </Button>
            </Box>
          </Box>

          <Box className="space-y-4">
            {/* Basic Information */}
            <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
              <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                <Iconify icon="solar:info-circle-bold" width={20} />
                {t('form.productDetailsSectionBasic')}
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailRow label={t('form.nameEn')} value={product.name?.en} emptyLabel={na} />
                <DetailRow label={t('form.nameAr')} value={product.name?.ar} emptyLabel={na} />
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
                <DetailRow
                  label={t('form.productDetailsApproval')}
                  value={product.approval_status_label ?? product.approval_status ?? '—'}
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
                  label={t('form.instantDelivery')}
                  value={product.is_instant_delivery ? yes : no}
                  emptyLabel={na}
                />
              </Box>
            </Box>

            {/* Pricing & Stock */}
            <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
              <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                <Iconify icon="solar:tag-price-bold" width={20} />
                {t('form.productDetailsSectionPricing')}
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailRow label={t('columns.price')} value={`${t('currencySyrianPound')} ${product.price}`} emptyLabel={na} />
                <DetailRow
                  label={t('columns.priceAfterDiscount')}
                  value={
                    product.price_after_discount != null
                      ? `${t('currencySyrianPound')} ${product.price_after_discount}`
                      : '—'
                  }
                  emptyLabel={na}
                />
                <DetailRow label={t('form.quantity')} value={product.quantity} emptyLabel={na} />
                <DetailRow
                  label={t('form.productDetailsDiscount')}
                  value={product.discount != null ? String(product.discount) : '—'}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsDiscountType')}
                  value={String(product.discount_type ?? '—')}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsCostPrice')}
                  value={product.cost_price != null ? `${t('currencySyrianPound')} ${product.cost_price}` : '—'}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsUnit')}
                  value={product.unit ?? '—'}
                  emptyLabel={na}
                />
                <DetailRow
                  label={t('form.productDetailsWarrantyMonths')}
                  value={product.warranty_period ?? '—'}
                  emptyLabel={na}
                />
              </Box>
            </Box>

            {/* Description */}
            <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
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
            {(product.seo_title || product.seo_description || product.seo_keywords || product.seo_image) && (
              <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:globe-bold" width={20} />
                  {t('form.seoTitle')}
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </Box>
                {product.seo_image ? (
                  <Box className="mt-4">
                    <Typography variant="body2" className="text-muted-foreground mb-1">
                      {t('form.productDetailsSeoImage')}
                    </Typography>
                    <img src={product.seo_image} alt="" className="max-h-32 rounded-lg border border-border/60" />
                  </Box>
                ) : null}
              </Box>
            )}

            {/* Icons */}
            {product.icons?.length > 0 && (
              <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
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

            {/* Variants */}
            {product.variants?.length > 0 && (
              <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:widget-bold" width={20} />
                  {t('form.productDetailsVariants')} ({product.variants.length})
                </Typography>
                <Box className="space-y-4">
                  {product.variants.map((variant: any, i: number) => (
                    <Box key={variant.id ?? i} className="rounded-lg border border-border/40 p-4 space-y-3">
                      {/* Variant header with actions */}
                      <Box className="flex items-center justify-between">
                        <Typography variant="subtitle2" className="font-medium">
                          {t('form.productDetailsVariantHeader', {
                            n: i + 1,
                            id: variant.id,
                          })}
                        </Typography>
                        <Box className="flex items-center gap-1">
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
                            onClick={() => setDeleteVariantId(variant.id)}
                            className="text-destructive hover:bg-destructive/10 min-w-0 px-2"
                          >
                            <Iconify icon="solar:trash-bin-minimalistic-bold" width={16} />
                          </Button>
                        </Box>
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

                      {/* Shop pricing */}
                      {variant.shops?.length > 0 && (
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground mb-2 block">
                            {t('form.productDetailsShopPricing')}
                          </Typography>
                          <Box className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {variant.shops.map((shop: any, si: number) => (
                              <Box key={si} className="flex items-center justify-between rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-sm">
                                <span className="font-medium">{shop.shop_name}</span>
                                <Box className="flex items-center gap-3 text-muted-foreground">
                                  <span>{t('currencySyrianPound')} {shop.price}</span>
                                  <span>×{shop.quantity}</span>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setEditShopVariant(shop)}
                                    className="text-primary hover:bg-primary/10 min-w-0 px-1.5 h-7"
                                  >
                                    <Iconify icon="solar:pen-bold" width={14} />
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setDeleteShopVariantId(shop.id)}
                                    className="text-destructive hover:bg-destructive/10 min-w-0 px-1.5 h-7"
                                  >
                                    <Iconify icon="solar:trash-bin-minimalistic-bold" width={14} />
                                  </Button>
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
                onClose={() => setEditVariant(null)}
                onSuccess={() => refetch()}
              />
            )}

            {/* Delete Variant Confirm */}
            <Dialog
              open={deleteVariantId !== null}
              onClose={() => setDeleteVariantId(null)}
              maxWidth="xs"
              title={t('form.productDetailsDeleteVariantTitle')}
              content={
                <Typography variant="body2">
                  {t('form.productDetailsDeleteVariantBody', { id: deleteVariantId ?? '' })}
                </Typography>
              }
              actions={
                <>
                  <Button variant="outlined" onClick={() => setDeleteVariantId(null)}>
                    {t('cancel')}
                  </Button>
                  <Button variant="contained" onClick={handleDeleteVariant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t('delete')}
                  </Button>
                </>
              }
            />

            {/* Edit Shop Variant Modal */}
            {editShopVariant && (
              <EditShopVariantModal
                open={!!editShopVariant}
                shopVariant={editShopVariant}
                onClose={() => setEditShopVariant(null)}
                onSuccess={() => refetch()}
              />
            )}

            {/* Delete Shop Variant Confirm */}
            <Dialog
              open={deleteShopVariantId !== null}
              onClose={() => setDeleteShopVariantId(null)}
              maxWidth="xs"
              title={t('form.productDetailsDeleteShopVariantTitle')}
              content={
                <Typography variant="body2">
                  {t('form.productDetailsDeleteShopVariantBody', { id: deleteShopVariantId ?? '' })}
                </Typography>
              }
              actions={
                <>
                  <Button variant="outlined" onClick={() => setDeleteShopVariantId(null)}>
                    {t('cancel')}
                  </Button>
                  <Button variant="contained" onClick={handleDeleteShopVariant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t('delete')}
                  </Button>
                </>
              }
            />

            {/* Category Details */}
            {product.category_details?.length > 0 && (
              <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
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
              <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:notes-bold" width={20} />
                  {t('form.productDetailsExtraDetailsSection')}
                </Typography>
                <Box className="space-y-3">
                  {product.extra_details.map((ed: any) => (
                    <Box key={ed.id} className="rounded-lg border border-border/40 bg-muted/20 p-3">
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
                        {ed.price != null ? (
                          <Box>
                            <Typography variant="caption" className="text-muted-foreground">
                              {t('form.productDetailsExtraPrice')}
                            </Typography>
                            <Typography variant="body2">{t('currencySyrianPound')} {ed.price}</Typography>
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
              <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
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
        </Box>
      </Box>
  );
}
