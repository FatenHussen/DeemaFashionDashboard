import type { MultiSelectOption } from '@/shared/ui/multi-select';
import type { ProductData } from '@/pages/dashboard/products/types/product.types';
import type { ShopVendorServiceData } from '@/pages/dashboard/shop-vendor-services/types';
import type {
  DiscountType,
  PromotionPosition,
} from '@/pages/dashboard/promotions/types/promotion.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useRef, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { useFetchRecipes } from '@/pages/dashboard/recipes/hooks/recipe';
import { useFetchProducts } from '@/pages/dashboard/products/hooks/product';
import { useFetchPages } from '@/pages/dashboard/sections/hooks/usePageSections';
import { useFetchShopVendorServices } from '@/pages/dashboard/shop-vendor-services/hooks';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';
import {
  PromotionSchema,
  type PromotionFormValues,
} from '@/pages/dashboard/promotions/validation/promotion.validation';
import {
  useCreatePromotion,
  useUpdatePromotion,
  useFetchPromotionById,
} from '@/pages/dashboard/promotions/hooks/promotion';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === 'string' && v.trim() !== '') {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x));
    } catch {
      /* comma-separated fallback */
    }
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Map API variants to form values so the select shows the current type on edit. */
function normalizePromotionPosition(raw: unknown): PromotionPosition {
  if (raw === 'top' || raw === 'bottom') return raw;
  const s = String(raw ?? '').toLowerCase().trim();
  if (s === 'top' || s === 'bottom') return s;
  return 'top';
}

function normalizePromotionDiscountType(raw: unknown): DiscountType | null {
  if (raw == null || raw === '') return null;
  const s = String(raw).toLowerCase().trim().replace(/-/g, '_');
  if (s === 'percentage' || s === 'percent' || s === 'pct') return 'percentage';
  if (s === 'fixed' || s === 'amount' || s === 'fixed_amount') return 'fixed';
  return null;
}

function shopVendorServiceSelectLabel(
  item: ShopVendorServiceData,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const shopName = item.shop
    ? formatTranslated(item.shop.name as Parameters<typeof formatTranslated>[0])
    : t('form.shopFallbackLabel', { id: item.shop_id });
  const serviceName = item.vendor_service
    ? formatTranslated(item.vendor_service.name as Parameters<typeof formatTranslated>[0])
    : t('form.shopVendorServiceFallbackLabel', { id: item.vendor_service_id });
  return `${shopName} — ${serviceName}`;
}

function parseShopVendorServiceIds(raw: {
  shop_vendor_service_ids?: unknown;
  shop_vendor_service_id?: unknown;
}): number[] {
  const fromArray = parseIdArray(raw.shop_vendor_service_ids);
  if (fromArray.length) return fromArray;
  const single = raw.shop_vendor_service_id;
  if (single == null || single === '') return [];
  const n = Number(single);
  return Number.isFinite(n) && n > 0 ? [n] : [];
}

function parseIdArray(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((entry) => {
      if (typeof entry === 'number') return entry;
      const parsed = Number(entry);
      return Number.isFinite(parsed) ? parsed : NaN;
    })
    .filter((id): id is number => Number.isInteger(id) && id > 0);
}

export default function CreatePage() {
  const { t } = useTranslation('table');

  const PROMOTION_TYPES = [
    { value: 'simple_discount', label: t('promotionTypes.simpleDiscount') },
    { value: 'spend_x_discount', label: t('promotionTypes.spendXDiscount') },
    { value: 'spend_x_get_gift', label: t('promotionTypes.spendXGetGift') },
    { value: 'spend_x_get_points', label: t('promotionTypes.spendXGetPoints') },
    { value: 'free_shipping', label: t('promotionTypes.freeShipping') },
    { value: 'spend_x_get_free_shipping', label: t('promotionTypes.spendXGetFreeShipping') },
  ];

  const DISCOUNT_TYPES = [
    { value: 'percentage', label: t('promotionTypes.percentage') },
    { value: 'fixed', label: t('promotionTypes.fixedAmount') },
  ];
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchPromotionById(id || '');
  const { data: pagesResponse, isLoading: isLoadingPages } = useFetchPages();
  const { data: productsResponse, isLoading: isLoadingProducts } = useFetchProducts({ page: 1, limit: 500 });
  const { data: shopsResponse, isLoading: isLoadingShops } = useFetchShops(1, 500, {
    is_restaurant: 0,
  });
  const { data: restaurantsResponse, isLoading: isLoadingRestaurants } = useFetchShops(1, 500, {
    is_restaurant: 1,
  });
  const { data: recipesResponse, isLoading: isLoadingRecipes } = useFetchRecipes(1, 500);
  const { data: shopVendorServicesResponse, isLoading: isLoadingShopVendorServices } =
    useFetchShopVendorServices(1, 500);
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();

  const pageOptions = useMemo(() => {
    const items = pagesResponse?.data ?? [];
    return items
      .filter((p) => typeof p?.slug === 'string' && p.slug.trim() !== '')
      .map((p) => ({ value: p.slug, label: cmsPageSelectLabel(p) }));
  }, [pagesResponse]);

  const pageSlugsOptions = useMemo(() => {
    const known = new Set(pageOptions.map((o) => String(o.value)));
    const extra: { value: string; label: string }[] = [];
    if (isEditMode && detailsResponse?.data) {
      const raw = detailsResponse.data as { page_slugs?: unknown; pageSlugs?: unknown };
      for (const s of toStringArray(raw.page_slugs ?? raw.pageSlugs)) {
        if (s && !known.has(s)) {
          known.add(s);
          extra.push({ value: s, label: s });
        }
      }
    }
    return extra.length ? [...pageOptions, ...extra] : pageOptions;
  }, [pageOptions, isEditMode, detailsResponse?.data]);

  const productOptions: MultiSelectOption[] = useMemo(() => {
    const raw = productsResponse?.data as
      | { items?: ProductData[]; data?: ProductData[] }
      | undefined;
    const products = raw?.items ?? raw?.data ?? [];
    const byId = new Map<number, MultiSelectOption>();
    for (const p of products) {
      byId.set(p.id, {
        value: p.id,
        label:
          formatTranslated(p.name as Parameters<typeof formatTranslated>[0]) ||
          `#${p.id}`,
      });
    }
    if (isEditMode && detailsResponse?.data) {
      for (const pid of detailsResponse.data.gift_product_ids ?? []) {
        if (!byId.has(pid)) {
          byId.set(pid, { value: pid, label: `#${pid}` });
        }
      }
    }
    return Array.from(byId.values());
  }, [productsResponse?.data, isEditMode, detailsResponse?.data]);

  const shopOptions: MultiSelectOption[] = useMemo(() => {
    const items =
      (shopsResponse?.data as { items?: { id: number; name: unknown }[] } | undefined)?.items ?? [];
    const byId = new Map<number, MultiSelectOption>();
    for (const shop of items) {
      byId.set(shop.id, {
        value: shop.id,
        label:
          formatTranslated(shop.name as Parameters<typeof formatTranslated>[0]) ||
          t('form.shopFallbackLabel', { id: shop.id }),
      });
    }

    if (isEditMode && detailsResponse?.data) {
      for (const sid of parseIdArray((detailsResponse.data as { shop_ids?: unknown }).shop_ids)) {
        if (!byId.has(sid)) byId.set(sid, { value: sid, label: t('form.shopFallbackLabel', { id: sid }) });
      }
    }

    return Array.from(byId.values());
  }, [shopsResponse?.data, isEditMode, detailsResponse?.data, t]);

  const restaurantOptions: MultiSelectOption[] = useMemo(() => {
    const items =
      (restaurantsResponse?.data as { items?: { id: number; name: unknown }[] } | undefined)
        ?.items ?? [];
    const byId = new Map<number, MultiSelectOption>();
    for (const restaurant of items) {
      byId.set(restaurant.id, {
        value: restaurant.id,
        label:
          formatTranslated(restaurant.name as Parameters<typeof formatTranslated>[0]) ||
          t('form.shopFallbackLabel', { id: restaurant.id }),
      });
    }

    if (isEditMode && detailsResponse?.data) {
      for (const rid of parseIdArray(
        (detailsResponse.data as { restaurant_ids?: unknown }).restaurant_ids
      )) {
        if (!byId.has(rid)) byId.set(rid, { value: rid, label: t('form.shopFallbackLabel', { id: rid }) });
      }
    }

    return Array.from(byId.values());
  }, [restaurantsResponse?.data, isEditMode, detailsResponse?.data, t]);

  const recipeOptions: MultiSelectOption[] = useMemo(() => {
    const items = recipesResponse?.data?.items ?? [];
    const byId = new Map<number, MultiSelectOption>();
    for (const recipe of items) {
      byId.set(recipe.id, {
        value: recipe.id,
        label:
          (typeof recipe.name === 'string'
            ? recipe.name
            : formatTranslated(recipe.name as Parameters<typeof formatTranslated>[0])) ||
          t('form.popupCampaignRecipeFallback', { id: recipe.id }),
      });
    }

    if (isEditMode && detailsResponse?.data) {
      for (const rid of parseIdArray((detailsResponse.data as { recipe_ids?: unknown }).recipe_ids)) {
        if (!byId.has(rid)) {
          byId.set(rid, { value: rid, label: t('form.popupCampaignRecipeFallback', { id: rid }) });
        }
      }
    }

    return Array.from(byId.values());
  }, [recipesResponse?.data, isEditMode, detailsResponse?.data, t]);

  const shopVendorServiceOptions: MultiSelectOption[] = useMemo(() => {
    const items = shopVendorServicesResponse?.data?.items ?? [];
    const byId = new Map<number, MultiSelectOption>();
    for (const item of items) {
      byId.set(item.id, {
        value: item.id,
        label: shopVendorServiceSelectLabel(item, t),
      });
    }
    if (isEditMode && detailsResponse?.data) {
      const extraIds = parseShopVendorServiceIds({
        shop_vendor_service_ids: detailsResponse.data.shop_vendor_service_ids,
        shop_vendor_service_id: (detailsResponse.data as { shop_vendor_service_id?: unknown })
          .shop_vendor_service_id,
      });
      for (const serviceId of extraIds) {
        if (!byId.has(serviceId)) {
          byId.set(serviceId, {
            value: serviceId,
            label: t('form.shopVendorServiceFallbackLabel', { id: serviceId }),
          });
        }
      }
    }
    return Array.from(byId.values());
  }, [shopVendorServicesResponse?.data?.items, isEditMode, detailsResponse?.data, t]);

  /** Server value for discount_type on edit (API may not accept changing it; also safe if disabled fields are omitted). */
  const originalDiscountTypeRef = useRef<DiscountType | null>(null);

  const defaultValues: PromotionFormValues = {
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    type: 'simple_discount',
    is_active: true,
    starts_at: '',
    ends_at: '',
    min_spend: null,
    buy_quantity: null,
    get_quantity: null,
    discount_value: null,
    discount_type: null,
    gift_product_ids: [],
    product_ids: [],
    shop_ids: [],
    restaurant_ids: [],
    recipe_ids: [],
    shop_vendor_service_ids: [],
    page_slugs: [],
    position: 'top',
  };

  const methods = useForm<PromotionFormValues>({
    resolver: zodResolver(PromotionSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, watch, control } = methods;
  const selectedType = watch('type');
  const promotionDiscountType = watch('discount_type');

  useEffect(() => {
    if (isEditMode && detailsResponse?.data) {
      const item = detailsResponse.data;
      const discountType = normalizePromotionDiscountType(item.discount_type);
      originalDiscountTypeRef.current = discountType;
      const rawItem = item as typeof item & { page_slugs?: unknown; pageSlugs?: unknown };
      reset({
        name: { en: item.name?.en ?? '', ar: item.name?.ar ?? '' },
        description: { en: item.description?.en ?? '', ar: item.description?.ar ?? '' },
        type: item.type,
        is_active: item.is_active,
        starts_at: item.starts_at?.substring(0, 10) ?? '',
        ends_at: item.ends_at?.substring(0, 10) ?? '',
        min_spend: item.min_spend ?? null,
        buy_quantity: item.buy_quantity ?? null,
        get_quantity: item.get_quantity ?? null,
        discount_value: item.discount_value ?? null,
        discount_type: discountType,
        gift_product_ids: item.gift_product_ids ?? [],
        product_ids: item.product_ids ?? [],
        shop_ids: item.shop_ids ?? [],
        restaurant_ids: item.restaurant_ids ?? [],
        recipe_ids: item.recipe_ids ?? [],
        shop_vendor_service_ids: parseShopVendorServiceIds({
          shop_vendor_service_ids: item.shop_vendor_service_ids,
          shop_vendor_service_id: (item as { shop_vendor_service_id?: unknown }).shop_vendor_service_id,
        }),
        page_slugs: toStringArray(rawItem.page_slugs ?? rawItem.pageSlugs),
        position: normalizePromotionPosition(item.position),
      });
    }
  }, [detailsResponse?.data, isEditMode, reset]);

  const onSubmit = async (data: PromotionFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        description: data.description,
        type: data.type,
        is_active: data.is_active,
      };
      if (data.starts_at) payload.starts_at = data.starts_at;
      if (data.ends_at) payload.ends_at = data.ends_at;

      const usesDiscount = data.type === 'simple_discount' || data.type === 'spend_x_discount';
      const usesMinSpend =
        data.type === 'spend_x_discount' ||
        data.type === 'spend_x_get_gift' ||
        data.type === 'spend_x_get_points' ||
        data.type === 'spend_x_get_free_shipping';

      if (usesDiscount && data.discount_value != null) payload.discount_value = data.discount_value;
      if (data.type === 'spend_x_get_points' && data.discount_value != null)
        payload.discount_value = data.discount_value;

      if (usesDiscount) {
        const discountTypeForPayload =
          isEditMode
            ? data.discount_type ?? originalDiscountTypeRef.current
            : data.discount_type;
        if (discountTypeForPayload) payload.discount_type = discountTypeForPayload;
      }

      if (usesMinSpend && data.min_spend != null) payload.min_spend = data.min_spend;

      if (data.type === 'spend_x_get_gift') {
        payload.gift_product_ids = data.gift_product_ids ?? [];
      }
      payload.product_ids = data.product_ids ?? [];
      payload.shop_ids = data.shop_ids ?? [];
      payload.restaurant_ids = data.restaurant_ids ?? [];
      payload.recipe_ids = data.recipe_ids ?? [];
      payload.shop_vendor_service_ids = data.shop_vendor_service_ids ?? [];

      if (data.buy_quantity != null) payload.buy_quantity = data.buy_quantity;
      if (data.get_quantity != null) payload.get_quantity = data.get_quantity;
      payload.page_slugs = data.page_slugs ?? [];
      payload.position = data.position ?? 'top';

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.promotionUpdatedSuccess'));
        navigate('/promotions');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.promotionCreatedSuccess'));
        navigate('/promotions');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isEditMode && isLoadingDetails) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.promotionEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.promotionCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/promotions')}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        title={isEditMode ? t('form.editPromotion') : t('form.createPromotion')}
        description={isEditMode ? t('form.editPromotionDesc') : t('form.createPromotionDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingPromotion')}
        submitLabel={isEditMode ? t('form.updatePromotionSubmit') : t('form.createPromotionSubmit')}
        submittingLabel={isEditMode ? t('form.updatingPromotionSubmit') : t('form.creatingPromotionSubmit')}
      >
        {/* ── Section: Names & Descriptions ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:letter-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameEn')}</Typography>
              <RHFTextField name="name.en" placeholder={t('form.promotionNameEnPlaceholder')} helperText={t('form.promotionNameEnHelper')} />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameAr')}</Typography>
              <RHFTextField name="name.ar" placeholder={t('form.promotionNameArPlaceholder')} dir="rtl" />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.descriptionEn')}</Typography>
              <RHFTextField name="description.en" placeholder={t('form.promotionDescEnPlaceholder')} />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.descriptionAr')}</Typography>
              <RHFTextField name="description.ar" placeholder={t('form.promotionDescArPlaceholder')} dir="rtl" />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Promotion Type ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:tag-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.promotionType')}
            </Typography>
          </Box>
          <Box className="p-6 flex flex-col gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.promotionType')}</Typography>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                    {PROMOTION_TYPES.map((pt) => (
                      <option key={pt.value} value={pt.value}>{pt.label}</option>
                    ))}
                  </select>
                )}
              />
            </Box>

            {/* Discount fields — simple_discount & spend_x_discount */}
            {(selectedType === 'simple_discount' || selectedType === 'spend_x_discount') && (
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:percent-bold" className="text-violet-500" width={16} />{t('form.discountValueLabel')}</Typography>
                  <RHFTextField name="discount_value" type="number" placeholder={t('form.discountValuePlaceholder')} helperText={t('form.discountValueHelper')} min={0} max={promotionDiscountType === 'percentage' ? 100 : undefined} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:tag-price-bold" className="text-violet-500" width={16} />{t('form.discountTypeLabel')}</Typography>
                  {isEditMode && <Typography variant="caption" className="text-muted-foreground block mb-2">{t('form.discountTypeLockedOnEdit')}</Typography>}
                  <Controller
                    name="discount_type"
                    control={control}
                    render={({ field }) => (
                      <select {...field} value={field.value ?? ''} disabled={isEditMode} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed">
                        <option value="">{t('form.selectDiscountType')}</option>
                        {DISCOUNT_TYPES.map((dt) => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                      </select>
                    )}
                  />
                </Box>
              </Box>
            )}

            {/* Min spend — spend_x_discount, spend_x_get_gift, spend_x_get_points, spend_x_get_free_shipping */}
            {(selectedType === 'spend_x_discount' ||
              selectedType === 'spend_x_get_gift' ||
              selectedType === 'spend_x_get_points' ||
              selectedType === 'spend_x_get_free_shipping') && (
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:cart-bold" className="text-violet-500" width={16} />{t('form.minSpendLabel')}</Typography>
                <RHFTextField name="min_spend" type="number" placeholder={t('form.minSpendPlaceholder')} helperText={t('form.minSpendHelper')} />
              </Box>
            )}

            {/* Points amount — spend_x_get_points */}
            {selectedType === 'spend_x_get_points' && (
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:star-bold" className="text-violet-500" width={16} />{t('form.pointsAmountLabel')}</Typography>
                <RHFTextField name="discount_value" type="number" placeholder={t('form.pointsAmountPlaceholder')} helperText={t('form.pointsAmountHelper')} min={0} />
              </Box>
            )}

            {/* Gift products — spend_x_get_gift */}
            {selectedType === 'spend_x_get_gift' && (
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:gift-bold" className="text-violet-500" width={16} />{t('form.giftProductsLabel')}</Typography>
                <RHFMultiSelect
                  name="gift_product_ids"
                  options={productOptions}
                  placeholder={t('form.giftProductsPlaceholder')}
                  fullWidth
                  isSearchable
                />
                <Typography variant="caption" className="text-muted-foreground mt-1 block">
                  {t('form.giftProductsHint')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Section: Schedule ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:calendar-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.startDateOptional')} / {t('form.endDateOptional')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.startDateOptional')}</Typography>
              <RHFTextField name="starts_at" type="date" />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.endDateOptional')}</Typography>
              <RHFTextField name="ends_at" type="date" helperText={t('form.endDateHelper')} />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Page placement ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-fuchsia-500/[0.06] via-fuchsia-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:target-bold" className="text-fuchsia-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.promotionTargetSectionTitle')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.promotionTargetProducts')}
              </Typography>
              <RHFMultiSelect
                name="product_ids"
                options={productOptions}
                placeholder={
                  isLoadingProducts
                    ? t('form.popupCampaignSlugLoading')
                    : t('form.promotionTargetProductsPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingProducts}
                isSearchable
                showOptionImages
              />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.promotionTargetShops')}
              </Typography>
              <RHFMultiSelect
                name="shop_ids"
                options={shopOptions}
                placeholder={
                  isLoadingShops
                    ? t('form.popupCampaignSlugLoading')
                    : t('form.promotionTargetShopsPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingShops}
                isSearchable
              />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.promotionTargetRestaurants')}
              </Typography>
              <RHFMultiSelect
                name="restaurant_ids"
                options={restaurantOptions}
                placeholder={
                  isLoadingRestaurants
                    ? t('form.popupCampaignSlugLoading')
                    : t('form.promotionTargetRestaurantsPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingRestaurants}
                isSearchable
              />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.promotionTargetRecipes')}
              </Typography>
              <RHFMultiSelect
                name="recipe_ids"
                options={recipeOptions}
                placeholder={
                  isLoadingRecipes
                    ? t('form.popupCampaignSlugLoading')
                    : t('form.promotionTargetRecipesPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingRecipes}
                isSearchable
              />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.promotionShopVendorService')}
              </Typography>
              <RHFMultiSelect
                name="shop_vendor_service_ids"
                options={shopVendorServiceOptions}
                placeholder={
                  isLoadingShopVendorServices
                    ? t('form.popupCampaignSlugLoading')
                    : t('form.promotionShopVendorServicePlaceholder')
                }
                fullWidth
                isDisabled={isLoadingShopVendorServices}
                isSearchable
              />
            </Box>
            <Box className="group md:col-span-2">
              <Typography variant="caption" className="text-muted-foreground block">
                {t('form.promotionTargetResourcesHint')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Section: Page placement ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:map-point-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.promotionPlacementSection')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="md:col-span-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('form.promotionPageSlugs')}
              </Typography>
              <RHFMultiSelect
                name="page_slugs"
                options={pageSlugsOptions}
                placeholder={
                  isLoadingPages
                    ? t('form.promotionPageSlugsLoading')
                    : t('form.promotionPageSlugsPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingPages}
                isSearchable
              />
              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                {t('form.promotionPageSlugsHint')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('form.promotionPosition')}
              </Typography>
              <RHFSelect
                name="position"
                options={[
                  { value: 'top', label: t('form.promotionPositionTop') },
                  { value: 'bottom', label: t('form.promotionPositionBottom') },
                ]}
                placeholder={t('form.promotionPositionPlaceholder')}
              />
              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                {t('form.promotionPositionHint')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
