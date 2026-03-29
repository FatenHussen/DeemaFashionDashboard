import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchProductById } from '@/pages/dashboard/products/hooks/product';

import { toDisplayString } from 'src/utils/to-display-string';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Product Details | Dashboard - ${CONFIG.appName}` };

function productCountryOriginDisplay(product: Record<string, unknown>): React.ReactNode {
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

function productCountrySaleDisplay(product: Record<string, unknown>): React.ReactNode {
  const c = product.sale_country as { name?: unknown } | null | undefined;
  if (c && typeof c === 'object' && c.name != null) {
    return typeof c.name === 'string' ? c.name : formatTranslated(c.name as any);
  }
  return '—';
}

function boughtWithItemLabel(
  item: number | { id: number; name?: string | { en?: string; ar?: string } }
): React.ReactNode {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    if (item.name != null) {
      return typeof item.name === 'string' ? item.name : formatTranslated(item.name as any);
    }
    return `Product ID: ${item.id}`;
  }
  return `Product ID: ${item}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box className="space-y-1">
      <Typography variant="body2" className="text-muted-foreground font-medium">
        {label}
      </Typography>
      <Typography variant="body1" className="text-foreground">
        {value ?? 'N/A'}
      </Typography>
    </Box>
  );
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: productResponse, isLoading, error } = useFetchProductById(id || '');

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
              Error Loading Product
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load product information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/products/product')}>
            Back to Products
          </Button>
        </Box>
      </Box>
    );
  }

  const product = productResponse as any;

  return (
    <>
      <title>{metadata.title}</title>
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
              onClick={() => navigate('/products/product')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Products
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
                  ID: {product.id}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/products/product/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                Edit Product
              </Button>
            </Box>
          </Box>

          <Box className="space-y-4">
            {/* Basic Information */}
            <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
              <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                <Iconify icon="solar:info-circle-bold" width={20} />
                Basic Information
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailRow label={t('form.nameEn')} value={product.name?.en} />
                <DetailRow label={t('form.nameAr')} value={product.name?.ar} />
                <DetailRow label={t('columns.category')} value={formatTranslated(product.category?.name) ?? product.category_id} />
                <DetailRow label={t('form.brand')} value={product.brand?.name ?? '—'} />
                <DetailRow
                  label="Vendor"
                  value={product.vendor ? formatTranslated(product.vendor.name as any) : '—'}
                />
                <DetailRow
                  label="Approval"
                  value={product.approval_status_label ?? product.approval_status ?? '—'}
                />
                <DetailRow
                  label="Visible to customers"
                  value={product.is_visible === false || product.is_visible === 0 ? 'No' : 'Yes'}
                />
                <DetailRow label={t('form.countryOriginSelect')} value={productCountryOriginDisplay(product)} />
                <DetailRow label={t('form.countrySaleSelect')} value={productCountrySaleDisplay(product)} />
                <DetailRow label={t('columns.sku')} value={product.sku} />
                <DetailRow label={t('form.model')} value={product.model} />
                <DetailRow label={t('form.barcode')} value={product.barcode} />
                <DetailRow label={t('form.timeToPrepare')} value={product.time_prepare} />
                <DetailRow
                  label={t('form.instantDelivery')}
                  value={product.is_instant_delivery ? 'Yes' : 'No'}
                />
              </Box>
            </Box>

            {/* Pricing & Stock */}
            <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
              <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                <Iconify icon="solar:tag-price-bold" width={20} />
                Pricing & Stock
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailRow label={t('columns.price')} value={`$${product.price}`} />
                <DetailRow
                  label={t('columns.priceAfterDiscount')}
                  value={product.price_after_discount != null ? `$${product.price_after_discount}` : '—'}
                />
                <DetailRow label={t('form.quantity')} value={product.quantity} />
                <DetailRow label="Discount" value={product.discount != null ? String(product.discount) : '—'} />
                <DetailRow label="Discount type" value={String(product.discount_type ?? '—')} />
                <DetailRow
                  label="Cost price"
                  value={product.cost_price != null ? `$${product.cost_price}` : '—'}
                />
                <DetailRow label="Unit" value={product.unit ?? '—'} />
                <DetailRow label="Warranty (months)" value={product.warranty_period ?? '—'} />
              </Box>
            </Box>

            {/* Description */}
            <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
              <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                <Iconify icon="solar:document-text-bold" width={20} />
                Description
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-muted-foreground font-medium mb-1">Description (EN)</Typography>
                  <Typography variant="body1">{product.description?.en || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" className="text-muted-foreground font-medium mb-1">Description (AR)</Typography>
                  <Typography variant="body1">{product.description?.ar || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" className="text-muted-foreground font-medium mb-1">Full Description (EN)</Typography>
                  <Typography variant="body1">{product.full_description?.en || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" className="text-muted-foreground font-medium mb-1">Full Description (AR)</Typography>
                  <Typography variant="body1">{product.full_description?.ar || '—'}</Typography>
                </Box>
              </Box>
            </Box>

            {/* SEO */}
            {(product.seo_title || product.seo_description || product.seo_keywords || product.seo_image) && (
              <Box className="rounded-xl border border-border/50 shadow-sm bg-background/95 p-6">
                <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                  <Iconify icon="solar:globe-bold" width={20} />
                  SEO
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailRow label="SEO title (EN)" value={product.seo_title?.en} />
                  <DetailRow label="SEO title (AR)" value={product.seo_title?.ar} />
                  <DetailRow label="SEO description (EN)" value={product.seo_description?.en} />
                  <DetailRow label="SEO description (AR)" value={product.seo_description?.ar} />
                </Box>
                {product.seo_image ? (
                  <Box className="mt-4">
                    <Typography variant="body2" className="text-muted-foreground mb-1">SEO image</Typography>
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
                  Icons
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
                  Variants ({product.variants.length})
                </Typography>
                <Box className="space-y-4">
                  {product.variants.map((variant: any, i: number) => (
                    <Box key={variant.id ?? i} className="rounded-lg border border-border/40 p-4 space-y-3">
                      <Typography variant="subtitle2" className="font-medium">
                        Variant #{i + 1} — ID: {variant.id}
                      </Typography>

                      {/* Attributes */}
                      {variant.attributes?.length > 0 && (
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground mb-2 block">Attributes</Typography>
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
                          <Typography variant="caption" className="text-muted-foreground mb-2 block">Shop Pricing</Typography>
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
                  Category Details
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
                  Extra Details
                </Typography>
                <Box className="space-y-3">
                  {product.extra_details.map((ed: any) => (
                    <Box key={ed.id} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                      <Box className="grid grid-cols-2 gap-2 text-sm">
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground">Key (EN)</Typography>
                          <Typography variant="body2">{ed.key?.en}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground">Key (AR)</Typography>
                          <Typography variant="body2">{ed.key?.ar}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground">Value (EN)</Typography>
                          <Typography variant="body2">{ed.value?.en}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground">Value (AR)</Typography>
                          <Typography variant="body2">{ed.value?.ar}</Typography>
                        </Box>
                        {ed.price != null ? (
                          <Box>
                            <Typography variant="caption" className="text-muted-foreground">Extra price</Typography>
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
                  Bought With
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
                        {boughtWithItemLabel(item)}
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
