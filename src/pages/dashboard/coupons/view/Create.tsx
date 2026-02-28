import type { MultiSelectOption } from '@/shared/ui/multi-select';
import type { CouponDetailsData } from '@/pages/dashboard/coupons/types/coupon.types';

import { toast } from 'react-toastify';
import { formatTranslated } from '@/utils/format-translated';
import { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useFetchVendors } from '@/pages/dashboard/vendor/hooks/vendor';
import { useFetchProducts } from '@/pages/dashboard/products/hooks/product';
import {
  CouponSchema,
  type CouponFormValues,
} from '@/pages/dashboard/coupons/validation/coupon.validation';
import {
  useCreateCoupon,
  useUpdateCoupon,
  useFetchCouponById,
} from '@/pages/dashboard/coupons/hooks/coupon';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Coupon ${CONFIG.appName}` };

function toISODateTimeLocal(d: string): string {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export default function CreatePage() {
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

  const products = productsResponse?.data?.items || [];
  const vendors = vendorsResponse?.data?.items || [];

  const productOptions: MultiSelectOption[] = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: formatTranslated(p.name) || `Product #${p.id}`,
      })),
    [products]
  );

  const vendorOptions: MultiSelectOption[] = useMemo(
    () =>
      vendors.map((v) => ({
        value: v.id,
        label: formatTranslated(v.name) || `Vendor #${v.id}`,
      })),
    [vendors]
  );

  const defaultValues: CouponFormValues = {
    name: { en: '', ar: '' },
    code: '',
    affiliate_id: undefined,
    discount_type: 'percentage',
    discount_value: '',
    start_at: '',
    end_at: '',
    max_uses: 0,
    is_active: true,
    coupon_type: 'general',
    product_ids: [],
    vendor_ids: [],
  };

  const methods = useForm<CouponFormValues>({
    resolver: zodResolver(CouponSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const couponType = watch('coupon_type');
  const affiliateId = watch('affiliate_id');
  const hasAffiliateId = !!affiliateId && affiliateId > 0;

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
        max_uses: source.max_uses ?? 0,
        is_active: source.is_active ?? true,
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
        start_at: data.start_at,
        end_at: data.end_at,
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
        toast.success('Coupon updated successfully');
        navigate('/coupons');
      } else {
        await createCouponMutation.mutateAsync(payload);
        toast.success('Coupon created successfully');
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
        {isEditMode ? `Edit Coupon | ${metadata.title}` : `Create Coupon | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Coupon' : 'Create New Coupon'}
        description={
          isEditMode
            ? 'Update coupon details and scope'
            : 'Add a new coupon (general, product-specific, or vendor-specific)'
        }
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingCoupon}
        loadingText="Loading coupon..."
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update Coupon' : 'Create Coupon'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Affiliate ID */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:user-id-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Affiliate ID (optional)
            </Typography>
          </Box>
          <RHFTextField
            name="affiliate_id"
            type="number"
            placeholder="Leave empty for non-affiliate coupons"
            fullWidth
          />
          {hasAffiliateId && (
            <Typography variant="caption" className="text-muted-foreground mt-1 block">
              Product/Vendor selection is managed by the affiliate system.
            </Typography>
          )}
        </Box>

        {/* Coupon Type */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Coupon Type
            </Typography>
          </Box>
          <Controller
            name="coupon_type"
            control={control}
            render={({ field }) => (
              <div className="flex gap-4">
                {(
                  [
                    { value: 'general', label: 'General' },
                    { value: 'product', label: 'Products' },
                    { value: 'vendor', label: 'Vendors' },
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
                Products
              </Typography>
            </Box>
            <RHFMultiSelect
              name="product_ids"
              options={productOptions}
              label="Select products"
              placeholder={hasAffiliateId ? 'Managed by affiliate' : 'Search and select products...'}
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
                Vendors
              </Typography>
            </Box>
            <RHFMultiSelect
              name="vendor_ids"
              options={vendorOptions}
              label="Select vendors"
              placeholder={hasAffiliateId ? 'Managed by affiliate' : 'Search and select vendors...'}
              fullWidth
              isDisabled={hasAffiliateId}
            />
          </Box>
        )}

        {/* Name EN */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            Name (English)
          </Typography>
          <RHFTextField name="name.en" placeholder="e.g., Summer Sale" fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            Name (Arabic)
          </Typography>
          <RHFTextField name="name.ar" placeholder="تخفيضات الصيف" dir="rtl" fullWidth />
        </Box>

        {/* Code */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            Code
          </Typography>
          <RHFTextField name="code" placeholder="SUMMER20" fullWidth />
        </Box>

        {/* Discount Type & Value */}
        <Box className="flex gap-4 flex-wrap">
          <Box className="flex-1 min-w-[140px]">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Discount Type
            </Typography>
            <Controller
              name="discount_type"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              )}
            />
          </Box>
          <Box className="flex-1 min-w-[140px]">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Discount Value
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
            Start Date
          </Typography>
          <RHFTextField name="start_at" type="datetime-local" fullWidth />
        </Box>

        {/* End Date */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            End Date
          </Typography>
          <RHFTextField name="end_at" type="datetime-local" fullWidth />
        </Box>

        {/* Max Uses */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            Max Uses
          </Typography>
          <RHFTextField name="max_uses" type="number" placeholder="0 = unlimited" fullWidth />
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
                <Typography variant="body2">Active</Typography>
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
