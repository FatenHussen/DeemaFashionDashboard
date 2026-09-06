import type { MultiSelectOption } from '@/shared/ui/multi-select';
import type { ProductData } from '@/pages/dashboard/products/types/product.types';
import type { CouponDetailsData } from '@/pages/dashboard/coupons/types/coupon.types';

import { toast } from 'react-toastify';
import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRoutes, axiosInstance } from '@/api';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { useFetchVendors } from '@/pages/dashboard/vendor/hooks/vendor';
import { _CityApi } from '@/pages/dashboard/locations/api/city.services';
import { useFetchProducts } from '@/pages/dashboard/products/hooks/product';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import { _GovernorateApi } from '@/pages/dashboard/locations/api/governorate.services';
import {
  useCreateCoupon,
  useUpdateCoupon,
  useFetchCouponById,
} from '@/pages/dashboard/coupons/hooks/coupon';
import {
  type CouponScope,
  CouponCreateSchema,
  CouponUpdateSchema,
  type CouponFormValues,
  couponLocalDateTimeToISO,
} from '@/pages/dashboard/coupons/validation/coupon.validation';

import { CONFIG } from 'src/global-config';
import { Box, Button, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const governorateFetcher = (page: number, limit: number) =>
  _GovernorateApi.getListGovernorates({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((gov) => ({ id: gov.id, label: gov.name })),
      pagination: r.data.pagination,
    },
  }));

const cityFetcher = (page: number, limit: number) =>
  _CityApi.getListCities({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((city) => ({
        id: city.id,
        label: formatTranslated(city.name as Parameters<typeof formatTranslated>[0]),
      })),
      pagination: r.data.pagination,
    },
  }));

function resolveProductListImageUrl(img: string | null | undefined): string | null {
  if (img == null || String(img).trim() === '') return null;
  const s = String(img).trim();
  return s.startsWith('http') ? s : `${CONFIG.serverUrl}/${s.replace(/^\//, '')}`;
}

// ----------------------------------------------------------------------

function toISODateTimeLocal(d: string): string {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/** Uppercase alphanumeric, excludes ambiguous 0/O and 1/I. */
function generateCouponCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[bytes[i]! % chars.length];
  }
  return out;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const marketersFetcher = async () => {
    const response = await axiosInstance.get<{
      status: boolean;
      data: { id: number; label: string }[];
    }>(apiRoutes.user.marketers);
    const items = (response.data?.data ?? []).map((m) => ({
      id: m.id,
      label: m.label,
    }));
    return {
      data: {
        items: [{ id: 0, label: t('form.marketerNoneOption') }, ...items],
        pagination: { current_page: 1, last_page: 1, per_page: items.length + 1, total: items.length + 1 },
      },
    };
  };
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const couponFromState = location.state?.coupon as CouponDetailsData | undefined;
  const isEditMode = !!id;

  const { data: productsResponse } = useFetchProducts({ page: 1, limit: 200 });
  const { data: vendorsResponse } = useFetchVendors(1, 200);
  const { data: shopsResponse } = useFetchShops(1, 200);
  const { data: couponResponse, isLoading: isLoadingCoupon } = useFetchCouponById(id || '');
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();

  const loadedCoupon = isEditMode ? couponResponse?.data ?? couponFromState : undefined;

  const productOptions: MultiSelectOption[] = useMemo(() => {
    const raw = productsResponse?.data as
      | { items?: ProductData[]; data?: ProductData[] }
      | undefined;
    const list = raw?.items ?? raw?.data ?? [];
    const byId = new Map<number, MultiSelectOption>();

    for (const p of list) {
      const img = p.thumbnail ?? p.image ?? (p.images?.[0] != null ? String(p.images[0]) : null);
      byId.set(p.id, {
        value: p.id,
        label:
          formatTranslated(p.name as Parameters<typeof formatTranslated>[0]) ||
          t('form.productFallbackLabel', { id: p.id }),
        imageUrl: resolveProductListImageUrl(img),
      });
    }

    const embedded = loadedCoupon?.products;
    if (embedded?.length) {
      for (const p of embedded) {
        const row = p as {
          id: number;
          name: unknown;
          image?: string | null;
          thumbnail?: string | null;
        };
        if (byId.has(row.id)) continue;
        const img = row.thumbnail ?? row.image ?? null;
        byId.set(row.id, {
          value: row.id,
          label:
            formatTranslated(row.name as Parameters<typeof formatTranslated>[0]) ||
            t('form.productFallbackLabel', { id: row.id }),
          imageUrl: resolveProductListImageUrl(img),
        });
      }
    }

    return Array.from(byId.values());
  }, [productsResponse?.data, t, loadedCoupon]);

  const vendors =
    (vendorsResponse?.data as { items?: { id: number; name: unknown }[] } | undefined)?.items ??
    (vendorsResponse?.data as { data?: { id: number; name: unknown }[] } | undefined)?.data ??
    [];
  const shops =
    (shopsResponse?.data as { items?: { id: number; name: unknown }[] } | undefined)?.items ?? [];

  const vendorOptions: MultiSelectOption[] = useMemo(
    () =>
      vendors.map((v: { id: number; name: unknown }) => ({
        value: v.id,
        label:
          formatTranslated(v.name as Parameters<typeof formatTranslated>[0]) ||
          t('form.vendorFallbackLabel', { id: v.id }),
      })),
    [vendors, t]
  );

  const shopOptions: MultiSelectOption[] = useMemo(
    () =>
      shops.map((s: { id: number; name: unknown }) => ({
        value: s.id,
        label:
          formatTranslated(s.name as Parameters<typeof formatTranslated>[0]) ||
          t('form.shopFallbackLabel', { id: s.id }),
      })),
    [shops, t]
  );

  const defaultValues: CouponFormValues = {
    name: { en: '', ar: '' },
    code: '',
    affiliate_id: undefined,
    discount_type: 'percentage',
    discount_value: '',
    start_at: '',
    end_at: '',
    max_uses: 1,
    is_active: true,
    coupon_types: ['general'],
    governorate_id: null,
    city_id: null,
    product_ids: [],
    vendor_ids: [],
    shop_ids: [],
  };

  const couponSchema = useMemo(
    () => (isEditMode ? CouponUpdateSchema : CouponCreateSchema),
    [isEditMode]
  );

  const methods = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const couponTypes = watch('coupon_types') ?? [];
  const couponTypesError = methods.formState.errors.coupon_types?.message as string | undefined;
  const affiliateId = watch('affiliate_id');
  const hasAffiliateId = !!affiliateId && affiliateId > 0;
  const isScopeProduct = couponTypes.includes('product');
  const isScopeVendor = couponTypes.includes('vendor');
  const isScopeShop = couponTypes.includes('shop');

  // Determine coupon scopes from API response (supports multiple)
  const inferCouponTypes = (data: CouponDetailsData): Array<'general' | 'product' | 'vendor' | 'shop'> => {
    const types: Array<'general' | 'product' | 'vendor' | 'shop'> = [];
    if (data.products && data.products.length > 0) types.push('product');
    if (data.vendors && data.vendors.length > 0) types.push('vendor');
    if (data.shops && data.shops.length > 0) types.push('shop');
    return types.length ? types : ['general'];
  };

  useEffect(() => {
    const source = isEditMode ? (couponResponse?.data ?? couponFromState) : null;
    if (source) {
      const types = inferCouponTypes(source);
      const discount = source.discount;
      reset({
        name:
          typeof source.name === 'object' && source.name !== null
            ? (source.name as { en: string; ar: string })
            : { en: source.name || '', ar: source.name || '' },
        code: source.code || '',
        affiliate_id: (source as any).affiliate_id ?? undefined,
        discount_type: (discount?.type as 'percentage' | 'fixed') || 'percentage',
        discount_value: discount?.value?.toString() || '',
        start_at: source.start_at ? toISODateTimeLocal(source.start_at) : '',
        end_at: source.end_at ? toISODateTimeLocal(source.end_at) : '',
        max_uses: Math.max(1, source.max_uses ?? 1),
        is_active: Boolean(source.is_active),
        coupon_types: types,
        governorate_id: source.governorate_id ?? null,
        city_id: source.city_id ?? null,
        product_ids: source.products?.map((p) => p.id) || [],
        vendor_ids: source.vendors?.map((v) => v.id) || [],
        shop_ids: source.shops?.map((s) => s.id) || [],
      });
    }
  }, [couponResponse?.data, couponFromState, isEditMode, reset]);

  const isSubmitting = createCouponMutation.isPending || updateCouponMutation.isPending;
  const errorMessage =
    createCouponMutation.error?.message || updateCouponMutation.error?.message || null;

  const onSubmit = async (data: CouponFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        code: data.code,
        ...(data.affiliate_id && data.affiliate_id > 0 && { affiliate_id: data.affiliate_id }),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        start_at: couponLocalDateTimeToISO(data.start_at),
        end_at: couponLocalDateTimeToISO(data.end_at),
        max_uses: data.max_uses,
        is_active: data.is_active,
        governorate_id: data.governorate_id || null,
        city_id: data.city_id || null,
      };

      const types = data.coupon_types ?? [];

      if (types.includes('product') && data.product_ids?.length) {
        payload.products = data.product_ids.map((pid) => ({ id: pid }));
      }
      if (types.includes('vendor') && data.vendor_ids?.length) {
        payload.vendors = data.vendor_ids.map((vid) => ({ id: vid }));
      }
      if (types.includes('shop') && data.shop_ids?.length) {
        payload.shops = data.shop_ids.map((sid) => ({ id: sid }));
      }

      if (isEditMode && id) {
        await updateCouponMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.couponUpdatedSuccess'));
        navigate('/coupons');
      } else {
        await createCouponMutation.mutateAsync(payload);
        toast.success(t('form.couponCreatedSuccess'));
        navigate('/coupons');
      }
    } catch (error: any) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleCancel = () => {
    navigate('/coupons');
  };

  if (isEditMode && isLoadingCoupon && !couponFromState) {
    return <LoadingScreen />;
  }

  return (
    <>
      <title>
        {isEditMode
          ? t('form.couponEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.couponCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editCoupon') : t('form.createCoupon')}
        description={isEditMode ? t('form.editCouponDesc') : t('form.createCouponDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingCoupon}
        loadingText={t('form.loadingCoupon')}
        submitLabel={isEditMode ? t('form.updateCouponSubmit') : t('form.createCouponSubmit')}
        submittingLabel={isEditMode ? t('form.updatingCouponSubmit') : t('form.creatingCouponSubmit')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:ticket-sale-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.couponNameEn')} / {t('form.couponNameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.couponNameEn')}</Typography>
              <RHFTextField name="name.en" placeholder={t('form.summerSaleEn')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.couponNameAr')}</Typography>
              <RHFTextField name="name.ar" placeholder={t('form.summerSaleAr')} dir="rtl" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Code & Discount ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:tag-price-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.couponDiscountCodeLabel')} & {t('form.discountType')}
            </Typography>
          </Box>
          <Box className="p-6 flex flex-col gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.couponDiscountCodeLabel')}</Typography>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <RHFTextField name="code" placeholder={t('form.couponCodePlaceholder')} className="flex-1 min-w-0" fullWidth />
                <Button type="button" variant="outlined" color="primary" size="medium" className="shrink-0 w-full sm:w-auto" onClick={() => setValue('code', generateCouponCode(), { shouldValidate: true, shouldDirty: true, shouldTouch: true })}>
                  {t('form.couponCodeGenerate')}
                </Button>
              </div>
            </Box>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.discountType')}</Typography>
                <RHFSelect name="discount_type" placeholder={t('form.discountType')} options={[{ value: 'percentage', label: t('form.discountTypePercentage') }, { value: 'fixed', label: t('form.discountTypeFixed') }]} />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.discountValue')}</Typography>
                <RHFTextField name="discount_value" placeholder={watch('discount_type') === 'percentage' ? '20' : '50'} type="number" fullWidth min={0} max={watch('discount_type') === 'percentage' ? 100 : undefined} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Section: Schedule & Usage ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:calendar-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.startAt')} / {t('form.endAt')} & {t('form.maxUses')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.startAt')}</Typography>
              <RHFTextField name="start_at" type="datetime-local" fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.endAt')}</Typography>
              <RHFTextField name="end_at" type="datetime-local" fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.maxUses')}</Typography>
              <RHFTextField name="max_uses" type="number" placeholder={t('form.maxUsesPlaceholder')} fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Affiliate & Scope ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:user-id-bold" className="text-sky-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.affiliateIdOptional')} & {t('form.couponTypeLabel')}
            </Typography>
          </Box>
          <Box className="p-6 flex flex-col gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.affiliateIdOptional')}</Typography>
              <RHFInfiniteSelect
                name="affiliate_id"
                queryKey={['marketers', 'list']}
                fetcher={() => marketersFetcher()}
                placeholder={t('form.leaveEmptyNonAffiliate')}
                helperText={hasAffiliateId ? t('form.couponAffiliateScopeHelper') : undefined}
                onValueChange={(val) => {
                  if (val === 0) { methods.setValue('affiliate_id', undefined as any); }
                  else if (val > 0) { methods.setValue('coupon_types', ['general']); methods.setValue('product_ids', []); methods.setValue('vendor_ids', []); methods.setValue('shop_ids', []); }
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.couponTypeLabel')}</Typography>
              <Controller
                name="coupon_types"
                control={control}
                render={({ field }) => {
                  const value: CouponScope[] = (field.value as CouponScope[] | undefined) ?? [];
                  const disabled = hasAffiliateId;
                  const toggle = (opt: CouponScope) => {
                    if (disabled) return;
                    let next: CouponScope[];
                    if (value.includes(opt)) {
                      next = value.filter((v) => v !== opt);
                    } else if (opt === 'general') {
                      next = ['general'];
                    } else {
                      next = [...value.filter((v) => v !== 'general'), opt];
                    }
                    if (next.length === 0) next = ['general'];
                    if (!next.includes('product')) methods.setValue('product_ids', []);
                    if (!next.includes('vendor')) methods.setValue('vendor_ids', []);
                    if (!next.includes('shop')) methods.setValue('shop_ids', []);
                    field.onChange(next);
                  };
                  const options: { value: CouponScope; label: string }[] = [
                    { value: 'general', label: t('form.couponTypeGeneral') },
                    { value: 'product', label: t('form.couponTypeProducts') },
                    { value: 'vendor', label: t('form.couponTypeVendors') },
                    { value: 'shop', label: t('form.couponTypeShops') },
                  ];
                  return (
                    <Box>
                      <div className="flex flex-wrap gap-2">
                        {options.map((opt) => {
                          const isChecked = value.includes(opt.value);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => toggle(opt.value)}
                              disabled={disabled}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                                disabled
                                  ? 'cursor-not-allowed opacity-60 border-border/60 bg-background/40'
                                  : isChecked
                                    ? 'border-primary bg-primary/10 text-foreground'
                                    : 'border-border/60 bg-background/60 hover:border-primary/50 hover:bg-primary/[0.04]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                readOnly
                                checked={isChecked}
                                disabled={disabled}
                                className="accent-primary pointer-events-none disabled:cursor-not-allowed"
                              />
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <Typography variant="caption" className="mt-2 block text-muted-foreground">
                        {t('form.couponTypeMultipleHelper')}
                      </Typography>
                      {couponTypesError && (
                        <Typography variant="caption" className="mt-1 block text-destructive">
                          {couponTypesError}
                        </Typography>
                      )}
                    </Box>
                  );
                }}
              />
            </Box>
            {isScopeProduct && (
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:cart-large-2-bold" className="text-sky-500" width={16} />{t('form.couponTypeProducts')}</Typography>
                <RHFMultiSelect
                  name="product_ids"
                  options={productOptions}
                  label={t('form.selectProducts')}
                  placeholder={hasAffiliateId ? t('form.couponManagedByAffiliate') : t('form.couponSearchSelectProducts')}
                  fullWidth
                  isDisabled={hasAffiliateId}
                  showOptionImages
                />
              </Box>
            )}
            {isScopeVendor && (
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:users-group-rounded-bold" className="text-sky-500" width={16} />{t('form.couponTypeVendors')}</Typography>
                <RHFMultiSelect name="vendor_ids" options={vendorOptions} label={t('form.selectVendors')} placeholder={hasAffiliateId ? t('form.couponManagedByAffiliate') : t('form.couponSearchSelectVendors')} fullWidth isDisabled={hasAffiliateId} />
              </Box>
            )}
            {isScopeShop && (
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:shop-bold" className="text-sky-500" width={16} />{t('form.couponTypeShops')}</Typography>
                <RHFMultiSelect name="shop_ids" options={shopOptions} label={t('form.selectShops')} placeholder={hasAffiliateId ? t('form.couponManagedByAffiliate') : t('form.couponSearchSelectShops')} fullWidth isDisabled={hasAffiliateId} />
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Section: Location & Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:map-point-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.governorate')} / {t('form.city')} & {t('active')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:map-point-bold" className="text-emerald-500" width={16} />{t('form.governorate')}</Typography>
              <RHFInfiniteSelect name="governorate_id" queryKey={['governorates', 'infinite', 'coupon-form']} fetcher={governorateFetcher} placeholder={t('form.selectGovernorate')} helperText={t('form.couponLocationGovernorateHelper')} onValueChange={() => setValue('city_id', null)} />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:city-bold" className="text-emerald-500" width={16} />{t('form.city')}</Typography>
              <RHFInfiniteSelect name="city_id" queryKey={['cities', 'infinite', 'coupon-form']} fetcher={cityFetcher} placeholder={t('form.selectCity')} helperText={t('form.couponLocationCityHelper')} />
            </Box>
            <Box className="md:col-span-2">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 transition-colors">
                    <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
                    <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
                  </div>
                )}
              />
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
