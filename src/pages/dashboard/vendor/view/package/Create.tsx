import type { VendorPackageDetails } from '@/pages/dashboard/vendor/types/vendor-package.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
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
import { Iconify } from 'src/shared/components/iconify';
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
    is_active: Boolean(source.is_active),
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

export default function CreatePage() {
  const { t } = useTranslation('table');
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
        toast.success(t('form.vendorPackageUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.vendorPackageCreatedSuccess'));
      }
      navigate('/vendor-packages');
    } catch { return; }
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
      <title>
        {isEditMode
          ? t('form.vendorPackageEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.vendorPackageCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/vendor-packages')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editVendorPackage') : t('form.createVendorPackage')}
        description={isEditMode ? t('form.editVendorPackageDesc') : t('form.createVendorPackageDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingVendorPackage')}
        submitLabel={isEditMode ? t('form.updateVendorPackageSubmit') : t('form.createVendorPackageSubmit')}
        submittingLabel={isEditMode ? t('form.updatingVendorPackage') : t('form.creatingVendorPackage')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorPkgSectionName')}</Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.vendorPkgLabelEnglishRequired')}</Typography>
              <RHFTextField name="name.en" placeholder={t('form.packageNameEnPlaceholder')} fullWidth />
            </Box>
            <Box>
              <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.vendorPkgLabelArabicRequired')}</Typography>
              <RHFTextField name="name.ar" placeholder={t('form.packageNameArShort')} dir="rtl" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Descriptions ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:text-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorPkgSectionDescription')}</Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.descriptionEn')}</Typography>
              <Controller
                name="description.en"
                control={control}
                render={({ field }) => (
                  <textarea {...field} rows={3} placeholder={t('form.descriptionEnPlaceholder2')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                )}
              />
            </Box>
            <Box>
              <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.descriptionAr')}</Typography>
              <Controller
                name="description.ar"
                control={control}
                render={({ field }) => (
                  <textarea {...field} rows={3} dir="rtl" placeholder={t('form.packageDescriptionAr')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Pricing & Limits ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:tag-price-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.vendorPkgFieldPrice')} & {t('form.vendorPkgFieldMaxProducts')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldPrice')}</Typography>
              <RHFTextField name="price" type="number" placeholder={t('form.placeholderPrice99')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldDurationDays')}</Typography>
              <RHFTextField name="duration_days" type="number" placeholder={t('form.placeholderThirty')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldMaxProducts')}</Typography>
              <RHFTextField name="max_products" type="number" placeholder={t('form.placeholderFifty')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldCommissionRate')}</Typography>
              <RHFTextField name="commission_rate" type="number" placeholder={t('form.placeholderFive')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldCommissionPerOrder')}</Typography>
              <RHFTextField name="commission_per_order" type="number" placeholder={t('form.placeholderZero')} fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Priority & Reporting ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:sort-bold" className="text-sky-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.vendorPkgFieldSortOrder')} & {t('form.vendorPkgFieldReportLevel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldSortOrder')}</Typography>
              <RHFTextField name="sort_order" type="number" placeholder={t('form.placeholderZero')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldSearchPriority')}</Typography>
              <RHFTextField name="search_priority" type="number" placeholder={t('form.placeholderOne')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldMaxCampaigns')}</Typography>
              <RHFTextField name="max_campaigns" type="number" placeholder={t('form.placeholderZero')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldOrderPriority')}</Typography>
              <RHFTextField name="order_priority" type="number" placeholder={t('form.placeholderOne')} fullWidth />
            </Box>
            <Box className="md:col-span-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.vendorPkgFieldReportLevel')}</Typography>
              <Controller
                name="report_level"
                control={control}
                render={({ field }) => (
                  <select {...field} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {REPORT_LEVELS.map((l) => (
                      <option key={l} value={l}>{t(`form.reportLevelOption_${l}`)}</option>
                    ))}
                  </select>
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Features ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bolt-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorPkgFeaturesSection')}</Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SwitchField name="is_active" label={t('active')} />
            <SwitchField name="is_featured" label={t('form.featured')} />
            <SwitchField name="has_premium_badge" label={t('form.premiumBadge')} />
            <SwitchField name="has_banner_ad" label={t('form.bannerAd')} />
            <SwitchField name="has_sales_reports" label={t('form.salesReports')} />
            <SwitchField name="has_analytics" label={t('form.analytics')} />
            <SwitchField name="can_set_prep_time" label={t('form.canSetPrepTime')} />
            <SwitchField name="custom_shipping_options" label={t('form.customShipping')} />
            <SwitchField name="has_vendor_delivery" label={t('form.vendorDelivery')} />
            <SwitchField name="activation_fee_waived" label={t('form.activationFeeWaived')} />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
