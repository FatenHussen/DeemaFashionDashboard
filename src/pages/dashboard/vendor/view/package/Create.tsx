import type { VendorPackageDetails } from '@/pages/dashboard/vendor/types/vendor-package.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router';
import {
  useCreateVendorPackage,
  useUpdateVendorPackage,
  useFetchVendorPackageById,
} from '@/pages/dashboard/vendor/hooks/vendor-package';
import {
  REPORT_LEVELS,
  VendorPackageSchema,
  type VendorPackageFormValues,
} from '@/pages/dashboard/vendor/validation/vendor-package.validation';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const defaultValues: VendorPackageFormValues = {
  name: { ar: '', en: '' },
  description: { ar: '', en: '' },
  price: 0,
  duration_days: 30,
  max_products: 0,
  commission_rate: 0,
  commission_per_order: 0,
  is_active: true,
  is_featured: false,
  has_premium_badge: false,
  sort_order: 0,
  search_priority: 1,
  max_campaigns: 0,
  has_banner_ad: false,
  has_sales_reports: true,
  has_analytics: false,
  report_level: 'basic',
  order_priority: 1,
  can_set_prep_time: false,
  custom_shipping_options: false,
  has_vendor_delivery: false,
  activation_fee_waived: false,
};

function mapDetailsToForm(source: VendorPackageDetails): VendorPackageFormValues {
  const name = typeof source.name === 'object' ? source.name : { en: String(source.name || ''), ar: String(source.name || '') };
  const description =
    typeof source.description === 'object'
      ? source.description
      : { en: '', ar: String(source.description || '') };
  return {
    name: { en: (name as any)?.en ?? '', ar: (name as any)?.ar ?? '' },
    description: { en: (description as any)?.en ?? '', ar: (description as any)?.ar ?? '' },
    price: source.price ?? 0,
    duration_days: source.duration_days ?? 30,
    max_products: source.max_products ?? 0,
    commission_rate: source.commission_rate ?? 0,
    commission_per_order: source.commission_per_order ?? 0,
    is_active: source.is_active ?? true,
    is_featured: source.is_featured ?? false,
    has_premium_badge: source.has_premium_badge ?? false,
    sort_order: 0,
    search_priority: source.search_priority ?? 1,
    max_campaigns: source.max_campaigns ?? 0,
    has_banner_ad: source.has_banner_ad ?? false,
    has_sales_reports: source.has_sales_reports ?? true,
    has_analytics: source.has_analytics ?? false,
    report_level: ((REPORT_LEVELS as readonly string[]).includes(source.report_level ?? '')
      ? source.report_level
      : 'basic') as (typeof REPORT_LEVELS)[number],
    order_priority: source.order_priority ?? 1,
    can_set_prep_time: source.can_set_prep_time ?? false,
    custom_shipping_options: source.custom_shipping_options ?? false,
    has_vendor_delivery: source.has_vendor_delivery ?? false,
    activation_fee_waived: source.activation_fee_waived ?? false,
  };
}

const metadata = { title: `Vendor Package | ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const packageFromState = location.state?.package as VendorPackageDetails | undefined;
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchVendorPackageById(id || '');
  const createMutation = useCreateVendorPackage();
  const updateMutation = useUpdateVendorPackage();

  const methods = useForm<VendorPackageFormValues>({
    resolver: zodResolver(VendorPackageSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    const source = isEditMode ? (detailsResponse?.data ?? packageFromState) : null;
    if (source) reset(mapDetailsToForm(source));
  }, [detailsResponse?.data, packageFromState, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage =
    (createMutation.error as any)?.response?.data?.message ||
    (createMutation.error as any)?.message ||
    (updateMutation.error as any)?.response?.data?.message ||
    (updateMutation.error as any)?.message ||
    null;

  const onSubmit = async (data: VendorPackageFormValues) => {
    try {
      const payload = { ...data };
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success('Vendor package updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Vendor package created successfully');
      }
      navigate('/vendor-packages');
    } catch {}
  };

  if (isEditMode && isLoadingDetails && !packageFromState) return <LoadingScreen />;

  const SwitchField = ({
    name,
    label,
  }: {
    name: keyof VendorPackageFormValues;
    label: string;
  }) => (
    <Box className="flex items-center justify-between rounded-lg border p-3">
      <Typography variant="body2">{label}</Typography>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Switch
            checked={field.value as boolean}
            onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
          />
        )}
      />
    </Box>
  );

  return (
    <>
      <title>{isEditMode ? `Edit Vendor Package | ${metadata.title}` : `Create Vendor Package | ${metadata.title}`}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/vendor-packages')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Vendor Package' : 'Create Vendor Package'}
        description={isEditMode ? 'Update vendor package details' : 'Add a new vendor subscription package'}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText="Loading vendor package..."
        maxWidth="4xl"
        submitLabel={isEditMode ? 'Update Package' : 'Create Package'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        <Box className="col-span-2">
          <Typography variant="subtitle1" className="mb-3 font-semibold">
            Name
          </Typography>
          <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Box>
              <Typography variant="caption" className="text-muted-foreground">English *</Typography>
              <RHFTextField name="name.en" placeholder="Package name in English" fullWidth />
            </Box>
            <Box>
              <Typography variant="caption" className="text-muted-foreground">Arabic *</Typography>
              <RHFTextField name="name.ar" placeholder="اسم الباقة بالعربي" dir="rtl" fullWidth />
            </Box>
          </Box>
        </Box>

        <Box className="col-span-2">
          <Typography variant="subtitle1" className="mb-3 font-semibold">
            Description
          </Typography>
          <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Box>
              <Typography variant="caption" className="text-muted-foreground">English</Typography>
              <Controller
                name="description.en"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Description in English"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                )}
              />
            </Box>
            <Box>
              <Typography variant="caption" className="text-muted-foreground">Arabic</Typography>
              <Controller
                name="description.ar"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    dir="rtl"
                    placeholder="الوصف بالعربي"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                )}
              />
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Price *</Typography>
          <RHFTextField name="price" type="number" placeholder="99.99" fullWidth />
        </Box>
        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Duration (Days) *</Typography>
          <RHFTextField name="duration_days" type="number" placeholder="30" fullWidth />
        </Box>
        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Max Products</Typography>
          <RHFTextField name="max_products" type="number" placeholder="50" fullWidth />
        </Box>
        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Commission Rate (%)</Typography>
          <RHFTextField name="commission_rate" type="number" placeholder="5" fullWidth />
        </Box>
        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Commission Per Order</Typography>
          <RHFTextField name="commission_per_order" type="number" placeholder="0" fullWidth />
        </Box>

        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Sort Order</Typography>
          <RHFTextField name="sort_order" type="number" placeholder="0" fullWidth />
        </Box>
        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Search Priority</Typography>
          <RHFTextField name="search_priority" type="number" placeholder="1" fullWidth />
        </Box>
        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Max Campaigns</Typography>
          <RHFTextField name="max_campaigns" type="number" placeholder="0" fullWidth />
        </Box>
        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Order Priority</Typography>
          <RHFTextField name="order_priority" type="number" placeholder="1" fullWidth />
        </Box>
        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold">Report Level</Typography>
          <Controller
            name="report_level"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {REPORT_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            )}
          />
        </Box>

        <Box className="col-span-2">
          <Typography variant="subtitle1" className="mb-3 font-semibold">
            Features (Toggle)
          </Typography>
          <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <SwitchField name="is_active" label="Active" />
            <SwitchField name="is_featured" label="Featured" />
            <SwitchField name="has_premium_badge" label="Premium Badge" />
            <SwitchField name="has_banner_ad" label="Banner Ad" />
            <SwitchField name="has_sales_reports" label="Sales Reports" />
            <SwitchField name="has_analytics" label="Analytics" />
            <SwitchField name="can_set_prep_time" label="Can Set Prep Time" />
            <SwitchField name="custom_shipping_options" label="Custom Shipping" />
            <SwitchField name="has_vendor_delivery" label="Vendor Delivery" />
            <SwitchField name="activation_fee_waived" label="Activation Fee Waived" />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
