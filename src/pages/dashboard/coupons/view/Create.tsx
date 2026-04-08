import type { MultiSelectOption } from '@/shared/ui/multi-select';
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
import { useFetchVendors } from '@/pages/dashboard/vendor/hooks/vendor';
import { useFetchProducts } from '@/pages/dashboard/products/hooks/product';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import {
  useCreateCoupon,
  useUpdateCoupon,
  useFetchCouponById,
} from '@/pages/dashboard/coupons/hooks/coupon';
import {
  CouponCreateSchema,
  CouponUpdateSchema,
  type CouponFormValues,
  couponLocalDateTimeToISO,
} from '@/pages/dashboard/coupons/validation/coupon.validation';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

function toISODateTimeLocal(d: string): string {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
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
  const { data: couponResponse, isLoading: isLoadingCoupon } = useFetchCouponById(id || '');
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();

  const products =
    (productsResponse?.data as { items?: { id: number; name: unknown }[] } | undefined)?.items ??
    (productsResponse?.data as { data?: { id: number; name: unknown }[] } | undefined)?.data ??
    [];
  const vendors =
    (vendorsResponse?.data as { items?: { id: number; name: unknown }[] } | undefined)?.items ??
    (vendorsResponse?.data as { data?: { id: number; name: unknown }[] } | undefined)?.data ??
    [];

  const productOptions: MultiSelectOption[] = useMemo(
    () =>
      products.map((p: { id: number; name: unknown }) => ({
        value: p.id,
        label:
          formatTranslated(p.name as Parameters<typeof formatTranslated>[0]) ||
          t('form.productFallbackLabel', { id: p.id }),
      })),
    [products, t]
  );

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
    coupon_type: 'general',
    product_ids: [],
    vendor_ids: [],
  };

  const couponSchema = useMemo(
    () => (isEditMode ? CouponUpdateSchema : CouponCreateSchema),
    [isEditMode]
  );

  const methods = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const couponType = watch('coupon_type');
  const affiliateId = watch('affiliate_id');
  const hasAffiliateId = !!affiliateId && affiliateId > 0;

  const loadedAffiliateId = useMemo(() => {
    const s = couponResponse?.data ?? couponFromState;
    if (!s) return undefined;
    return (s as { affiliate_id?: number | null }).affiliate_id ?? undefined;
  }, [couponResponse?.data, couponFromState]);
  const lockAffiliateSelect =
    isEditMode && loadedAffiliateId != null && loadedAffiliateId > 0;

  // Determine coupon type from API response
  const inferCouponType = (data: CouponDetailsData): 'general' | 'product' | 'vendor' => {
    if (data.products && data.products.length > 0) return 'product';
    if (data.vendors && data.vendors.length > 0) return 'vendor';
    return 'general';
  };

  useEffect(() => {
    const source = isEditMode ? (couponResponse?.data ?? couponFromState) : null;
    if (source) {
      const type = inferCouponType(source);
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
        coupon_type: type,
        product_ids: source.products?.map((p) => p.id) || [],
        vendor_ids: source.vendors?.map((v) => v.id) || [],
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
      };

      if (data.coupon_type === 'product' && data.product_ids?.length) {
        payload.products = data.product_ids.map((pid) => ({ id: pid }));
      }
      if (data.coupon_type === 'vendor' && data.vendor_ids?.length) {
        payload.vendors = data.vendor_ids.map((vid) => ({ id: vid }));
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
        maxWidth="2xl"
        submitLabel={isEditMode ? t('form.updateCouponSubmit') : t('form.createCouponSubmit')}
        submittingLabel={isEditMode ? t('form.updatingCouponSubmit') : t('form.creatingCouponSubmit')}
      >
        {/* Affiliate ID */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:user-id-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.affiliateIdOptional')}
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="affiliate_id"
            queryKey={['marketers', 'list']}
            fetcher={() => marketersFetcher()}
            placeholder={t('form.leaveEmptyNonAffiliate')}
            helperText={hasAffiliateId ? t('form.couponAffiliateScopeHelper') : undefined}
            disabled={lockAffiliateSelect}
            onValueChange={(val) => {
              if (val === 0) {
                methods.setValue('affiliate_id', undefined as any);
              } else if (val > 0) {
                // Avoid stuck state: product/vendor type + empty scope when UI locks multi-selects.
                methods.setValue('coupon_type', 'general');
                methods.setValue('product_ids', []);
                methods.setValue('vendor_ids', []);
              }
            }}
          />
        </Box>

        {/* Coupon Type */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.couponTypeLabel')}
            </Typography>
          </Box>
          <Controller
            name="coupon_type"
            control={control}
            render={({ field }) => (
              <div className="flex gap-4">
                {(
                  [
                    { value: 'general', label: t('form.couponTypeGeneral') },
                    { value: 'product', label: t('form.couponTypeProducts') },
                    { value: 'vendor', label: t('form.couponTypeVendors') },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 ${isEditMode || hasAffiliateId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    <input
                      type="radio"
                      checked={field.value === opt.value}
                      onChange={() => field.onChange(opt.value)}
                      disabled={isEditMode || hasAffiliateId}
                      className="accent-primary disabled:cursor-not-allowed"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          />
        </Box>

        {/* Products MultiSelect */}
        {couponType === 'product' && (
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify
                icon="solar:cart-large-2-bold"
                className="text-primary"
                width={24}
                height={24}
              />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.couponTypeProducts')}
              </Typography>
            </Box>
            <RHFMultiSelect
              name="product_ids"
              options={productOptions}
              label={t('form.selectProducts')}
              placeholder={hasAffiliateId ? t('form.couponManagedByAffiliate') : t('form.couponSearchSelectProducts')}
              fullWidth
              isDisabled={hasAffiliateId}
            />
          </Box>
        )}

        {/* Vendors MultiSelect */}
        {couponType === 'vendor' && (
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify
                icon="solar:users-group-rounded-bold"
                className="text-primary"
                width={24}
                height={24}
              />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.couponTypeVendors')}
              </Typography>
            </Box>
            <RHFMultiSelect
              name="vendor_ids"
              options={vendorOptions}
              label={t('form.selectVendors')}
              placeholder={hasAffiliateId ? t('form.couponManagedByAffiliate') : t('form.couponSearchSelectVendors')}
              fullWidth
              isDisabled={hasAffiliateId}
            />
          </Box>
        )}

        {/* Name EN */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('form.couponNameEn')}
          </Typography>
          <RHFTextField name="name.en" placeholder={t('form.summerSaleEn')} fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('form.couponNameAr')}
          </Typography>
          <RHFTextField name="name.ar" placeholder={t('form.summerSaleAr')} dir="rtl" fullWidth />
        </Box>

        {/* Code */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('form.codeLabel')}
          </Typography>
          <RHFTextField name="code" placeholder={t('form.codePlaceholder')} fullWidth />
        </Box>

        {/* Discount Type & Value */}
        <Box className="flex gap-4 flex-wrap">
          <Box className="flex-1 min-w-[140px]">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              {t('form.discountType')}
            </Typography>
            <RHFSelect
              name="discount_type"
              placeholder={t('form.discountType')}
              options={[
                { value: 'percentage', label: t('form.discountTypePercentage') },
                { value: 'fixed', label: t('form.discountTypeFixed') },
              ]}
            />
          </Box>
          <Box className="flex-1 min-w-[140px]">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              {t('form.discountValue')}
            </Typography>
            <RHFTextField
              name="discount_value"
              placeholder={watch('discount_type') === 'percentage' ? '20' : '50'}
              type="number"
              fullWidth
            />
          </Box>
        </Box>

        {/* Start Date */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('form.startAt')}
          </Typography>
          <RHFTextField name="start_at" type="datetime-local" fullWidth />
        </Box>

        {/* End Date */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('form.endAt')}
          </Typography>
          <RHFTextField name="end_at" type="datetime-local" fullWidth />
        </Box>

        {/* Max Uses */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('form.maxUses')}
          </Typography>
          <RHFTextField name="max_uses" type="number" placeholder={t('form.maxUsesPlaceholder')} fullWidth />
        </Box>

        {/* Active */}
        <Box className="group">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                />
                <Typography variant="body2">{t('active')}</Typography>
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
