import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';

import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchProductById } from '@/pages/dashboard/products/hooks/product';

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

export default function DetailsPage() {
  const { t, i18n } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: productResponse, isLoading, error } = useFetchProductById(id || '');

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
  const yes = t('form.productDetailsYes');
  const no = t('form.productDetailsNo');

  return (
    <>
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
                <DetailRow
                  label={t('form.brand')}
                  value={product.brand?.name ?? '—'}
                  emptyLabel={na}
                />
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
                <DetailRow
                  label={t('form.productDetailsVisibleCustomers')}
                  value={
                    product.is_visible === false || product.is_visible === 0 ? no : yes
                  }
                  emptyLabel={na}
                />
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
                <DetailRow label={t('columns.sku')} value={product.sku} emptyLabel={na} />
                <DetailRow label={t('form.model')} value={product.model} emptyLabel={na} />
                <DetailRow label={t('form.barcode')} value={product.barcode} emptyLabel={na} />
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
                <DetailRow label={t('columns.price')} value={`$${product.price}`} emptyLabel={na} />
                <DetailRow
                  label={t('columns.priceAfterDiscount')}
                  value={
                    product.price_after_discount != null
                      ? `$${product.price_after_discount}`
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
                  value={product.cost_price != null ? `$${product.cost_price}` : '—'}
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
                      <Typography variant="subtitle2" className="font-medium">
                        {t('form.productDetailsVariantHeader', {
                          n: i + 1,
                          id: variant.id,
                        })}
                      </Typography>

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
                                  <span>${shop.price}</span>
                                  <span>×{shop.quantity}</span>
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
                        <span><span className="text-muted-foreground">EN: </span>{cd.value?.en}</span>
                        <span><span className="text-muted-foreground">AR: </span>{cd.value?.ar}</span>
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
                            <Typography variant="body2">${ed.price}</Typography>
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
    </>
  );
}
